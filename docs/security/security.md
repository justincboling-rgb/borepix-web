# Application security standard

OWASP-aligned rules for `borepix-web`. Each rule names the file that enforces it today.

## HTTP security headers (`next.config.ts`)

Applied to every response by `headers()`:

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| `X-DNS-Prefetch-Control` | `off` |
| `Content-Security-Policy` | see below |

`poweredByHeader: false` removes `X-Powered-By`; `productionBrowserSourceMaps: false` keeps source maps
out of production bundles.

### Content Security Policy

Production value: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; media-src 'self';
object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
upgrade-insecure-requests`. Development adds `'unsafe-eval'` and `ws: wss:` for hot reloading only.

- Nothing third-party is loaded: fonts come from `next/font` (self-hosted), there are no analytics,
  tag managers or embeds. **Adding any external script, style, font, image host or API means
  extending the CSP first**, in `next.config.ts`, and documenting why here.
- `'unsafe-inline'` for scripts is required by Next.js hydration without a nonce strategy. Moving to
  nonces (`proxy.ts` generating a per-request nonce and `script-src 'nonce-…' 'strict-dynamic'`) is the
  next hardening step once the backend ships.

## Output encoding and XSS

- React escapes all interpolated output. The only `dangerouslySetInnerHTML` uses are the three
  schema.org JSON-LD `<script type="application/ld+json">` blocks (`src/components/site/json-ld.tsx`,
  `src/components/landing/faq.tsx`, `src/app/(marketing)/store/[slug]/page.tsx`); their payload is
  built from constant catalogue data and serialised with every `<` replaced by its `\u003c` escape, so no string can
  close the tag. Any new use of `dangerouslySetInnerHTML`, `innerHTML`, `eval` or `new Function` is a
  review blocker.
- Legal copy renders through `LegalText`, which turns known titles, emails and URLs into links with
  React elements, never raw HTML.

## Input validation

- Every form parses its input through the Zod schemas in `src/lib/schemas/` (type, length, format,
  allowed values). The same schema must be applied again on the server in every future route handler
  or server action before a store or database is touched; client validation is a convenience, not a
  control (checks 15, 16).
- Database access, when it exists, uses parameterised queries or an ORM with bound parameters; never
  string-concatenate user input into SQL or build NoSQL filters from raw objects (check 17).

## CORS

The site is same-origin and sends no CORS headers, which is the strictest posture. Route handlers that
must be called cross-origin use `corsHeaders()` from `src/lib/server/cors.ts`, whose allowlist is
`https://borepix.com`, `https://www.borepix.com` and localhost in development. Never `*`.

## Rate limiting

`src/lib/server/rate-limit.ts` provides a fixed-window limiter with per-route defaults
(`RATE_LIMITS`). Auth, sign-up, password reset, waitlist and key redemption endpoints call it first.
Replace the in-memory store with a shared store (Redis, Upstash, Vercel KV) when deploying across
multiple instances.

## Files, paths and outbound requests

- No file uploads exist. When added: allowlist MIME types by sniffing content, cap size, store under a
  random server-generated name in private object storage, never under `public/` (check 21).
- Never resolve a user-supplied path on disk; map identifiers to known resources (check 22).
- Server-side fetches go only to an allowlist of hosts; block private and link-local ranges and
  follow no redirects to them (check 23).

## Errors and logs

- Production error responses are generic. `src/app/error.tsx` shows a plain message plus the Next.js
  error digest; `src/app/not-found.tsx` handles 404s. Stack traces and query text stay in server logs.
- Logs never contain passwords, tokens, session ids, card data or full emails. The secrets guard
  (`scripts/check-env.mjs`) prints only variable names, never values. Build output on Vercel must not
  `echo` environment variables.

## Payments and entitlements

- Entitlement (which keys a user owns, whether a pass is active) is decided on the server from the
  order record, never from a client flag (check 32).
- Stripe webhooks are verified with `stripe.webhooks.constructEvent` and `STRIPE_WEBHOOK_SECRET`
  before any order is marked paid; replayed event ids are ignored (check 31).

## Staging and defaults

- Non-production deployments are protected with Vercel deployment protection (password or Vercel
  authentication) and use their own secrets; production keys never appear in a preview environment
  (check 29).
- No vendor default credentials exist; any service account is created per environment with a unique
  secret (check 30).
