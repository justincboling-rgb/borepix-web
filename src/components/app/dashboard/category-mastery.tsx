import { TrendingDown } from "lucide-react";
import type { ExamTrack } from "@/lib/content/types";
import { CATEGORY_LABEL, TRACK_LABEL } from "@/lib/content/types";
import type { Mastery } from "@/lib/store/progress";

type Props = {
  track: ExamTrack;
  mastery: Mastery[];
  /** Category flagged as weakest, if any. */
  weakest: Mastery["category"] | null;
};

/**
 * Accuracy bars for the four ARRT® content categories. The bars are decorative; screen readers get the
 * same numbers from a visually hidden table.
 */
export function CategoryMastery({ track, mastery, weakest }: Props) {
  return (
    <section aria-labelledby="mastery-heading" className="panel rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="mastery-heading" className="text-xl font-semibold text-fg">
          Category mastery
        </h2>
        <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted">{TRACK_LABEL[track]}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Accuracy on your most recent answers in each ARRT® content category.
      </p>

      <table className="sr-only">
        <caption>Category mastery, {TRACK_LABEL[track]}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Accuracy</th>
            <th scope="col">Questions answered</th>
          </tr>
        </thead>
        <tbody>
          {mastery.map((m) => (
            <tr key={m.category}>
              <th scope="row">
                {CATEGORY_LABEL[m.category]}
                {m.category === weakest ? " (weakest)" : ""}
              </th>
              <td>{m.pct === null ? "No answers yet" : `${m.pct}%`}</td>
              <td>{m.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul aria-hidden className="mt-6 space-y-5">
        {mastery.map((m) => (
          <li key={m.category}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="flex items-center gap-2 text-sm font-medium text-fg">
                {CATEGORY_LABEL[m.category]}
                {m.category === weakest ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[0.6875rem] font-medium text-warning">
                    <TrendingDown strokeWidth={1.75} className="size-3" />
                    Weakest
                  </span>
                ) : null}
              </span>
              <span className="num text-sm text-muted">
                {m.pct === null ? (
                  "No answers yet"
                ) : (
                  <>
                    <span className="font-semibold text-fg">{m.pct}%</span>
                    <span> · {m.total} answered</span>
                  </>
                )}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              {m.pct !== null && m.pct > 0 ? (
                <div
                  className="h-full rounded-full bg-linear-to-r from-pink-strong via-pink to-blush"
                  style={{ width: `${m.pct}%` }}
                />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
