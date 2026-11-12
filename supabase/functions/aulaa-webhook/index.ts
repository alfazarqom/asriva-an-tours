import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type AulaaStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';

interface AulaaWebhookPayload {
  id?: string;
  order_id: string;
  amount: number;
  fee_amount?: number;
  total_amount?: number;
  currency?: string;
  country_code?: string;
  status: AulaaStatus;
  payment_method?: string;
  paid_at?: string | null;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

function getAulaaWebhookSecret(): string {
  const secret = Deno.env.get('AULAA_WEBHOOK_SECRET')?.trim();
  if (!secret) {
    throw new Error('AULAA_WEBHOOK_SECRET belum dikonfigurasi pada Supabase Edge Function Secrets.');
  }
  return secret;
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

function mapAulaaStatusToBookingState(status: AulaaStatus): {
  trip_category: 'upcoming' | 'cancelled';
  booking_status: string;
  payment_status: string;
} {
  switch (status) {
    case 'paid':
      return {
        trip_category: 'upcoming',
        booking_status: 'Terkonfirmasi - Lunas',
        payment_status: 'Lunas (Terverifikasi)'
      };
    case 'expired':
      return {
        trip_category: 'cancelled',
        booking_status: 'Kadaluarsa',
        payment_status: 'Kadaluarsa (Melewati Batas Waktu)'
      };
    case 'cancelled':
      return {
        trip_category: 'cancelled',
        booking_status: 'Dibatalkan',
        payment_status: 'Dibatalkan'
      };
    case 'failed':
      return {
        trip_category: 'upcoming',
        booking_status: 'Menunggu Pembayaran (Aulaa)',
        payment_status: 'Pembayaran Gagal'
      };
    case 'pending':
    default:
      return {
        trip_category: 'upcoming',
        booking_status: 'Menunggu Pembayaran (Aulaa)',
        payment_status: 'Belum Dibayar - Menunggu Pembayaran'
      };
  }
}

async function verifyAulaaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string
): Promise<boolean> {
  if (!signatureHeader) {
    return false;
  }

  const normalizedSig = signatureHeader.trim().toLowerCase();
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(rawBody));
  const expectedHex = Array.from(new Uint8Array(signatureBytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  if (normalizedSig.length !== expectedHex.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < normalizedSig.length; i++) {
    diff |= normalizedSig.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') {
    return jsonResponse({ ok: true, service: 'ASRIVA Aulaa v1 Webhook' }, 200);
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: { code: 'method_not_allowed', message: 'Method harus POST.' } }, 405);
  }

  try {
    const webhookSecret = getAulaaWebhookSecret();
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature');

    const isValidSignature = await verifyAulaaWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValidSignature) {
      return jsonResponse({ error: { code: 'unauthorized', message: 'Invalid X-Webhook-Signature' } }, 401);
    }

    const payload = JSON.parse(rawBody) as AulaaWebhookPayload;
    const orderId = payload?.order_id;
    const nextStatus = payload?.status;

    if (!orderId || !nextStatus) {
      return jsonResponse(
        { error: { code: 'invalid_request', message: 'Payload webhook Aulaa tidak valid.' } },
        400
      );
    }

    const supabase = getSupabaseAdmin();
    const mapped = mapAulaaStatusToBookingState(nextStatus);

    const txUpdate: Record<string, unknown> = {
      status: nextStatus
    };
    if (payload.payment_method) txUpdate.payment_method = payload.payment_method;
    if (typeof payload.fee_amount === 'number') txUpdate.fee_amount = payload.fee_amount;
    if (typeof payload.total_amount === 'number') txUpdate.total_amount = payload.total_amount;
    if (payload.paid_at !== undefined) {
      txUpdate.paid_at = payload.paid_at;
    } else if (nextStatus === 'paid') {
      txUpdate.paid_at = new Date().toISOString();
    }

    await supabase.from('aulaa_transactions').update(txUpdate).eq('order_id', orderId);

    await supabase
      .from('bookings')
      .update({
        trip_category: mapped.trip_category,
        booking_status: mapped.booking_status,
        payment_status: mapped.payment_status
      })
      .eq('booking_reference', orderId);

    await supabase.from('aulaa_webhook_events').insert({
      order_id: orderId,
      status: nextStatus,
      payment_method: payload.payment_method ?? null,
      amount: typeof payload.amount === 'number' ? Math.round(payload.amount) : null,
      payload
    });

    return jsonResponse({ received: true, order_id: orderId, status: nextStatus }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
