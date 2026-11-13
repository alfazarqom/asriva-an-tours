import { createAdminClient, verifyBookingAccess } from '../_shared/security.ts';

const AULAA_API_BASE = 'https://api.aulaa.co/v1';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
function jsonResponse(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
function unwrap(value: Record<string, unknown>) { return value.data && typeof value.data === 'object' ? value.data as Record<string, unknown> : value; }
async function fingerprint(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: { code: 'method_not_allowed' } }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim().toUpperCase() : '';
    const accessToken = typeof body.accessToken === 'string' ? body.accessToken : '';
    if (!orderId || !accessToken) return jsonResponse({ error: { code: 'invalid_request' } }, 400);
    const supabase = createAdminClient();
    if (!(await verifyBookingAccess(supabase, orderId, accessToken))) return jsonResponse({ error: { code: 'not_found' } }, 404);
    const { data: booking, error: bookingError } = await supabase.from('bookings')
      .select('total_amount,payment_method_id,payment_method_name')
      .eq('booking_reference', orderId).maybeSingle();
    if (bookingError || !booking) return jsonResponse({ error: { code: 'not_found' } }, 404);
    if (booking.payment_method_id !== 'aulaa_all') return jsonResponse({ error: { code: 'retry_not_supported', message: 'Pemulihan otomatis hanya tersedia untuk metode Aulaa hosted. Hubungi dukungan untuk metode channel langsung.' } }, 409);
    const { data: existingTx, error: txError } = await supabase.from('aulaa_transactions').select('*').eq('order_id', orderId).maybeSingle();
    if (txError) return jsonResponse({ error: { code: 'database_error' } }, 500);
    if (existingTx) return jsonResponse({ transaction: {
      id: existingTx.id, orderId, status: existingTx.status, paymentMethod: existingTx.payment_method,
      paymentMethodName: existingTx.payment_method_name, paymentMethodType: existingTx.payment_method_type,
      amount: existingTx.amount, feeAmount: existingTx.fee_amount, totalAmount: existingTx.charged_amount ?? existingTx.total_amount,
      paymentLink: existingTx.payment_link, paymentNumber: existingTx.payment_number, currency: existingTx.currency,
      countryCode: existingTx.country_code, expiresAt: existingTx.expires_at, paidAt: existingTx.paid_at, createdAt: existingTx.aulaa_created_at
    } });
    const apiKey = Deno.env.get('AULAA_API_KEY')?.trim();
    if (!apiKey) return jsonResponse({ error: { code: 'configuration_error' } }, 500);

    let upstream: Response;
    try {
      upstream = await fetch(`${AULAA_API_BASE}/payments`, {
        method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, amount: booking.total_amount }), signal: AbortSignal.timeout(15000)
      });
    } catch {
      upstream = await fetch(`${AULAA_API_BASE}/payments`, {
        method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, amount: booking.total_amount }), signal: AbortSignal.timeout(15000)
      });
    }
    let responseJson = await upstream.json().catch(() => ({}));
    let payment = unwrap(responseJson);
    if (upstream.status === 409 && typeof responseJson.payment_id === 'string') {
      upstream = await fetch(`${AULAA_API_BASE}/payments/${encodeURIComponent(responseJson.payment_id)}`, {
        headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(15000)
      });
      responseJson = await upstream.json().catch(() => ({}));
      payment = unwrap(responseJson);
    }
    if (!upstream.ok || typeof payment.id !== 'string') return jsonResponse({ error: { code: 'aulaa_retry_failed', message: 'Aulaa belum dapat membuat atau memulihkan invoice. Coba lagi nanti.' } }, 502);
    const amount = Number(payment.amount);
    const currency = String(payment.currency || 'IDR');
    const countryCode = String(payment.country_code || 'ID');
    const providerOrderId = String(payment.order_id || '');
    const status = String(payment.status || 'pending');
    if (providerOrderId !== orderId || amount !== Number(booking.total_amount) || currency !== 'IDR' || countryCode !== 'ID' ||
      !['pending','paid','expired','cancelled','failed','refunded'].includes(status)) {
      return jsonResponse({ error: { code: 'aulaa_response_mismatch' } }, 409);
    }
    const record = {
      id: String(payment.id), order_id: orderId, status, amount,
      fee_amount: Number(payment.fee_amount || 0), charged_amount: Number(payment.charged_amount ?? amount),
      currency, country_code: countryCode, payment_method: payment.payment_method ?? null,
      payment_method_name: booking.payment_method_name, payment_method_type: null,
      payment_link: String(payment.payment_link || `https://payment.aulaa.co/pay/${payment.id}`),
      payment_number: payment.payment_number ?? null, redirect_url: null,
      expired_at: payment.expired_at ?? null, paid_at: payment.paid_at ?? null, created_at: payment.created_at ?? null
    };
    const { error } = await supabase.rpc('persist_aulaa_payment', { p_order_id: orderId, p_payment: record });
    if (error) return jsonResponse({ error: { code: 'database_persist_failed' } }, 500);
    return jsonResponse({ transaction: {
      id: record.id, orderId, status, paymentMethod: record.payment_method,
      paymentMethodName: record.payment_method_name, paymentMethodType: null, amount,
      feeAmount: record.fee_amount, totalAmount: record.charged_amount, paymentLink: record.payment_link,
      paymentNumber: record.payment_number, currency, countryCode, expiresAt: record.expired_at,
      paidAt: record.paid_at, createdAt: record.created_at
    } }, 201);
  } catch {
    return jsonResponse({ error: { code: 'internal_error', message: 'Pemulihan invoice tidak dapat diproses.' } }, 500);
  }
});
