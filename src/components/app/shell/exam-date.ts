/**
 * Helpers for the learner's exam date, stored as a local calendar day (YYYY-MM-DD).
 * Pure functions: callers pass `now` (from useNow or an event handler), never read the clock here.
 */

const DAY_MS = 86_400_000;
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse YYYY-MM-DD as local midnight. Returns null for malformed or impossible dates. */
export function parseIsoDay(iso: string): Date | null {
  const match = ISO_DAY.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
}

/** Whole calendar days from today to the exam (0 = exam day, negative = passed). */
export function daysUntil(iso: string, now: number): number | null {
  const target = parseIsoDay(iso);
  if (!target) return null;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  // Math.round absorbs the one-hour skew of daylight saving transitions.
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

/** "42 days to exam", "1 day to exam", "Exam day", "Exam date passed". */
export function countdownLabel(days: number): string {
  if (days > 1) return `${days} days to exam`;
  if (days === 1) return "1 day to exam";
  if (days === 0) return "Exam day";
  return "Exam date passed";
}

const longDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "Mar 14, 2027". Falls back to the raw string if it cannot be parsed. */
export function formatIsoDay(iso: string): string {
  const date = parseIsoDay(iso);
  return date ? longDate.format(date) : iso;
}

/** "Mar 14, 2027" for an epoch timestamp. */
export function formatTimestamp(ts: number): string {
  return longDate.format(new Date(ts));
}
