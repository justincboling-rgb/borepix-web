import { z } from "zod";
import { nrtw } from "@/data/nrtw";
import {
  cvcValid,
  detectCardBrand,
  digitsOnly,
  expiryValid,
  isLicenseKeyFormat,
  luhnValid,
  normalizeLicenseKey,
} from "@/lib/keys";
import { EMAIL_RE, fieldErrors, firstFailing } from "./shared";

/* ───────────────────────── Checkout ───────────────────────── */

/** Countries the billing select offers (ISO 3166-1 alpha-2). The checkout modal adds the display names. */
export const CHECKOUT_COUNTRY_CODES = ["US", "CA", "GB", "AU", "IE", "NZ"] as const;
export type CheckoutCountryCode = (typeof CHECKOUT_COUNTRY_CODES)[number];

/** Stricter than the sign-up pattern: the top-level domain needs at least two characters. */
const CHECKOUT_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const US_ZIP_RE = /^\d{5}(-\d{4})?$/;

/** 15 digits for American Express, 16 for every other brand. */
function expectedCardLength(digits: string): number {
  return detectCardBrand(digits) === "amex" ? 15 : 16;
}

const checkoutEmailSchema = z
  .string()
  .trim()
  .superRefine(
    firstFailing([
      [(v) => v.length > 0, "Enter the email address your keys should go to."],
      [(v) => CHECKOUT_EMAIL_RE.test(v), "Enter a valid email address."],
    ]),
  );

const cardNameSchema = z
  .string()
  .trim()
  .superRefine(firstFailing([[(v) => v.length >= 2, "Enter the name as it appears on the card."]]));

/** The card number as typed (spaces allowed): full length for its brand, then the Luhn checksum. */
const cardNumberSchema = z.string().superRefine(
  firstFailing([
    [(v) => digitsOnly(v).length > 0, "Enter your card number."],
    [
      (v) => {
        const digits = digitsOnly(v);
        return digits.length >= expectedCardLength(digits);
      },
      "Enter the full card number.",
    ],
    [(v) => luhnValid(digitsOnly(v)), "That card number is not valid. Check the digits and try again."],
  ]),
);

/** "MM/YY": a real month, a year within 20 years, and not in the past. */
function expirySchema(now: Date) {
  return z.string().superRefine(
    firstFailing([
      [(v) => digitsOnly(v).length === 4, "Enter the expiry date as MM/YY."],
      [
        (v) => {
          const month = Number(digitsOnly(v).slice(0, 2));
          return month >= 1 && month <= 12;
        },
        "Enter a month from 01 to 12.",
      ],
      [(v) => 2000 + Number(digitsOnly(v).slice(2)) <= now.getFullYear() + 20, "Enter a valid expiry year."],
      [(v) => expiryValid(v, now), "This card has expired. Use a card that is still valid."],
    ]),
  );
}

/**
 * The simulated Stripe checkout form. `now` decides whether the expiry date has passed. The CVC length
 * depends on the card's brand and the postal code is only required (as a ZIP) for the United States, so
 * both are checked at the object level where the sibling fields are known.
 */
export function checkoutSchema(now: Date) {
  return z
    .object({
      email: checkoutEmailSchema,
      name: cardNameSchema,
      card: cardNumberSchema,
      expiry: expirySchema(now),
      cvc: z.string(),
      country: z.enum(CHECKOUT_COUNTRY_CODES),
      postal: z.string(),
    })
    .superRefine((values, ctx) => {
      const brand = detectCardBrand(values.card);
      if (!cvcValid(values.cvc, brand)) {
        ctx.addIssue({
          code: "custom",
          path: ["cvc"],
          message:
            brand === "amex"
              ? "Enter the 4-digit code on the front of the card."
              : "Enter the 3-digit code on the back of the card.",
        });
      }
      if (values.country === "US" && !US_ZIP_RE.test(values.postal.trim())) {
        ctx.addIssue({ code: "custom", path: ["postal"], message: "Enter a 5-digit ZIP code." });
      }
    });
}

export type CheckoutInput = z.input<ReturnType<typeof checkoutSchema>>;
export type CheckoutData = z.output<ReturnType<typeof checkoutSchema>>;
export type CheckoutField = keyof CheckoutInput;

/** The message for one field of the checkout form, or undefined when that field passes. */
export function checkoutFieldMessage(field: CheckoutField, values: CheckoutInput, now: Date): string | undefined {
  return fieldErrors<CheckoutField>(checkoutSchema(now).safeParse(values))[field];
}

/* ───────────────────────── Launch waitlists ───────────────────────── */

export const EMAIL_MAX_LENGTH = 254;

/** An address for the launch or app waitlist. Deliberately permissive; the launch backend validates again. */
export const waitlistEmailSchema = z
  .string()
  .trim()
  .superRefine(
    firstFailing([
      [(v) => v.length > 0, "Enter your email address."],
      [
        (v) => v.length <= EMAIL_MAX_LENGTH && EMAIL_RE.test(v),
        "Enter a valid email address, like name@example.com.",
      ],
    ]),
  );

export type WaitlistEmail = z.output<typeof waitlistEmailSchema>;

/* ───────────────────────── License keys ───────────────────────── */

export const LICENSE_KEY_MESSAGE = "Keys look like BPX-MRI-XXXX-XXXX-XXXX. Check the format and try again.";

/** A pasted key, normalised (case and separators do not matter) and checked against the key format. */
export const licenseKeySchema = z
  .string()
  .transform(normalizeLicenseKey)
  .refine(isLicenseKeyFormat, { error: LICENSE_KEY_MESSAGE });

export type LicenseKey = z.output<typeof licenseKeySchema>;

/* ───────────────────────── Promo codes ───────────────────────── */

/** Trimmed, uppercased, inner whitespace removed: " nrtw 2026 " → "NRTW2026". */
export function normalizePromo(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * A promo code: normalised, then matched against the codes that exist. Only NRTW2026 exists today; add
 * codes here, not in components. Whether the code applies right now (dates, eligible lines) is decided
 * by `validatePromo` in `@/lib/pricing`, which has the clock and the cart.
 */
export const promoCodeSchema = z
  .string()
  .transform(normalizePromo)
  .superRefine(
    firstFailing([
      [(code) => code.length > 0, "Enter a promo code."],
      [(code) => code === nrtw.code, "That code is not recognised."],
    ]),
  );

export type PromoCode = z.output<typeof promoCodeSchema>;
