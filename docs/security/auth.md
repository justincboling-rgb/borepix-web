# Authentication, sessions and tokens

Rules every session, route handler, server action and proxy in `borepix-web` must follow. Where the
rule names a file, that file is the single implementation; do not re-implement it elsewhere.

## Current state (Nov 2026)

- There is **no hosted account system yet**. The "profile" on `/login` and `/signup` is stored in the
  browser (`localStorage`, key `borepix:progress:v1`) by `src/lib/store/progress.ts`. Passwords are
  validated for length and discarded; they are never stored, hashed or compared.
- The only server-side session today is the founder dashboard gate in `src/proxy.ts`
  (`ADMIN_ACCESS_KEY` exchanged for the HTTP-only `borepix_admin` cookie).
- Everything below is binding for the hosted accounts that launch with the backend.

## Sessions

1. **Cookie, not storage.** Session tokens live only in the HTTP-only cookie set by
   `src/lib/server/session-cookie.ts` (`borepix_session`): `HttpOnly`, `Secure` in production,
   `SameSite=Lax`, `Path=/`, 30-day max age refreshed on activity. Never place a session token, JWT or
   refresh token in `localStorage`, `sessionStorage`, a URL or a non-HttpOnly cookie.
2. **Opaque, random tokens.** A session id is at least 256 bits from `crypto.getRandomValues`, stored
   server-side hashed (SHA-256) with the user id, creation time, last-seen time and user agent. If a
   JWT is used instead, see "JWT rules".
3. **Rotation.** Issue a new session id on sign-in, on privilege change and on password change.
   Invalidate the previous id server-side.
4. **Logout invalidates on the server.** Clearing the cookie is not enough: delete the session row, then
   call `clearSessionCookie()`.
5. **Expiry.** Absolute lifetime 30 days; idle timeout 7 days. Expired sessions are rejected on the
   server regardless of what the cookie says.
6. **Identity comes from the session only.** Handlers derive the user id from the validated session,
   never from the request body, query string or a client-supplied header (checks 06, 33, 34).

## JWT rules (only if JWTs are adopted)

- HS256 with a 256-bit `AUTH_SECRET` or RS256/ES256 with keys from the environment; reject `none` and
  any algorithm other than the one configured.
- Verify signature, `iss` (`https://www.borepix.com`), `aud` (`borepix-web`), `exp` and `nbf` on every
  request. Short access-token lifetime (15 minutes); refresh only through the HTTP-only cookie.
- Never put PII, roles that grant admin, or secrets in the payload; roles are looked up server-side.

## Passwords and reset

- Hash with Argon2id (memory 64 MiB, iterations 3, parallelism 1) or bcrypt cost 12; never store plain
  text or reversible encryption.
- Minimum length 8 (today's `PASSWORD_MIN` in `src/components/auth/validation.ts`), no composition
  rules, check against a breached-password list when the backend exists.
- Reset tokens: 256-bit random, single use, 15-minute expiry, stored hashed. The response to a reset
  request is identical whether or not the email exists ("If an account exists, we emailed a link").
  Rate limit with `RATE_LIMITS.passwordReset` from `src/lib/server/rate-limit.ts`.

## Authorization

- Every private route and protected endpoint checks the session **on the server** before reading or
  writing (check 04). Hidden navigation is not a control.
- Authorization is per object: load the record, confirm it belongs to the session's user (or the user
  holds the required role), then act (checks 05, 06, 33). Scope every query by `user_id`.
- Admin: the `/admin` dashboard is gated by `src/proxy.ts`; production fails closed when
  `ADMIN_ACCESS_KEY` is unset. When hosted accounts exist, replace the shared key with a server-side
  `role = 'founder'` check on the session and keep the HTTP-only cookie pattern (check 09).

## CSRF

- `SameSite=Lax` on every cookie, plus Next.js server actions' built-in origin check. Route handlers
  that change state must verify the `Origin` header against `ALLOWED_ORIGINS` in
  `src/lib/server/cors.ts` (check 20).

## Rate limits

Apply `rateLimit(clientAddress(headers) + ":" + route, RATE_LIMITS.<route>)` from
`src/lib/server/rate-limit.ts` to sign-in, sign-up, password reset, waitlist and key redemption
before any other work (check 28). Return 429 with `Retry-After`.
