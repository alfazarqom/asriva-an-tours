function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export async function GET(): Promise<Response> {
  return jsonResponse({ ok: true, service: 'ASRIVA Aulaa webhook relay', canonical: 'Supabase Edge Function' });
}

// Compatibility relay only. The canonical handler and signature verification live in Supabase.
export async function POST(request: Request): Promise<Response> {
  try {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const publishableKey = (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
    if (!supabaseUrl || !publishableKey) {
      return jsonResponse({ error: { code: 'configuration_error', message: 'Supabase webhook relay configuration is incomplete.' } }, 500);
    }

    const rawBody = await request.text();
    if (!rawBody || rawBody.length > 65536) return jsonResponse({ error: { code: 'invalid_payload' } }, 413);
    const signature = request.headers.get('x-webhook-signature');
    if (!signature) return jsonResponse({ error: { code: 'unauthorized' } }, 401);

    const target = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/aulaa-webhook`;
    const upstream = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'x-webhook-signature': signature,
        apikey: publishableKey
      },
      body: rawBody,
      signal: AbortSignal.timeout(20000)
    });
    const responseBody = await upstream.text();
    return new Response(responseBody, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'application/json' }
    });
  } catch {
    return jsonResponse({ error: { code: 'relay_failed' } }, 502);
  }
}
