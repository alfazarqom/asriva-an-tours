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
    if (!(await consumeRateLimit(supabase, `status:${orderId}:${accessToken}`, 20, 60))) return jsonResponse({ error: { code: 'rate_limited', message: 'Terlalu banyak pemeriksaan status.' } }, 429);
    const { data: tx, error: lookupError } = await supabase.from('aulaa_transactions').select('*').eq('order_id', orderId).maybeSingle();
    if (lookupError) return jsonResponse({ error: { code: 'database_error' } }, 500);
    if (!tx) return jsonResponse({ error: { code: 'not_found', message: 'Invoice Aulaa belum tersedia.' } }, 404);

    const apiKey = Deno.env.get('AULAA_API_KEY')?.trim();
    if (!apiKey) return jsonResponse({ error: { code: 'configuration_error' } }, 500);
    const upstream = await fetch(`${AULAA_API_BASE}/payments/${encodeURIComponent(tx.id)}`, {
      method: 'GET', headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(15000)
    });
    const upstreamJson = await upstream.json().catch(() => ({}));
    const payment = upstreamJson?.data && typeof upstreamJson.data === 'object' ? upstreamJson.data : upstreamJson;
    if (!upstream.ok || !payment?.id) return jsonResponse({ error: { code: 'aulaa_error', message: upstream.status === 429 ? 'Terlalu banyak permintaan status. Coba lagi beberapa saat.' : 'Aulaa belum dapat mengonfirmasi status pembayaran.' } }, upstream.status);

    const payload = {
      id: String(payment.id), order_id: String(payment.order_id || orderId), amount: Number(payment.amount),
      fee_amount: Number(payment.fee_amount ?? tx.fee_amount ?? 0),
      charged_amount: Number(payment.charged_amount ?? payment.amount ?? tx.charged_amount ?? tx.total_amount),
      currency: String(payment.currency || tx.currency || 'IDR'), country_code: String(payment.country_code || tx.country_code || 'ID'),
      status: String(payment.status || tx.status), payment_method: payment.payment_method ?? tx.payment_method,
      paid_at: payment.paid_at ?? tx.paid_at
    };
    if (payload.order_id !== orderId || payload.id !== tx.id || payload.amount !== tx.amount) {
      return jsonResponse({ error: { code: 'aulaa_response_mismatch', message: 'Data status Aulaa tidak cocok dengan invoice tersimpan.' } }, 409);
    }
    const { data, error } = await supabase.rpc('process_aulaa_webhook', {
      p_payload: payload, p_event_fingerprint: await fingerprint(JSON.stringify({ source: 'status_reconciliation', ...payload }))
    });
    if (error) return jsonResponse({ error: { code: 'database_error', message: 'Status provider diterima tetapi sinkronisasi lokal gagal.' } }, 500);

    return jsonResponse({ data: {
      id: tx.id, orderId, status: payload.status, paymentMethod: payload.payment_method ?? null,
      paymentMethodName: tx.payment_method_name ?? null, paymentMethodType: tx.payment_method_type ?? null,
      amount: payload.amount, feeAmount: payload.fee_amount, totalAmount: payload.charged_amount,
      paymentLink: tx.payment_link, paymentNumber: tx.payment_number, currency: payload.currency,
      countryCode: payload.country_code, expiresAt: tx.expires_at, paidAt: payload.paid_at ?? null, createdAt: tx.aulaa_created_at
    }, result: data });
  } catch {
    return jsonResponse({ error: { code: 'internal_error', message: 'Status pembayaran tidak dapat diperiksa.' } }, 500);
  }
});
