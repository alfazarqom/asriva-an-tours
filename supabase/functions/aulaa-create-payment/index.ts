import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AULAA_API_BASE = 'https://api.aulaa.co/v1';
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
type AulaaStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed' | 'refunded';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
function getAdmin() {
  const url = Deno.env.get('SUPABASE_URL')?.trim();
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();
  if (!url || !key) throw new Error('Supabase server configuration is incomplete.');
  return createClient(url, key, { auth: { persistSession: false } });
}
function getAulaaApiKey() {
  const key = Deno.env.get('AULAA_API_KEY')?.trim();
  if (!key) throw new Error('AULAA_API_KEY is not configured.');
  return key;
}
function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function parseAulaaResponse(response: Response): Promise<Record<string, unknown>> {
  return await response.json().catch(() => ({})) as Record<string, unknown>;
}
function unwrap(value: Record<string, unknown>) {
  return value.data && typeof value.data === 'object' ? value.data as Record<string, unknown> : value;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: { code: 'method_not_allowed', message: 'Method harus POST.' } }, 405);

  try {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    const booking = body?.booking as Record<string, unknown> | undefined;
    const aulaa = body?.aulaa as Record<string, unknown> | undefined;
    const optionId = typeof body?.optionId === 'string' ? body.optionId : '';
    const bookingReference = typeof booking?.bookingReference === 'string' ? booking.bookingReference.trim().toUpperCase() : '';
    if (!booking || !bookingReference || !optionId || !booking.guest || !Array.isArray(booking.travelers)) {
      return jsonResponse({ error: { code: 'invalid_request', message: 'Data checkout tidak lengkap.' } }, 400);
    }
    const paymentMethodId = String(booking.paymentMethodId || '');
    const isAulaaMethod = paymentMethodId === 'aulaa_all' || paymentMethodId === 'aulaa_direct';
    if ((isAulaaMethod && !aulaa) || (!isAulaaMethod && aulaa) ||
      (paymentMethodId === 'aulaa_direct' && typeof aulaa?.paymentMethod !== 'string')) {
      return jsonResponse({ error: { code: 'invalid_payment_method', message: 'Konfigurasi metode pembayaran tidak sesuai.' } }, 400);
    }

    const accessToken = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
    const accessTokenHash = await sha256(accessToken);
    const idempotencyKey = await sha256(`guest-booking:${bookingReference}`);
    const supabase = getAdmin();
    const bookingInput = { ...booking, bookingReference, optionId };
    const { data: created, error: createError } = await supabase.rpc('create_guest_booking', {
      p_booking: bookingInput, p_access_token_hash: accessTokenHash, p_idempotency_key: idempotencyKey
    });
    if (createError || !created) {
      const duplicate = createError?.code === '23505' || /booking_already_exists|duplicate key/i.test(createError?.message || '');
      return jsonResponse({
        error: { code: duplicate ? 'booking_already_exists' : 'booking_validation_failed',
          message: duplicate ? 'Pemesanan dengan referensi ini sudah pernah dibuat. Jangan mengirim ulang checkout; gunakan token akses yang diterbitkan saat pemesanan pertama.' : 'Data pemesanan tidak valid atau tidak dapat disimpan.' }
      }, duplicate ? 409 : 400);
    }

    const resultBooking = created as Record<string, unknown>;
    if (!aulaa) return jsonResponse({ bookingReference, accessToken, booking: resultBooking, transaction: null }, 201);

    try {
      const apiKey = getAulaaApiKey();
      const requestedMethod = typeof aulaa.paymentMethod === 'string' ? aulaa.paymentMethod : undefined;
      const redirectUrl = typeof aulaa.redirectUrl === 'string' ? aulaa.redirectUrl : undefined;
      const expectedAmount = Number(resultBooking.totalAmount);
      const aulaaPayload: Record<string, unknown> = { order_id: bookingReference, amount: expectedAmount };
      if (requestedMethod) aulaaPayload.payment_method = requestedMethod;
      if (redirectUrl) aulaaPayload.redirect_url = redirectUrl;

      const createRequest = () => fetch(`${AULAA_API_BASE}/payments`, {
        method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(aulaaPayload), signal: AbortSignal.timeout(15000)
      });
      let upstream: Response;
      try {
        upstream = await createRequest();
      } catch {
        // Retry exactly once with the same provider order_id; Aulaa returns 409 + payment_id if the first call succeeded.
        upstream = await createRequest();
      }
      let upstreamJson = await parseAulaaResponse(upstream);
      let payment = unwrap(upstreamJson);

      if (upstream.status === 409 && typeof upstreamJson.payment_id === 'string') {
        const recovered = await fetch(`${AULAA_API_BASE}/payments/${encodeURIComponent(upstreamJson.payment_id)}`, {
          headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(15000)
        });
        upstreamJson = await parseAulaaResponse(recovered);
        payment = unwrap(upstreamJson);
        upstream = recovered;
      }
      if (!upstream.ok || typeof payment.id !== 'string') {
        return jsonResponse({ bookingReference, accessToken, booking: resultBooking, transaction: null,
          paymentError: { code: 'aulaa_error', message: 'Booking tersimpan, tetapi invoice Aulaa belum dapat dipastikan. Jangan membuat booking baru.' } }, 202);
      }

      const amount = Number(payment.amount);
      const currency = String(payment.currency || 'IDR');
      const countryCode = String(payment.country_code || 'ID');
      const orderId = String(payment.order_id || '');
      const status = String(payment.status || 'pending') as AulaaStatus;
      if (orderId !== bookingReference || amount !== expectedAmount || currency !== 'IDR' || countryCode !== 'ID') {
        return jsonResponse({ bookingReference, accessToken, booking: resultBooking, transaction: null,
          paymentError: { code: 'aulaa_response_mismatch', message: 'Respons invoice Aulaa tidak cocok dengan booking. Transaksi ditahan untuk pemeriksaan.' } }, 202);
      }
      if (!['pending','paid','expired','cancelled','failed','refunded'].includes(status)) {
        return jsonResponse({ bookingReference, accessToken, booking: resultBooking, transaction: null,
          paymentError: { code: 'aulaa_status_invalid', message: 'Status transaksi Aulaa tidak dikenal.' } }, 202);
      }

      const paymentRecord = {
        id: String(payment.id), order_id: orderId, status, amount,
        fee_amount: Number(payment.fee_amount || 0), charged_amount: Number(payment.charged_amount ?? amount),
        currency, country_code: countryCode, payment_method: payment.payment_method ? String(payment.payment_method) : requestedMethod ?? null,
        payment_method_name: typeof aulaa.paymentMethodName === 'string' ? aulaa.paymentMethodName : null,
        payment_method_type: typeof aulaa.paymentMethodType === 'string' ? aulaa.paymentMethodType : null,
        payment_link: String(payment.payment_link || `https://payment.aulaa.co/pay/${payment.id}`),
        payment_number: payment.payment_number ? String(payment.payment_number) : null,
        redirect_url: redirectUrl ?? null, expired_at: payment.expired_at ? String(payment.expired_at) : null,
        paid_at: payment.paid_at ? String(payment.paid_at) : null, created_at: payment.created_at ? String(payment.created_at) : null
      };
      const { error: persistError } = await supabase.rpc('persist_aulaa_payment', { p_order_id: bookingReference, p_payment: paymentRecord });
      if (persistError) {
        return jsonResponse({ bookingReference, accessToken, booking: resultBooking, transaction: null,
          paymentError: { code: 'database_persist_failed', message: 'Invoice Aulaa terbuat, tetapi pencatatan lokal belum selesai. Status tidak boleh dianggap lunas.' } }, 202);
      }
      return jsonResponse({ bookingReference, accessToken, booking: resultBooking, transaction: {
        id: paymentRecord.id, orderId, status, paymentMethod: paymentRecord.payment_method,
        paymentMethodName: paymentRecord.payment_method_name, paymentMethodType: paymentRecord.payment_method_type,
        amount, feeAmount: paymentRecord.fee_amount, totalAmount: paymentRecord.charged_amount,
        paymentLink: paymentRecord.payment_link, paymentNumber: paymentRecord.payment_number,
        currency, countryCode, expiresAt: paymentRecord.expired_at, paidAt: paymentRecord.paid_at, createdAt: paymentRecord.created_at
      } }, 201);
    } catch {
      return jsonResponse({ bookingReference, accessToken, booking: resultBooking, transaction: null,
        paymentError: { code: 'aulaa_timeout_or_error', message: 'Booking tersimpan, tetapi respons Aulaa belum dapat dipastikan. Simpan token akses dan Kode Booking; jangan membuat booking baru.' } }, 202);
    }
  } catch {
    return jsonResponse({ error: { code: 'internal_error', message: 'Permintaan checkout tidak dapat diproses.' } }, 500);
  }
});
