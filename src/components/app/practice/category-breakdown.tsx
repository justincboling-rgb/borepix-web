import { TrendingDown } from "lucide-react";
import type { ContentCategory } from "@/lib/content/types";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/content/types";
import { cn } from "@/lib/cn";

export type CategoryScore = { correct: number; total: number };

export type CategoryRow = CategoryScore & { category: ContentCategory };

/** Rows in canonical category order, skipping categories with no items. */
export function categoryRows(scores: Partial<Record<ContentCategory, CategoryScore>>): CategoryRow[] {
  return CATEGORIES.flatMap((category) => {
    const s = scores[category];
    return s && s.total > 0 ? [{ category, correct: s.correct, total: s.total }] : [];
  });
}

/**
 * Lowest-scoring category with at least one item. Ties go to the category with more misses,
 * then to canonical order. Null when nothing was answered.
 */
export function weakestCategory(rows: CategoryRow[]): ContentCategory | null {
  let best: CategoryRow | null = null;
  for (const r of rows) {
    if (r.total === 0) continue;
    if (!best) {
      best = r;
      continue;
    }
    const pr = r.correct / r.total;
    const pb = best.correct / best.total;
    if (pr < pb || (pr === pb && r.total - r.correct > best.total - best.correct)) best = r;
  }
  return best ? best.category : null;
}

function pct(r: CategoryScore) {
  return r.total ? Math.round((r.correct / r.total) * 100) : 0;
}

type Props = {
  rows: CategoryRow[];
  /** Marks this category as the weakest area (icon + text, not color alone). */
  weakest?: ContentCategory | null;
  className?: string;
};

/** Score by content category as labelled horizontal bars. The text carries the data; bars are decorative. */
export function CategoryBreakdown({ rows, weakest, className }: Props) {
  if (!rows.length) {
    return <p className={cn("text-muted", className)}>No answered items to break down yet.</p>;
  }
  return (
    <ul className={cn("grid gap-4", className)}>
      {rows.map((r) => {
        const p = pct(r);
        const isWeakest = weakest === r.category && rows.length > 1;
        return (
          <li key={r.category}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="flex items-center gap-2 font-medium text-fg">
                {CATEGORY_LABEL[r.category]}
                {isWeakest ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    <TrendingDown className="size-3.5" strokeWidth={1.75} aria-hidden />
                    Weakest area
                  </span>
                ) : null}
              </span>
              <span className="num text-sm text-muted">
                {r.correct} of {r.total} correct <span className="text-fg">{p}%</span>
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
              <div
                className={cn(
                  "h-full w-full origin-left rounded-full transition-transform duration-500 ease-out-expo",
                  isWeakest ? "bg-warning/80" : "bg-linear-to-r from-pink-strong to-rose",
                )}
                style={{ transform: `scaleX(${p / 100})` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
