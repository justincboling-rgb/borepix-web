# Threat model: Borepix (EdTech for Radiologic Technologists)

## Assets

1. **Question banks, workbooks, test-key assessments and rationales.** The product. Theft lets a
   competitor or a "question dump" site resell years of clinical writing.
2. **CE records and certificates.** A falsified passing submission or certificate harms the technologist
   who relies on it and Borepix's credibility with registries.
3. **Customer data.** Names, emails, phone numbers, postal codes, order history, affiliate payout
   handles. No patient data is ever accepted (Privacy Policy, "No patient information").
4. **Money flows.** Orders, promo codes, affiliate commissions and payouts.
5. **The brand.** Borepix must never appear to be affiliated with ARRT or ASRT, and must never publish
   fabricated claims.

## Actors

- Anonymous visitors and scrapers; competitors harvesting content.
- Customers trying to redeem keys they did not buy, replay promo codes or farm affiliate commissions.
- Credential-stuffing bots once hosted accounts exist.
- A compromised dependency or CI token.
- Curious staff or a lost founder laptop.

## Threats and mitigations

| Threat | Mitigation today | Owner / file |
|---|---|---|
| Content scraping and bulk download | Terms forbid scraping and AI training; CSP and `nosniff` limit injection; rate limits on future APIs; watermark and per-account item sampling planned for the hosted bank | `src/lib/content/legal.ts`, `src/lib/server/rate-limit.ts` |
| Forged CE results | Grading and certificate issue happen only on the server; keys are consumed server-side; entitlement from order records (checks 15, 32) | `docs/security/auth.md`, `RLS-policies.md` |
| Key or order IDOR | Owner-scoped queries plus per-object checks; 404 for foreign records | `RLS-policies.md` |
| Account takeover | HTTP-only `SameSite=Lax` session cookie, Argon2id hashes, rate-limited sign-in, single-use reset tokens, server-side logout | `src/lib/server/session-cookie.ts`, `auth.md` |
| Clickjacking / embedding on hostile sites | `X-Frame-Options: DENY`, `frame-ancestors 'none'` | `next.config.ts` |
| XSS via content | React escaping; JSON-LD escaped; no third-party scripts; CSP | `security.md` |
| Secrets leaking to the client | `NEXT_PUBLIC_` guard, no source maps, env governance | `scripts/check-env.mjs`, `env.md` |
| Admin exposure | `/admin` unlinked, `noindex`, server-gated by HTTP-only cookie; fails closed in production | `src/proxy.ts` |
| Promo and commission abuse | One code per order, server-side validation of eligibility and windows; self-referrals unpaid; payouts only from the founder dashboard | `src/lib/pricing.ts`, `src/lib/store/affiliates.ts` (client preview), server rules in `security.md` |
| Payment fraud / webhook spoofing | Stripe signature verification, idempotent event handling, entitlement from server records | `security.md` |
| PII in logs | Redaction rule; names-only secrets guard | `security.md` |
| Regulatory misstatement | Disclaimer, Terms and FAQ state independence from ARRT/ASRT, no pass-rate claims, CE credit only on passing submission | `/disclaimer`, `/terms`, `src/data/faq.ts` |
| Supply chain | Pinned major versions, `npm audit` in CI, no post-install scripts from unknown packages, lockfile committed | `package-lock.json` |

## Out of scope today

HIPAA: Borepix is not a covered entity and refuses patient data; the Privacy Policy instructs users
never to enter it. Should any clinical imaging feature be added, this model must be revisited first.

## Review cadence

Re-read this file and run the 36-point checklist (`docs/security/audit-2026-11-13.md`) before every
release that adds a server endpoint, a database table, a third-party script or a payment feature.
