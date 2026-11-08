import { LaunchBadge } from "@/components/commerce/launch-notice";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/pricing";
import { commerceEnabled } from "@/lib/site";

type Size = "sm" | "md" | "lg";

type Props = {
  amount: number;
  /** List price. Rendered struck through with a "Save X%" badge when it is higher than `amount`. */
  compareAt?: number;
  size?: Size;
  className?: string;
  /** What to render while commerce is disabled: nothing (default) or the launch badge where the price sat. */
  fallback?: "none" | "badge";
};

const amountSize: Record<Size, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl sm:text-4xl",
};

const compareSize: Record<Size, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

/** Whole-percent saving against the list price, never negative. */
export function savingsPercent(amount: number, compareAt: number): number {
  if (compareAt <= 0 || compareAt <= amount) return 0;
  return Math.round(((compareAt - amount) / compareAt) * 100);
}

/**
 * Price readout. While the platform is in its Alpha/Beta preview no amount or saving is printed anywhere:
 * the component renders nothing, or the launch badge when the caller asks for it.
 */
export function Price({ amount, compareAt, size = "md", className, fallback = "none" }: Props) {
  if (!commerceEnabled) {
    return fallback === "badge" ? <LaunchBadge className={className} /> : null;
  }

  const percent = compareAt !== undefined ? savingsPercent(amount, compareAt) : 0;
  const showCompare = compareAt !== undefined && percent > 0;

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-1", className)}>
      <span className={cn("num font-semibold tracking-tight text-fg", amountSize[size])}>{formatPrice(amount)}</span>
      {showCompare ? (
        <>
          <s className={cn("num text-muted", compareSize[size])}>
            <span className="sr-only">List price </span>
            {formatPrice(compareAt)}
          </s>
          <Badge tone="success" className="self-center">
            Save {percent}%
          </Badge>
        </>
      ) : null}
    </p>
  );
}
