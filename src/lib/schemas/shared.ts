import type { z } from "zod";

/** Deliberately permissive (something@something.tld, no spaces): it only catches obvious typos. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ───────────────────────── Rule chains ───────────────────────── */

/** One rule of a field: the predicate that must hold, and the message shown when it does not. */
export type Rule<T> = readonly [holds: (value: T) => boolean, message: string];

/**
 * A `superRefine` callback that reports the first failing rule only, exactly as the hand-written
 * validators returned the first message of their if-chain. It never aborts the parse, so an object
 * schema's own cross-field checks (CVC against the card brand, ZIP against the country) still run; an
 * aborting check on a field would silently skip them.
 */
export function firstFailing<T>(rules: readonly Rule<T>[]): (value: T, ctx: z.core.$RefinementCtx<T>) => void {
  return (value, ctx) => {
    for (const [holds, message] of rules) {
      if (holds(value)) continue;
      ctx.addIssue({ code: "custom", message });
      return;
    }
  };
}

/* ───────────────────────── Reading results ───────────────────────── */

type ParseIssue = { readonly path: ReadonlyArray<PropertyKey>; readonly message: string };

/** The parts of a Zod `safeParse` failure these helpers read; structural, so any schema's result fits. */
export type ParseFailure = { success: false; error: { issues: ReadonlyArray<ParseIssue> } };
export type ParseOutcome = { success: true } | ParseFailure;

/** The message of the first issue, or undefined when the parse succeeded. */
export function firstIssueMessage(result: ParseFailure): string;
export function firstIssueMessage(result: ParseOutcome): string | undefined;
export function firstIssueMessage(result: ParseOutcome): string | undefined {
  return result.success ? undefined : result.error.issues[0]?.message;
}

/**
 * One message per top-level field, the first issue for that field winning, keyed in the order the issues
 * were raised. This is the `Partial<Record<Field, string>>` shape every form keeps in state.
 */
export function fieldErrors<K extends string = string>(result: ParseOutcome): Partial<Record<K, string>> {
  const errors: Partial<Record<K, string>> = {};
  if (result.success) return errors;
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string") continue;
    const field = key as K;
    if (errors[field] === undefined) errors[field] = issue.message;
  }
  return errors;
}
