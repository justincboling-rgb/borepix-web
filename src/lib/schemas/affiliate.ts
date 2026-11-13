import { z } from "zod";
import { PAYOUT_METHOD_LABEL, type PayoutMethod } from "@/data/types";
import { EMAIL_RE } from "./shared";

export const payoutMethodSchema = z.enum(Object.keys(PAYOUT_METHOD_LABEL) as [PayoutMethod, ...PayoutMethod[]]);

/** A Stripe Connect account id: acct_ followed by at least eight letters or digits. */
const STRIPE_ACCOUNT_RE = /^acct_[A-Za-z0-9]{8,}$/;

/**
 * The affiliate sign-up form. The payout handle is a Stripe account id or a PayPal email depending on the
 * payout method, so it is checked at the object level where the method is known.
 */
export const affiliateJoinSchema = z
  .object({
    firstName: z.string().trim().min(1, { error: "Enter your first name." }),
    lastName: z.string().trim().min(1, { error: "Enter your last name." }),
    email: z.string().trim().regex(EMAIL_RE, { error: "Enter a valid email address." }),
    payoutMethod: payoutMethodSchema,
    payoutHandle: z.string().trim(),
  })
  .superRefine(({ payoutMethod: method, payoutHandle: handle }, ctx) => {
    let message: string | undefined;
    if (!handle) {
      message = method === "stripe" ? "Enter your Stripe account id." : "Enter your PayPal email.";
    } else if (method === "stripe" && !STRIPE_ACCOUNT_RE.test(handle)) {
      message = "Stripe account ids start with acct_ followed by letters and digits.";
    } else if (method === "paypal" && !EMAIL_RE.test(handle)) {
      message = "Enter the email address on your PayPal account.";
    }
    if (message) ctx.addIssue({ code: "custom", path: ["payoutHandle"], message });
  });

export type AffiliateJoinInput = z.input<typeof affiliateJoinSchema>;
export type AffiliateJoinData = z.output<typeof affiliateJoinSchema>;

/* ───────────────────────── Referrals ───────────────────────── */

const REFERRAL_CODE_RE = /^[A-Z0-9]{4,16}$/;

/** Uppercased with everything but letters and digits removed. */
export function normalizeReferralCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * A `?ref=CODE` value: normalised, then 4–16 letters or digits. The store ignores a bad code silently, so
 * the message never reaches the page; it is there for logs and server responses.
 */
export const referralCodeSchema = z
  .string()
  .transform(normalizeReferralCode)
  .refine((code) => REFERRAL_CODE_RE.test(code), { error: "Referral codes are 4–16 letters or digits." });

export type ReferralCode = z.output<typeof referralCodeSchema>;
