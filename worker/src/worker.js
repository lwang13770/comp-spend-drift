// CompDrift interpretation proxy (Cloudflare Worker).
//
// Holds the Anthropic API key as a Worker SECRET (env.ANTHROPIC_API_KEY) so it never
// ships to the browser. The static site POSTs the already-built Messages API request
// here; this Worker validates it, injects the key server-side, and forwards to Anthropic.
//
// Guardrails (defense in depth — the workspace spend cap is the real backstop):
//   - Origin allowlist (env.ALLOWED_ORIGINS, comma-separated) + CORS scoped to it.
//   - Model allowlist — the endpoint can't be used to call arbitrary models.
//   - max_tokens cap — bounds per-call cost.
//   - Only POST; only forwards to /v1/messages.
// Enable a Cloudflare rate-limiting rule in the dashboard for burst protection.

const ALLOWED_MODELS = new Set(['claude-sonnet-5', 'claude-haiku-4-5'])
const MAX_TOKENS_CAP = 2000

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
})

const json = (obj, status, origin) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
  })

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const allowed = (env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    // Reflect the caller's origin only if it's allowlisted; otherwise pin to the first.
    const corsOrigin = allowed.includes(origin) ? origin : allowed[0] || '*'

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(corsOrigin) })
    }
    if (request.method !== 'POST') {
      return json({ error: { message: 'Method not allowed' } }, 405, corsOrigin)
    }
    if (allowed.length && !allowed.includes(origin)) {
      return json({ error: { message: 'Origin not allowed' } }, 403, corsOrigin)
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: { message: 'Proxy missing ANTHROPIC_API_KEY secret' } }, 500, corsOrigin)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: { message: 'Invalid JSON body' } }, 400, corsOrigin)
    }

    if (!ALLOWED_MODELS.has(body.model)) {
      return json({ error: { message: 'Model not allowed' } }, 400, corsOrigin)
    }
    body.max_tokens = Math.min(Number(body.max_tokens) || MAX_TOKENS_CAP, MAX_TOKENS_CAP)

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    const text = await upstream.text()
    return new Response(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json', ...corsHeaders(corsOrigin) },
    })
  },
}
