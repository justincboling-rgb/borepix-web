# `src/lib/schemas` — the input contract

Every form on the site validates through the Zod schemas in this folder, and they are the contract for the
server: **every server action and API route must parse its input with the matching schema before it touches
a store or a database.** Never trust a client-side check; run the same schema again on the server.

```ts
"use server";
import { fieldErrors, signupSchema } from "@/lib/schemas";

export async function signup(input: unknown) {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed) };
  // parsed.data is trimmed, normalised and typed; only now write anything.
}
```

## Rules

- **One source of truth.** A rule or message lives here once. Components call the schema (or a thin wrapper
  such as `@/components/auth/validation.ts`) and never re-implement a check. Adding a field means adding it to
  the schema first.
- **Messages are product copy.** Every string here is shown verbatim in the UI. Change one only with the
  form that shows it, and keep the first-rule-wins order: each field reports the first failing rule, exactly
  as the forms did before the schemas existed.
- **No aborting checks on fields.** Use `firstFailing([...])` (see `shared.ts`) for an ordered chain. An
  aborting check (`abort: true`) on a field makes Zod skip the object-level `superRefine` that holds the
  cross-field rules (CVC against the card brand, ZIP against the country, payout handle against the method).
- **Context goes in as an argument.** Schemas that depend on the clock or a dial code are factories
  (`checkoutSchema(now)`, `phoneSchema("+1")`, `examDateSchema(now)`); never read `Date.now()` inside a schema.
- **Output is what gets stored.** Where a form trims or normalises before saving, the schema does it
  (`.trim()`, `licenseKeySchema`, `promoCodeSchema`, `referralCodeSchema`), so `parsed.data` is ready to persist.

## Reading a result

- `firstIssueMessage(result)` — the one message a single-field form shows.
- `fieldErrors<Field>(result)` — `{ field: message }` for a multi-field form, first issue per field, in the
  order the issues were raised (the forms focus the first key).

## Map

| File           | Schemas                                                                                                                   | Used by                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `auth.ts`      | `emailSchema`, `nameSchema`, `passwordSchema`, `phoneSchema`, `postalCodeSchema`, `examDateSchema`, `signupSchema`, `loginSchema`, `profileSchema` | sign-up, log-in and settings profile forms via `auth/validation.ts`  |
| `commerce.ts`  | `checkoutSchema` + `checkoutFieldMessage`, `waitlistEmailSchema`, `licenseKeySchema`, `promoCodeSchema`                   | checkout modal, launch and app waitlists, redeem panel, cart promo   |
| `community.ts` | `moneyPledgeSchema`, `inKindPledgeSchema`, `pledgeSchema`                                                                 | pledge widget                                                        |
| `affiliate.ts` | `affiliateJoinSchema`, `referralCodeSchema`                                                                               | affiliate sign-up form, `?ref=` capture                              |
| `shared.ts`    | `firstFailing`, `firstIssueMessage`, `fieldErrors`, `EMAIL_RE`                                                            | everything above                                                     |
