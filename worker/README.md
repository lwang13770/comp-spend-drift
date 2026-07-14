# CompDrift interpretation proxy

A tiny Cloudflare Worker that holds the Anthropic API key server-side so it never ships to
the browser. The static CompDrift site posts its Messages API request here; the Worker
validates it, injects the key, and forwards to Anthropic.

## Why

A static GitHub Pages app has no server — any key it uses at runtime would be baked into the
public JS bundle. This Worker is the minimal server that keeps the key secret while letting
keyless visitors use the interpretation layer.

## Guardrails

- **Origin allowlist** (`ALLOWED_ORIGINS`) + CORS scoped to it.
- **Model allowlist** — only `claude-sonnet-5` / `claude-haiku-4-5`.
- **max_tokens cap** (2000) — bounds per-call cost.
- The real backstop is a **hard spend limit** on the workspace the key belongs to.

## Deploy (one time)

Prereqs: a free Cloudflare account and Node.

```bash
cd worker
npm install -g wrangler         # or: npx wrangler ...
wrangler login                  # opens browser, authorizes your Cloudflare account

# 1. Set the allowed origins. Edit wrangler.toml -> ALLOWED_ORIGINS to your Pages URL,
#    e.g. "http://localhost:5173,https://linda.github.io"

# 2. Store the Anthropic key as a secret (paste it when prompted — never committed).
wrangler secret put ANTHROPIC_API_KEY

# 3. Deploy.
wrangler deploy
# -> prints the Worker URL, e.g. https://compdrift-proxy.<you>.workers.dev
```

Then point the site at it: put that URL in the app's `.env` as `VITE_PROXY_URL`
(see the repo root `.env.example`) and rebuild/redeploy the site.

## Recommended hardening for a public demo

- Create a **dedicated workspace** in the Anthropic Console with a low **hard spend limit**
  (e.g. $5–10); generate the key inside it. That cap is what makes worst-case abuse a
  non-event.
- Prefer **Haiku 4.5** in the app's model selector to stretch the budget.
- In the Cloudflare dashboard, add a **Rate limiting rule** on this Worker's route for
  burst protection.
- **Delete the key** (and optionally the Worker) when the demo window closes.

## Local run

```bash
cd worker
wrangler dev    # runs the Worker locally; still needs the secret set
```
