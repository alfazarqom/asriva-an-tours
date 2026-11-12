const PAYWUZ_API_BASE = 'https://api.paywuz.id/v2';

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

function getPaywuzApiKey(): string {
  const apiKey = Deno.env.get('PAYWUZ_API_KEY')?.trim();
  if (!apiKey) {
    throw new Error('PAYWUZ_API_KEY belum dikonfigurasi pada Supabase Edge Function Secrets.');
  }
  return apiKey;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = getPaywuzApiKey();

    let amount: number | undefined;
    let type: string | undefined;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const amountParam = url.searchParams.get('amount');
      const typeParam = url.searchParams.get('type');
      if (amountParam) amount = Number(amountParam);
      if (typeParam) type = typeParam;
    } else if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (body.amount !== undefined) amount = Number(body.amount);
      if (typeof body.type === 'string' && body.type.trim()) type = body.type.trim();
    } else {
      return jsonResponse({ error: { code: 'method_not_allowed', message: 'Gunakan GET atau POST.' } }, 405);
    }

    const query = new URLSearchParams();
    if (typeof amount === 'number' && Number.isInteger(amount) && amount > 0) {
      query.set('amount', String(amount));
    }
    if (type && ['virtual_account', 'qris', 'retail'].includes(type)) {
      query.set('type', type);
    }

    const endpoint = `${PAYWUZ_API_BASE}/payment-methods${query.toString() ? `?${query.toString()}` : ''}`;
    const upstream = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const payload = await upstream.json();
    return jsonResponse(payload, upstream.status);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil daftar metode pembayaran Paywuz v2.';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
