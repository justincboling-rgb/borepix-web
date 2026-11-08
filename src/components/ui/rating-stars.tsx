import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  /** 0–5 in any step; rendered to the nearest half star. */
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
};

/** Five-star rating with an accessible text equivalent. */
export function RatingStars({ rating, reviewCount, size = "sm", className }: Props) {
  const half = Math.round(rating * 2) / 2;
  const full = Math.floor(half);
  const hasHalf = half - full === 0.5;
  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const label = `${rating.toFixed(1)} out of 5 stars${reviewCount !== undefined ? `, ${reviewCount.toLocaleString("en-US")} ratings` : ""}`;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} role="img" aria-label={label}>
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < full;
          const isHalf = !filled && hasHalf && i === full;
          return (
            <span key={i} className={cn("relative inline-flex", iconSize)}>
              <Star className={cn(iconSize, "text-white/20")} strokeWidth={1.5} fill="currentColor" />
              {filled ? (
                <Star className={cn(iconSize, "absolute inset-0 text-warning")} strokeWidth={1.5} fill="currentColor" />
              ) : isHalf ? (
                <StarHalf className={cn(iconSize, "absolute inset-0 text-warning")} strokeWidth={1.5} fill="currentColor" />
              ) : null}
            </span>
          );
        })}
      </span>
      <span className="num text-xs text-muted" aria-hidden>
        {rating.toFixed(1)}
        {reviewCount !== undefined ? ` (${reviewCount.toLocaleString("en-US")})` : ""}
      </span>
    </span>
  );
}
