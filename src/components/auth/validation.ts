/**
 * Thin wrappers over the shared schemas in `@/lib/schemas`: each returns the schema's first message, or
 * undefined when the value passes, which is the shape the auth and settings forms keep in state.
 */

import {
  emailSchema,
  examDateSchema,
  firstIssueMessage,
  nameSchema,
  passwordSchema,
  phoneSchema,
  postalCodeSchema,
} from "@/lib/schemas";

export { NAME_MAX, PASSWORD_MIN, PHONE_MAX_DIGITS, PHONE_MIN_DIGITS, POSTAL_MAX, POSTAL_MIN } from "@/lib/schemas";

/** `label` names the field in the message: "name" (default), "first name" or "last name". */
export function validateName(value: string, label = "name"): string | undefined {
  return firstIssueMessage(nameSchema(label).safeParse(value));
}

export function validateEmail(value: string): string | undefined {
  return firstIssueMessage(emailSchema.safeParse(value));
}

export function validateNewPassword(value: string): string | undefined {
  return firstIssueMessage(passwordSchema.safeParse(value));
}

/**
 * National phone number as typed (spaces, dashes and parentheses are fine). Only digits count, and with
 * `dialCode` (e.g. "+1") the full E.164 number must also stay within 15 digits.
 */
export function validatePhone(value: string, dialCode = ""): string | undefined {
  return firstIssueMessage(phoneSchema(dialCode).safeParse(value));
}

export function validatePostalCode(value: string): string | undefined {
  return firstIssueMessage(postalCodeSchema.safeParse(value));
}

/** Optional YYYY-MM-DD; when present it must be a real date, today or later. `now` comes from the caller. */
export function validateExamDate(value: string, now: number): string | undefined {
  return firstIssueMessage(examDateSchema(now).safeParse(value));
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
