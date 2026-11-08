import { daysUntil, parseIsoDay } from "@/components/app/shell/exam-date";

/** Deliberately permissive (something@something.tld, no spaces): it only catches obvious typos. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 8;
export const NAME_MAX = 80;

/** National-number digit range. E.164 allows 15 digits in total, country code included. */
export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;

export const POSTAL_MIN = 3;
export const POSTAL_MAX = 10;

/** Letters, digits, spaces and hyphens, starting and ending on a letter or digit (ZIP, ZIP+4, UK, CA, IE…). */
const POSTAL_RE = /^[A-Za-z0-9](?:[A-Za-z0-9 -]*[A-Za-z0-9])?$/;

/** `label` names the field in the message: "name" (default), "first name" or "last name". */
export function validateName(value: string, label = "name"): string | undefined {
  const v = value.trim();
  if (!v) return `Enter your ${label}.`;
  if (v.length > NAME_MAX) return `Keep your ${label} under ${NAME_MAX} characters.`;
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Enter your email address.";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address, like name@example.com.";
  return undefined;
}

export function validateNewPassword(value: string): string | undefined {
  if (!value) return "Create a password.";
  if (value.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  return undefined;
}

/**
 * National phone number as typed (spaces, dashes and parentheses are fine). Only digits count, and with
 * `dialCode` (e.g. "+1") the full E.164 number must also stay within 15 digits.
 */
export function validatePhone(value: string, dialCode = ""): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Enter your phone number.";
  if (digits.length < PHONE_MIN_DIGITS) return `Enter a valid phone number with at least ${PHONE_MIN_DIGITS} digits.`;
  const total = dialCode.replace(/\D/g, "").length + digits.length;
  if (digits.length > PHONE_MAX_DIGITS || total > PHONE_MAX_DIGITS) {
    return `Enter a valid phone number: ${PHONE_MAX_DIGITS} digits at most, country code included.`;
  }
  return undefined;
}

export function validatePostalCode(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Enter your postal code.";
  if (v.length < POSTAL_MIN || v.length > POSTAL_MAX || !POSTAL_RE.test(v)) {
    return `Enter a valid postal code (${POSTAL_MIN}–${POSTAL_MAX} letters or digits).`;
  }
  return undefined;
}

/** Optional YYYY-MM-DD; when present it must be a real date, today or later. `now` comes from the caller. */
export function validateExamDate(value: string, now: number): string | undefined {
  if (!value) return undefined;
  if (!parseIsoDay(value)) return "Enter a valid date.";
  const days = daysUntil(value, now);
  if (days !== null && days < 0) return "Choose today or a future date, or leave this blank.";
  return undefined;
}

/** Focus the first invalid control, in form order. Radio groups focus their checked (or first) option. */
export function focusFirstInvalid(form: HTMLFormElement, order: readonly string[], errors: Record<string, unknown>) {
  const first = order.find((key) => errors[key]);
  if (!first) return;
  const item = form.elements.namedItem(first);
  if (!item) return;
  if (item instanceof RadioNodeList) {
    const radios = Array.from(item).filter((n): n is HTMLInputElement => n instanceof HTMLInputElement);
    (radios.find((r) => r.checked) ?? radios[0])?.focus();
    return;
  }
  if (item instanceof HTMLElement) item.focus();
}
