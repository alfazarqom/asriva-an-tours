import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AULAA_API_BASE = 'https://api.aulaa.co/v1';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

type AulaaStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';

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

    const supabase = getSupabaseAdmin();
    const { data: existingTx, error: txLookupError } = await supabase
      .from('aulaa_transactions')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (txLookupError || !existingTx?.id) {
      return jsonResponse(
        { error: { code: 'not_found', message: 'Transaksi Aulaa untuk Kode Booking ini tidak ditemukan.' } },
        404
      );
    }

    const apiKey = getAulaaApiKey();
    const upstream = await fetch(`${AULAA_API_BASE}/payments/${encodeURIComponent(existingTx.id)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const upstreamJson = await upstream.json();
    const p =
      upstreamJson?.data && typeof upstreamJson.data === 'object'
        ? (upstreamJson.data as Record<string, unknown>)
        : (upstreamJson as Record<string, unknown>);

    if (!upstream.ok || !p?.id) {
      const errMessage =
        (upstreamJson?.error as { message?: string } | undefined)?.message ||
        (upstreamJson?.message as string | undefined) ||
        'Gagal memeriksa status pembayaran Aulaa.';
      return jsonResponse({ error: { code: 'aulaa_error', message: errMessage } }, upstream.status);
    }

    const nextStatus = ((p.status as string) || existingTx.status || 'pending') as AulaaStatus;
    const amount = Number(p.amount ?? existingTx.amount);
    const feeAmount = Number(p.fee_amount ?? existingTx.fee_amount ?? 0);
    const totalAmount = Number(p.total_amount ?? amount + feeAmount);
    const paymentMethod = p.payment_method ? String(p.payment_method) : existingTx.payment_method;
    const paymentNumber = p.payment_number ? String(p.payment_number) : existingTx.payment_number;
    const paymentLink = String(p.payment_link || existingTx.payment_link);
    const expiresAt = (p.expires_at ?? p.expired_at ?? existingTx.expires_at ?? null) as string | null;
    const paidAt = (p.paid_at ?? existingTx.paid_at ?? null) as string | null;

    const mapped = mapAulaaStatusToBookingState(nextStatus);

    await supabase
      .from('aulaa_transactions')
      .update({
        status: nextStatus,
        payment_method: paymentMethod,
        amount,
        fee_amount: feeAmount,
        total_amount: totalAmount,
        payment_link: paymentLink,
        payment_number: paymentNumber,
        expires_at: expiresAt,
        paid_at: paidAt,
        raw_response: upstreamJson
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

    return jsonResponse(
      {
        data: {
          id: existingTx.id,
          orderId,
          status: nextStatus,
          paymentMethod,
          paymentMethodName: existingTx.payment_method_name ?? paymentMethod,
          paymentMethodType: existingTx.payment_method_type ?? null,
          amount,
          feeAmount,
          totalAmount,
          paymentLink,
          paymentNumber,
          currency: existingTx.currency || 'IDR',
          countryCode: existingTx.country_code || 'ID',
          expiresAt,
          paidAt,
          createdAt: existingTx.aulaa_created_at ?? null
        }
      },
      200
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memeriksa status transaksi Aulaa.';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
