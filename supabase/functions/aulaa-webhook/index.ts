import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = { 'Content-Type': 'application/json' };
const allowedStatuses = new Set(['pending','paid','expired','cancelled','failed','refunded']);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}
function hexToBytes(value: string): Uint8Array | null {
  if (!/^[a-f0-9]{64}$/i.test(value)) return null;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}
async function verifySignature(rawBody: string, header: string | null, secret: string) {
  if (!header) return false;
  const signature = hexToBytes(header.trim().replace(/^sha256=/i, ''));
  if (!signature) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(rawBody));
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return jsonResponse({ error: { code: 'method_not_allowed' } }, 405);
  try {
    const secret = Deno.env.get('AULAA_WEBHOOK_SECRET')?.trim();
    const url = Deno.env.get('SUPABASE_URL')?.trim();
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();
    if (!secret || !url || !serviceKey) return jsonResponse({ error: { code: 'configuration_error' } }, 500);

    const rawBody = await req.text();
    if (!rawBody || rawBody.length > 65536) return jsonResponse({ error: { code: 'invalid_payload' } }, 413);
    const valid = await verifySignature(rawBody, req.headers.get('x-webhook-signature'), secret);
    if (!valid) return jsonResponse({ error: { code: 'unauthorized', message: 'Invalid X-Webhook-Signature' } }, 401);

    let payload: Record<string, unknown>;
    try { payload = JSON.parse(rawBody) as Record<string, unknown>; }
    catch { return jsonResponse({ error: { code: 'invalid_json' } }, 400); }

    const orderId = typeof payload.order_id === 'string' ? payload.order_id.trim() : '';
    const paymentId = typeof payload.id === 'string' ? payload.id : '';
    const status = typeof payload.status === 'string' ? payload.status : '';
    const amount = payload.amount;
    if (!orderId || !paymentId || !/^[0-9a-f-]{36}$/i.test(paymentId) ||
      !allowedStatuses.has(status) || !Number.isSafeInteger(amount) || Number(amount) < 1000) {
      return jsonResponse({ error: { code: 'invalid_payload' } }, 400);
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const fingerprint = await sha256(rawBody);
    const { data, error } = await supabase.rpc('process_aulaa_webhook', {
      p_payload: payload,
      p_event_fingerprint: fingerprint
    });
    if (error) {
      // Non-2xx lets Aulaa retry; do not acknowledge a database failure.
      return jsonResponse({ error: { code: 'processing_failed', message: 'Webhook belum dapat diproses.' } }, 500);
    }
    return jsonResponse({ received: true, order_id: orderId, result: data }, 200);
  } catch {
    return jsonResponse({ error: { code: 'internal_error' } }, 500);
  }
});
