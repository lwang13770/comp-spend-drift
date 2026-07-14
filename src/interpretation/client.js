// Direct-from-browser Anthropic call. The user's key is passed per-call and never stored
// here. Uses the anthropic-dangerous-direct-browser-access header (required for CORS from
// a static site) and structured outputs so the reply is guaranteed to parse.

import { buildPrompt } from './prompt.js'
import { interpretationSchema, parseInterpretation } from './schema.js'

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'

// Optional build-time proxy URL. When set, keyless visitors can interpret through the
// Cloudflare Worker (which holds the key server-side). Not a secret — it ships in the bundle.
export const PROXY_URL =
  (import.meta.env && import.meta.env.VITE_PROXY_URL) || ''
export const hasProxy = PROXY_URL.length > 0

export const MODELS = [
  { id: 'claude-sonnet-5', label: 'Sonnet 5' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5' },
]

/**
 * Call Claude to interpret the fired drifts.
 *
 * Routing: a user-pasted `apiKey` always goes DIRECT to Anthropic (their key, their spend).
 * Otherwise, if a proxy is configured, route through it (no key in the browser). The request
 * body is identical either way — the proxy just injects the key server-side.
 *
 * @returns {Promise<{ interpretation: object, payload: object }>}
 * @throws on no route available, network error, or non-2xx response.
 */
export async function interpret({ planSpec, firedDrifts, apiKey, model }) {
  const { system, user, payload } = buildPrompt(planSpec, firedDrifts)

  const useDirect = Boolean(apiKey)
  if (!useDirect && !hasProxy) {
    throw new Error('No API key provided and no proxy configured')
  }

  const endpoint = useDirect ? ANTHROPIC_ENDPOINT : PROXY_URL
  const headers = useDirect
    ? {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      }
    : { 'content-type': 'application/json' }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      // No thinking needed for a short structured judgment; keeps latency + cost low.
      thinking: { type: 'disabled' },
      system,
      output_config: { format: { type: 'json_schema', schema: interpretationSchema } },
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body?.error?.message || detail
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail)
  }

  const data = await res.json()
  const textBlock = (data.content || []).find((b) => b.type === 'text')
  if (!textBlock) throw new Error('No text block in interpretation response')
  return { interpretation: parseInterpretation(textBlock.text), payload }
}
