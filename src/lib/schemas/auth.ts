import { z } from "zod";
import { daysUntil, parseIsoDay } from "@/components/app/shell/exam-date";
import { phoneCountry as countryFor } from "@/components/auth/countries";
import { TRACK_LABEL, type ExamTrack } from "@/lib/content/types";
import { EMAIL_RE, firstFailing } from "./shared";

export const PASSWORD_MIN = 8;
export const NAME_MAX = 80;

/** National-number digit range. E.164 allows 15 digits in total, country code included. */
export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;

export const POSTAL_MIN = 3;
export const POSTAL_MAX = 10;

/** Letters, digits, spaces and hyphens, starting and ending on a letter or digit (ZIP, ZIP+4, UK, CA, IE…). */
const POSTAL_RE = /^[A-Za-z0-9](?:[A-Za-z0-9 -]*[A-Za-z0-9])?$/;

const digitsOf = (value: string) => value.replace(/\D/g, "");

/* ───────────────────────── Fields ───────────────────────── */

export const emailSchema = z
  .string()
  .trim()
  .superRefine(
    firstFailing([
      [(v) => v.length > 0, "Enter your email address."],
      [(v) => EMAIL_RE.test(v), "Enter a valid email address, like name@example.com."],
    ]),
  );

/** `label` names the field in the message: "name" (default), "first name" or "last name". */
export function nameSchema(label = "name") {
  return z
    .string()
    .trim()
    .superRefine(
      firstFailing([
        [(v) => v.length > 0, `Enter your ${label}.`],
        [(v) => v.length <= NAME_MAX, `Keep your ${label} under ${NAME_MAX} characters.`],
      ]),
    );
}

/** A new password: never trimmed, at least `PASSWORD_MIN` characters. */
export const passwordSchema = z.string().superRefine(
  firstFailing([
    [(v) => v.length > 0, "Create a password."],
    [(v) => v.length >= PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`],
  ]),
);

/**
 * National phone number as typed (spaces, dashes and parentheses are fine). Only digits count, and with
 * `dialCode` (e.g. "+1") the full E.164 number must also stay within 15 digits.
 */
export function phoneSchema(dialCode = "") {
  const dialDigits = digitsOf(dialCode).length;
  return z.string().superRefine(
    firstFailing([
      [(v) => digitsOf(v).length > 0, "Enter your phone number."],
      [
        (v) => digitsOf(v).length >= PHONE_MIN_DIGITS,
        `Enter a valid phone number with at least ${PHONE_MIN_DIGITS} digits.`,
      ],
      [
        (v) => {
          const national = digitsOf(v).length;
          return national <= PHONE_MAX_DIGITS && dialDigits + national <= PHONE_MAX_DIGITS;
        },
        `Enter a valid phone number: ${PHONE_MAX_DIGITS} digits at most, country code included.`,
      ],
    ]),
  );
}

export const postalCodeSchema = z
  .string()
  .trim()
  .superRefine(
    firstFailing([
      [(v) => v.length > 0, "Enter your postal code."],
      [
        (v) => v.length >= POSTAL_MIN && v.length <= POSTAL_MAX && POSTAL_RE.test(v),
        `Enter a valid postal code (${POSTAL_MIN}–${POSTAL_MAX} letters or digits).`,
      ],
    ]),
  );

/** Optional YYYY-MM-DD; when present it must be a real date, today or later. `now` comes from the caller. */
export function examDateSchema(now: number) {
  return z.string().superRefine(
    firstFailing([
      [(v) => !v || parseIsoDay(v) !== null, "Enter a valid date."],
      [
        (v) => {
          if (!v) return true;
          const days = daysUntil(v, now);
          return days === null || days >= 0;
        },
        "Choose today or a future date, or leave this blank.",
      ],
    ]),
  );
}

export const examTrackSchema = z.enum(Object.keys(TRACK_LABEL) as [ExamTrack, ...ExamTrack[]]);

/* ───────────────────────── Forms ───────────────────────── */

export const TERMS_MESSAGE = "Agree to the Terms of Service, Privacy Policy and Educational Disclaimer to continue.";

/** The sign-up form. The phone number is checked against the dial code of `phoneCountry` (ISO 3166-1 alpha-2). */
export const signupSchema = z
  .object({
    email: emailSchema,
    firstName: nameSchema("first name"),
    lastName: nameSchema("last name"),
    /** Unknown codes fall back to the default country, as the phone field's select does. */
    phoneCountry: z.string(),
    /** National number as typed; validated in the cross-field check below so the dial code is known. */
    phone: z.string(),
    postalCode: postalCodeSchema,
    password: passwordSchema,
    /** A refine rather than z.literal(true): a literal mismatch aborts the object and would skip the phone check. */
    terms: z.boolean().refine((agreed) => agreed, { error: TERMS_MESSAGE }),
  })
  .superRefine((value, ctx) => {
    const phone = phoneSchema(countryFor(value.phoneCountry).dial).safeParse(value.phone);
    if (phone.success) return;
    for (const issue of phone.error.issues) ctx.addIssue({ code: "custom", path: ["phone"], message: issue.message });
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Enter your password." }),
});

/** The settings profile form; `now` is an epoch timestamp for the exam-date check. */
export function profileSchema(now: number) {
  return z.object({
    name: nameSchema(),
    email: emailSchema,
    track: examTrackSchema,
    examDate: examDateSchema(now),
  });
}

export type SignupInput = z.input<typeof signupSchema>;
export type SignupData = z.output<typeof signupSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type LoginData = z.output<typeof loginSchema>;
export type ProfileInput = z.input<ReturnType<typeof profileSchema>>;
export type ProfileData = z.output<ReturnType<typeof profileSchema>>;
