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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return jsonResponse({ error: { code: 'method_not_allowed', message: 'Gunakan GET atau POST.' } }, 405);
  }

  try {
    const apiKey = getAulaaApiKey();
    const upstream = await fetch(`${AULAA_API_BASE}/payments/methods`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      return jsonResponse(
        {
          error: {
            code: payload?.error?.code || 'aulaa_error',
            message:
              payload?.error?.message ||
              payload?.message ||
              'Gagal mengambil daftar metode pembayaran Aulaa.'
          }
        },
        upstream.status
      );
    }

    const rawMethods = Array.isArray(payload?.methods)
      ? payload.methods
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    const methods = rawMethods.map((m: Record<string, unknown>) => ({
      code: String(m.code || ''),
      name: String(m.name || m.code || ''),
      type: String(m.type || 'other'),
      isAvailable: m.is_available !== false,
      minAmount: Number(m.min_amount ?? 0),
      maxAmount: Number(m.max_amount ?? 0)
    }));

    return jsonResponse(
      {
        country: payload?.country || 'ID',
        currency: payload?.currency || 'IDR',
        methods
      },
      200
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil metode pembayaran Aulaa.';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
