# Environment variable governance

## The one rule

Only variables prefixed `NEXT_PUBLIC_` reach the browser bundle. Therefore **no secret, key, token,
password or connection string may ever carry that prefix.** Today the only public variable is
`NEXT_PUBLIC_SITE_URL`.

## Enforcement

- `scripts/check-env.mjs` runs before every build (`prebuild` in `package.json`). It fails the build
  when a `NEXT_PUBLIC_` name looks like a credential (`SECRET`, `TOKEN`, `KEY`, `PASSWORD`, `DSN`,
  `DATABASE_URL`, …) or when `src/` contains a credential-shaped literal (Stripe `sk_`/`whsec_`, AWS
  `AKIA…`, GitHub `gh*_`, private-key blocks, database URLs with passwords). It prints names only.
- `.gitignore` ignores every `.env*` file except `.env.example`, plus `.next/`, `out/`, `build/` and
  `*.tsbuildinfo`. A git-history scan for the same literal patterns was clean at the first commit; re-run
  `git grep -nE '<patterns>' $(git rev-list --all)` after any incident.
- `next.config.ts` disables `X-Powered-By` and production browser source maps.

## Files

| File | Committed | Purpose |
|---|---|---|
| `.env.example` | yes | every variable, documented, with empty values for secrets |
| `.env.local` | no | developer's local values |
| `.env.production` | no | never used; production values live in the host's environment settings |

## Variables

| Name | Scope | Used by |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | canonical URLs, sitemap, Open Graph (`src/lib/site.ts`) |
| `ADMIN_ACCESS_KEY` | server | founder dashboard gate (`src/proxy.ts`); production fails closed without it |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | server | payments backend (future) |
| `DATABASE_URL` | server | database (future); never logged |
| `AUTH_SECRET` | server | session or JWT signing (future); 256-bit random |

## Rotation and handling

- Generate secrets with at least 256 bits of entropy (`openssl rand -base64 32`).
- Rotate immediately if a secret is printed in a log, pasted in chat, or committed; then rewrite history
  only if the repository is private and every collaborator agrees, otherwise rotate and move on.
- Preview and staging deployments get their own secrets; production values are never copied to them.
- Build and CI scripts must not echo variables. If a provider masks secrets, still never print them.
- Access to the production environment settings is limited to founders.
