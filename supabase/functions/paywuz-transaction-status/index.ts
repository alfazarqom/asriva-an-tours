import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PAYWUZ_API_BASE = 'https://api.paywuz.id/v2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

type PaywuzStatus = 'pending' | 'settlement' | 'success' | 'failed' | 'cancelled';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let orderId = '';
    if (req.method === 'GET') {
      orderId = new URL(req.url).searchParams.get('orderId')?.trim() || '';
    } else if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    } else {
      return jsonResponse({ error: { code: 'method_not_allowed', message: 'Gunakan GET atau POST.' } }, 405);
    }

    if (!orderId) {
      return jsonResponse(
        { error: { code: 'invalid_request', message: 'orderId wajib diisi.', field: 'orderId' } },
        400
      );
    }

    const apiKey = getPaywuzApiKey();
    const upstream = await fetch(`${PAYWUZ_API_BASE}/transactions/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const upstreamJson = await upstream.json();
    if (!upstream.ok || !upstreamJson?.data) {
      return jsonResponse(upstreamJson, upstream.status);
    }

    const tx = upstreamJson.data;
    const supabase = getSupabaseAdmin();
    const mapped = mapPaywuzStatusToBookingState(tx.status as PaywuzStatus);

    await supabase
      .from('paywuz_transactions')
      .update({
        status: tx.status,
        method_type: tx.method?.type ?? null,
        method_code: tx.method?.code ?? null,
        method_name: tx.method?.name ?? null,
        amount: tx.amount,
        fee_amount: tx.fee?.amount ?? 0,
        fee_paid_by: tx.fee?.paidBy ?? 'customer',
        total_payment: tx.totalPayment,
        net_amount: tx.netAmount,
        payment_url: tx.payment?.url ?? '',
        va_number: tx.payment?.vaNumber ?? null,
        qr_string: tx.payment?.qrString ?? null,
        retail_code: tx.payment?.retailCode ?? null,
        paid_at: tx.paidAt ?? null,
        expires_at: tx.expiresAt ?? null
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

    return jsonResponse({ data: tx }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memeriksa status transaksi Paywuz v2.';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
