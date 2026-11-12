import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type PaywuzStatus = 'pending' | 'settlement' | 'success' | 'failed' | 'cancelled';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

function getPaywuzApiKey(): string {
  const apiKey = Deno.env.get('PAYWUZ_API_KEY')?.trim();
  if (!apiKey) {
    throw new Error('PAYWUZ_API_KEY belum dikonfigurasi pada Supabase Edge Function Secrets.');
  }
  return apiKey;
}

function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim();
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak tersedia.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

function mapPaywuzStatusToBookingState(status: PaywuzStatus): {
  trip_category: 'upcoming' | 'cancelled';
  booking_status: string;
  payment_status: string;
} {
  switch (status) {
    case 'settlement':
      return {
        trip_category: 'upcoming',
        booking_status: 'Terkonfirmasi - Menunggu Settlement',
        payment_status: 'Settlement (Menunggu Dana Masuk)'
      };
    case 'success':
      return {
        trip_category: 'upcoming',
        booking_status: 'Terkonfirmasi - Lunas',
        payment_status: 'Lunas (Terverifikasi)'
      };
    case 'failed':
      return {
        trip_category: 'upcoming',
        booking_status: 'Menunggu Pembayaran (Paywuz)',
        payment_status: 'Pembayaran Gagal'
      };
    case 'cancelled':
      return {
        trip_category: 'cancelled',
        booking_status: 'Dibatalkan',
        payment_status: 'Dibatalkan'
      };
    case 'pending':
    default:
      return {
        trip_category: 'upcoming',
        booking_status: 'Menunggu Pembayaran (Paywuz)',
        payment_status: 'Belum Dibayar - Menunggu Pembayaran'
      };
  }
}

async function verifyPaywuzWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  apiKey: string
): Promise<boolean> {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(apiKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(rawBody));
  const expectedHex = Array.from(new Uint8Array(signatureBytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  const expectedHeader = `sha256=${expectedHex}`;

  if (signatureHeader.length !== expectedHeader.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < signatureHeader.length; i++) {
    diff |= signatureHeader.charCodeAt(i) ^ expectedHeader.charCodeAt(i);
  }
  return diff === 0;
}

interface PaywuzWebhookPayload {
  event: 'transaction.settlement' | 'transaction.paid' | 'transaction.failed' | 'transaction.cancelled';
  data: {
    id: string;
    orderId: string;
    amount: number;
    fee: number;
    totalPayment: number;
    paymentMethod?: string;
    status: PaywuzStatus;
    paidAt?: string | null;
  };
  timestamp: string;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: { code: 'method_not_allowed', message: 'Method harus POST.' } }, 405);
  }

  try {
    const apiKey = getPaywuzApiKey();
    const rawBody = await req.text();
    const signature = req.headers.get('X-Paywuz-Signature');
    const eventHeader = req.headers.get('X-Paywuz-Event');
    const deliveryId = req.headers.get('X-Paywuz-Delivery');

    const isValidSignature = await verifyPaywuzWebhookSignature(rawBody, signature, apiKey);
    if (!isValidSignature) {
      return jsonResponse(
        { error: { code: 'unauthorized', message: 'Invalid X-Paywuz-Signature' } },
        401
      );
    }

    const payload = JSON.parse(rawBody) as PaywuzWebhookPayload;
    const orderId = payload?.data?.orderId;
    const eventName = eventHeader || payload?.event;

    if (!orderId || !eventName) {
      return jsonResponse(
        { error: { code: 'invalid_request', message: 'Payload webhook tidak valid.' } },
        400
      );
    }

    const supabase = getSupabaseAdmin();

    if (deliveryId) {
      const { data: existingDelivery } = await supabase
        .from('paywuz_webhook_deliveries')
        .select('delivery_id')
        .eq('delivery_id', deliveryId)
        .maybeSingle();

      if (existingDelivery) {
        return jsonResponse({ received: true, deduplicated: true }, 200);
      }
    }

    const nextStatus: PaywuzStatus =
      eventName === 'transaction.settlement'
        ? 'settlement'
        : eventName === 'transaction.paid'
          ? 'success'
          : eventName === 'transaction.failed'
            ? 'failed'
            : eventName === 'transaction.cancelled'
              ? 'cancelled'
              : payload.data.status;

    const mapped = mapPaywuzStatusToBookingState(nextStatus);

    await supabase
      .from('paywuz_transactions')
      .update({
        status: nextStatus,
        fee_amount: payload.data.fee,
        total_payment: payload.data.totalPayment,
        paid_at: payload.data.paidAt ?? null
      })
      .eq('order_id', orderId);

    await supabase
      .from('bookings')
      .update({
        trip_category: mapped.trip_category,
        booking_status: mapped.booking_status,
        payment_status: mapped.payment_status
      })
      .eq('booking_reference', orderId);

    if (deliveryId) {
      await supabase.from('paywuz_webhook_deliveries').insert({
        delivery_id: deliveryId,
        event: eventName,
        order_id: orderId,
        payload
      });
    }

    return jsonResponse({ received: true, orderId, status: nextStatus }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
