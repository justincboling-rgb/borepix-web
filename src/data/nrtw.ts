/**
 * National Radiologic Technology Week 2026 (NRTW). Celebrated the week of November 8, the anniversary
 * of Röntgen's discovery of the x-ray in 1895. All dates are America/New_York.
 */
export const nrtw = {
  name: "National Radiologic Technology Week",
  short: "NRTW 2026",
  year: 2026,
  /** Printed date range. */
  dates: "November 8–14, 2026",
  /** First day of the week (local midnight, EST). */
  start: "2026-11-08T00:00:00-05:00",
  /** Exclusive end: midnight after the last day (local midnight, EST). */
  end: "2026-11-15T00:00:00-05:00",
  /** The promo code opens early so the week's offer is live when the banner goes up (local midnight, EDT). */
  promoStart: "2026-11-01T00:00:00-04:00",
  code: "NRTW2026",
  percent: 30,
  eligibility: "all advanced modality test keys and suites",
  tagline: "One week a year the suite celebrates you. We are marking it with 30% off every test key.",
  fact: "November 8 marks the day in 1895 that Wilhelm Röntgen discovered the x-ray.",
} as const;

export type NrtwPhase = "upcoming" | "early" | "live" | "ended";

export type NrtwStatus = {
  phase: NrtwPhase;
  /** Whole days until the week starts (only meaningful when upcoming or early). */
  daysUntil: number;
  /** Whole days remaining including today (only meaningful when live). */
  daysLeft: number;
  /** Whether NRTW2026 can be applied right now. */
  promoActive: boolean;
};

const DAY = 86_400_000;

export function getNrtwStatus(now: Date): NrtwStatus {
  const t = now.getTime();
  const start = Date.parse(nrtw.start);
  const end = Date.parse(nrtw.end);
  const promoStart = Date.parse(nrtw.promoStart);
  const promoActive = t >= promoStart && t < end;
  const daysUntil = Math.max(0, Math.ceil((start - t) / DAY));
  const daysLeft = Math.max(0, Math.ceil((end - t) / DAY));
  const phase: NrtwPhase = t >= end ? "ended" : t >= start ? "live" : t >= promoStart ? "early" : "upcoming";
  return { phase, daysUntil, daysLeft, promoActive };
}
