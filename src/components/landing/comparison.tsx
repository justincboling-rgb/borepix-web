import { SectionHeading } from "@/components/ui/section-heading";
import { AvailabilityMark, type Availability } from "@/components/landing/core/availability";
import { cn } from "@/lib/cn";

type ColumnKey = "borepix" | "books" | "lectures";
type Cell = { value: Availability; note?: string };
type Row = { feature: string } & Record<ColumnKey, Cell>;

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "borepix", label: "Borepix" },
  { key: "books", label: "Review books" },
  { key: "lectures", label: "Lecture-only courses" },
];

/**
 * Category-level comparison, kept deliberately fair: review books do have practice questions, and
 * lecture courses vary. "Partial" means some products in that category offer the feature, or a
 * limited version of it. No competitor is named.
 */
const ROWS: Row[] = [
  {
    feature: "Exam-style practice questions with full rationales",
    borepix: { value: "included" },
    books: { value: "included", note: "Explanation depth varies by title" },
    lectures: { value: "partial", note: "Often end-of-module quizzes" },
  },
  {
    feature: "Timed computer-based exam simulation",
    borepix: { value: "included" },
    books: { value: "partial", note: "Some titles add online practice tests" },
    lectures: { value: "none" },
  },
  {
    feature: "Interactive MRI physics visualizations",
    borepix: { value: "included" },
    books: { value: "none", note: "Static diagrams" },
    lectures: { value: "partial", note: "Slides and video, not hands-on" },
  },
  {
    feature: "Spaced-repetition review",
    borepix: { value: "included" },
    books: { value: "none" },
    lectures: { value: "none" },
  },
  {
    feature: "Progress tracked by ARRT® content category",
    borepix: { value: "included" },
    books: { value: "none" },
    lectures: { value: "partial", note: "Usually course completion, not category scores" },
  },
  {
    feature: "Study on your phone",
    borepix: { value: "included", note: "Web app today; native apps coming soon" },
    books: { value: "partial", note: "E-book editions" },
    lectures: { value: "partial", note: "Online courses only" },
  },
  {
    feature: "Content updated as specifications change",
    borepix: { value: "included" },
    books: { value: "partial", note: "New editions on a publishing cycle" },
    lectures: { value: "partial", note: "Varies by provider" },
  },
];

const FOOTNOTE =
  "Review books and lecture courses vary by publisher and provider. Partial means some products in that category include the feature, or a limited version of it.";

export function Comparison() {
  return (
    <section id="compare" aria-labelledby="compare-title" className="relative py-24 sm:py-32">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 h-96" />
      <div className="container-x relative">
        <SectionHeading
          id="compare-title"
          eyebrow="Compare"
          className="reveal"
          title={
            <>
              Books and lectures teach the content.{" "}
              <span className="text-gradient">Borepix trains you for the exam.</span>
            </>
          }
          lede="Review books and lecture courses both earn a place in registry prep. Here is a straight look at what each format covers, and where Borepix fills the gaps."
        />

        {/* lg and up: a real data table. */}
        <div className="reveal mt-16 hidden lg:block">
          <table className="w-full table-fixed border-separate border-spacing-0 text-left">
            <caption className="caption-bottom pt-6 text-left text-sm leading-relaxed text-muted">
              Borepix compared with review books and lecture-only courses. {FOOTNOTE}
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-[36%] border-b border-b-white/10 pr-6 pb-4 text-left align-bottom font-mono text-xs font-medium uppercase tracking-[0.16em] text-muted"
                >
                  Feature
                </th>
                {COLUMNS.map((col) =>
                  col.key === "borepix" ? (
                    <th
                      key={col.key}
                      scope="col"
                      className="relative w-[21.33%] rounded-t-2xl border-x border-t border-b border-x-pink/35 border-t-pink/35 border-b-white/10 bg-pink/[0.07] px-5 pt-6 pb-4 text-left align-bottom"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-6 -top-px h-0.5 rounded-full bg-linear-to-r from-blush via-pink to-rose"
                      />
                      <span className="font-display text-lg font-semibold text-fg">{col.label}</span>
                    </th>
                  ) : (
                    <th
                      key={col.key}
                      scope="col"
                      className="w-[21.33%] border-b border-b-white/10 px-5 pb-4 text-left align-bottom font-display text-base font-semibold text-fg"
                    >
                      {col.label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, r) => {
                const lastRow = r === ROWS.length - 1;
                return (
                  <tr key={row.feature}>
                    <th
                      scope="row"
                      className={cn(
                        "py-5 pr-6 text-left align-top text-[0.95rem] font-medium leading-snug text-fg",
                        !lastRow && "border-b border-b-white/8",
                      )}
                    >
                      {row.feature}
                    </th>
                    {COLUMNS.map((col) => {
                      const highlight = col.key === "borepix";
                      const cell = row[col.key];
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "px-5 py-5 align-top",
                            highlight && "border-x border-x-pink/35 bg-pink/[0.04]",
                            !lastRow && "border-b border-b-white/8",
                            highlight && lastRow && "rounded-b-2xl border-b border-b-pink/35",
                          )}
                        >
                          <AvailabilityMark value={cell.value} note={cell.note} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Below lg: one card per row, so nothing scrolls sideways. display:none also hides it from AT at lg+. */}
        <div className="mt-12 sm:mt-14 lg:hidden">
          <ul role="list" className="grid gap-4 sm:grid-cols-2">
            {ROWS.map((row) => (
              <li key={row.feature} className="panel rounded-2xl p-5 sm:last:col-span-2">
                <h3 className="font-sans text-base font-semibold leading-snug text-fg">{row.feature}</h3>
                <dl className="mt-4 grid gap-2">
                  {COLUMNS.map((col) => {
                    const highlight = col.key === "borepix";
                    const cell = row[col.key];
                    return (
                      <div
                        key={col.key}
                        className={cn(
                          "grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-4 rounded-xl border px-3.5 py-3",
                          highlight ? "border-pink/35 bg-pink/[0.06]" : "border-white/6 bg-white/[0.02]",
                        )}
                      >
                        <dt className={cn("text-sm", highlight ? "font-semibold text-fg" : "text-muted")}>
                          {col.label}
                        </dt>
                        <dd>
                          <AvailabilityMark value={cell.value} note={cell.note} />
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-muted">{FOOTNOTE}</p>
        </div>
      </div>
    </section>
  );
}
