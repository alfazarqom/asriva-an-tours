import { createAdminClient, consumeRateLimit, verifyBookingAccess } from '../_shared/security.ts';
const AULAA_API_BASE = 'https://api.aulaa.co/v1';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
function jsonResponse(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
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
    if (!orderId || !accessToken) return jsonResponse({ error: { code: 'invalid_request', message: 'Kode booking dan token akses wajib diisi.' } }, 400);
    const supabase = createAdminClient();
    if (!(await verifyBookingAccess(supabase, orderId, accessToken))) return jsonResponse({ error: { code: 'not_found', message: 'Booking tidak ditemukan atau token akses tidak valid.' } }, 404);
    if (!(await consumeRateLimit(supabase, `cancel:${orderId}:${accessToken}`, 5, 60))) return jsonResponse({ error: { code: 'rate_limited', message: 'Terlalu banyak percobaan pembatalan.' } }, 429);
    const { data: booking, error: bookingError } = await supabase.from('bookings')
      .select('payment_status,trip_category').eq('booking_reference', orderId).maybeSingle();
    if (bookingError || !booking) return jsonResponse({ error: { code: 'database_error' } }, 500);
    if (booking.payment_status === 'Lunas (Terverifikasi)' || booking.trip_category === 'completed') {
      return jsonResponse({ error: { code: 'invalid_state', message: 'Booking yang sudah lunas atau selesai tidak dapat dibatalkan melalui endpoint ini.' } }, 409);
    }

    const { data: tx, error: lookupError } = await supabase.from('aulaa_transactions').select('*').eq('order_id', orderId).maybeSingle();
    if (lookupError) return jsonResponse({ error: { code: 'database_error' } }, 500);
    if (!tx) {
      const { error } = await supabase.from('bookings').update({ trip_category: 'cancelled', booking_status: 'Dibatalkan', payment_status: 'Dibatalkan' }).eq('booking_reference', orderId);
      if (error) return jsonResponse({ error: { code: 'database_error' } }, 500);
      return jsonResponse({ data: null, bookingCancelled: true });
    }
    if (tx.status !== 'pending') return jsonResponse({ error: { code: 'invalid_state', message: 'Pembayaran yang sudah tidak pending tidak dapat dibatalkan.' } }, 409);
    const apiKey = Deno.env.get('AULAA_API_KEY')?.trim();
    if (!apiKey) return jsonResponse({ error: { code: 'configuration_error' } }, 500);
    const upstream = await fetch(`${AULAA_API_BASE}/payments/${encodeURIComponent(tx.id)}/cancel`, {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(15000)
    });
    const upstreamJson = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return jsonResponse({ error: { code: 'aulaa_cancel_failed', message: upstream.status === 409 ? 'Pembayaran sudah diproses atau tidak dapat dibatalkan.' : 'Aulaa belum menerima pembatalan.' } }, upstream.status);
    const payment = upstreamJson?.data && typeof upstreamJson.data === 'object' ? upstreamJson.data : upstreamJson;
    const status = typeof payment.status === 'string' ? payment.status : 'cancelled';
    const payload = { id: tx.id, order_id: orderId, amount: tx.amount, fee_amount: tx.fee_amount, charged_amount: tx.charged_amount ?? tx.total_amount, currency: tx.currency, country_code: tx.country_code, status, payment_method: tx.payment_method };
    const { data, error } = await supabase.rpc('process_aulaa_webhook', { p_payload: payload, p_event_fingerprint: await fingerprint(JSON.stringify({ source: 'merchant_cancel', ...payload })) });
    if (error) return jsonResponse({ error: { code: 'database_error', message: 'Pembatalan diterima Aulaa tetapi sinkronisasi booking gagal.' } }, 500);
    return jsonResponse({ data: { id: tx.id, orderId, status }, result: data });
  } catch {
    return jsonResponse({ error: { code: 'internal_error', message: 'Pembatalan tidak dapat diproses.' } }, 500);
  }
});
