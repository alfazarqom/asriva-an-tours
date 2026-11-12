import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PAYWUZ_API_BASE = 'https://api.paywuz.id/v2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: { code: 'method_not_allowed', message: 'Method harus POST.' } }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';

    if (!orderId) {
      return jsonResponse(
        { error: { code: 'invalid_request', message: 'orderId wajib diisi.', field: 'orderId' } },
        400
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: existingTx } = await supabase
      .from('paywuz_transactions')
      .select('order_id')
      .eq('order_id', orderId)
      .maybeSingle();

    if (!existingTx) {
      await supabase
        .from('bookings')
        .update({
          trip_category: 'cancelled',
          booking_status: 'Dibatalkan',
          payment_status: 'Dibatalkan'
        })
        .eq('booking_reference', orderId);

      return jsonResponse({ data: null, bookingCancelled: true }, 200);
    }

    const apiKey = getPaywuzApiKey();
    const upstream = await fetch(`${PAYWUZ_API_BASE}/transactions/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const upstreamJson = await upstream.json();
    if (!upstream.ok || !upstreamJson?.data) {
      return jsonResponse(upstreamJson, upstream.status);
    }

    const tx = upstreamJson.data;

    await supabase
      .from('paywuz_transactions')
      .update({
        status: tx.status,
        paid_at: tx.paidAt ?? null
      })
      .eq('order_id', orderId);

    await supabase
      .from('bookings')
      .update({
        trip_category: 'cancelled',
        booking_status: 'Dibatalkan',
        payment_status: 'Dibatalkan'
      })
      .eq('booking_reference', orderId);

    return jsonResponse({ data: tx }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membatalkan transaksi Paywuz v2.';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
