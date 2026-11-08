const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Compact interval label for grade previews: "10 min", "3 hr", "1 day", "6 days", "2 mo", "1.4 yr". */
export function formatInterval(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))} min`;
  if (ms < DAY) return `${Math.round(ms / HOUR)} hr`;
  const days = Math.round(ms / DAY);
  if (days < 31) return days === 1 ? "1 day" : `${days} days`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} mo`;
  }
  return `${(days / 365).toFixed(1)} yr`;
}

/** "in 10 min", "in 1 day". */
export function formatRelative(ms: number): string {
  return `in ${formatInterval(Math.max(0, ms))}`;
}

/** Locale date and time, client-only (call after hydration). */
export function formatDateTime(epochMs: number): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(epochMs);
}
