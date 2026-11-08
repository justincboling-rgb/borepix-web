/**
 * Date formatting for orders, keys and pledges. Call only from client components: every timestamp
 * here comes from localStorage, which does not exist on the server.
 */

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** "Nov 8, 2026" */
export function formatOrderDate(ts: number): string {
  return DATE.format(new Date(ts));
}

/** "Nov 8, 2026, 3:42 PM" */
export function formatOrderDateTime(ts: number): string {
  return DATE_TIME.format(new Date(ts));
}

/** Machine-readable value for <time dateTime>. */
export function isoDate(ts: number): string {
  return new Date(ts).toISOString();
}
