import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AULAA_API_BASE = 'https://api.aulaa.co/v1';

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

function getAulaaApiKey(): string {
  const apiKey = Deno.env.get('AULAA_API_KEY')?.trim();
  if (!apiKey) {
    throw new Error('AULAA_API_KEY belum dikonfigurasi pada Supabase Edge Function Secrets.');
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
      .from('aulaa_transactions')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (!existingTx?.id) {
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

    const apiKey = getAulaaApiKey();
    const upstream = await fetch(`${AULAA_API_BASE}/payments/${encodeURIComponent(existingTx.id)}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const upstreamJson = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const errMessage =
        (upstreamJson?.error as { message?: string } | undefined)?.message ||
        (upstreamJson?.message as string | undefined) ||
        'Transaksi tidak dapat dibatalkan (mungkin sudah dibayar atau kadaluarsa).';
      return jsonResponse({ error: { code: 'aulaa_cancel_failed', message: errMessage } }, upstream.status);
    }

    const p =
      upstreamJson?.data && typeof upstreamJson.data === 'object'
        ? (upstreamJson.data as Record<string, unknown>)
        : (upstreamJson as Record<string, unknown>);

    const nextStatus = (p?.status as string) || 'cancelled';

    await supabase
      .from('aulaa_transactions')
      .update({
        status: nextStatus,
        raw_response: upstreamJson
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

    return jsonResponse(
      {
        data: {
          id: existingTx.id,
          orderId,
          status: nextStatus,
          paymentMethod: existingTx.payment_method,
          paymentMethodName: existingTx.payment_method_name,
          paymentMethodType: existingTx.payment_method_type,
          amount: existingTx.amount,
          feeAmount: existingTx.fee_amount,
          totalAmount: existingTx.total_amount,
          paymentLink: existingTx.payment_link,
          paymentNumber: existingTx.payment_number,
          currency: existingTx.currency || 'IDR',
          countryCode: existingTx.country_code || 'ID',
          expiresAt: existingTx.expires_at ?? null,
          paidAt: existingTx.paid_at ?? null,
          createdAt: existingTx.aulaa_created_at ?? null
        }
      },
      200
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membatalkan transaksi Aulaa.';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
