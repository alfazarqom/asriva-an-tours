import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function createAdminClient() {
  const url = Deno.env.get('SUPABASE_URL')?.trim();
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();
  if (!url || !key) throw new Error('Supabase server configuration is incomplete.');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function hashAccessToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyBookingAccess(
  supabase: ReturnType<typeof createAdminClient>,
  bookingReference: string,
  accessToken: string
): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(accessToken)) return false;
  const tokenHash = await hashAccessToken(accessToken);
  const { data, error } = await supabase.from('bookings')
    .select('booking_reference')
    .eq('booking_reference', bookingReference.toUpperCase())
    .eq('access_token_hash', tokenHash)
    .maybeSingle();
  return !error && Boolean(data);
}

export function getRequestIp(request: Request): string {
  const direct = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip');
  if (direct) return direct.trim().slice(0, 128);
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || 'unknown';
}

export async function consumeRateLimit(
  supabase: ReturnType<typeof createAdminClient>,
  key: string,
  maxRequests: number,
  windowSeconds = 60
): Promise<boolean> {
  const keyHash = await hashAccessToken(key);
  const { data, error } = await supabase.rpc('consume_aulaa_rate_limit', {
    p_key_hash: keyHash,
    p_window_seconds: windowSeconds,
    p_max_requests: maxRequests
  });
  if (error) throw new Error('Rate limit service unavailable.');
  return data === true;
}
