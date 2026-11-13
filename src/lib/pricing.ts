import { getNrtwStatus, nrtw } from "@/data/nrtw";
import { firstIssueMessage, promoCodeSchema } from "@/lib/schemas";

/** "$49.99", "$199.00". Always two decimals so totals line up. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

/** Round to cents without floating-point drift. */
export function cents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export type PromoResult =
  | { ok: true; code: string; percent: number; description: string }
  | { ok: false; reason: string };

/**
 * Validate a promo code against the current date and the promo-eligible subtotal. The code itself is
 * normalised and matched by `promoCodeSchema` (`@/lib/schemas`), which is where new codes are added.
 */
export function validatePromo(code: string, now: Date, eligibleSubtotal: number): PromoResult {
  const parsed = promoCodeSchema.safeParse(code);
  if (!parsed.success) return { ok: false, reason: firstIssueMessage(parsed) };
  const status = getNrtwStatus(now);
  if (status.phase === "ended") return { ok: false, reason: `${nrtw.code} ended on November 14, 2026.` };
  if (!status.promoActive) return { ok: false, reason: `${nrtw.code} activates on November 1, 2026.` };
  if (eligibleSubtotal <= 0) {
    return { ok: false, reason: `${nrtw.code} applies to test keys and suites. Add one to your cart to use it.` };
  }
  return {
    ok: true,
    code: nrtw.code,
    percent: nrtw.percent,
    description: `${nrtw.percent}% off test keys and suites for ${nrtw.name}`,
  };
}

export type PricedLine = { unitPrice: number; qty: number; promoEligible: boolean };

export type Totals = {
  subtotal: number;
  eligibleSubtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  promo: { code: string; percent: number } | null;
  /** Set when a stored code no longer applies (expired, nothing eligible). */
  promoError: string | null;
};

export function computeTotals(lines: PricedLine[], promoCode: string | null, now: Date): Totals {
  const subtotal = cents(lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0));
  const eligibleSubtotal = cents(lines.filter((l) => l.promoEligible).reduce((sum, l) => sum + l.unitPrice * l.qty, 0));
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  let discount = 0;
  let promo: Totals["promo"] = null;
  let promoError: string | null = null;

  if (promoCode) {
    const result = validatePromo(promoCode, now, eligibleSubtotal);
    if (result.ok) {
      discount = cents((eligibleSubtotal * result.percent) / 100);
      promo = { code: result.code, percent: result.percent };
    } else {
      promoError = result.reason;
    }
  }

  return { subtotal, eligibleSubtotal, discount, total: cents(subtotal - discount), itemCount, promo, promoError };
}
