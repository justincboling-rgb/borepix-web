import { Timer } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatTimestamp } from "@/components/app/shell/exam-date";
import { TRACK_LABEL } from "@/lib/content/types";
import type { ExamResult } from "@/lib/store/progress";

function minutesUsed(exam: ExamResult): number {
  return Math.max(1, Math.round((exam.finishedAt - exam.startedAt) / 60_000));
}

/** The latest mock exams as a read-only summary (no links into individual attempts). */
export function RecentExams({ exams, examHref }: { exams: ExamResult[]; examHref: string }) {
  return (
    <section aria-labelledby="recent-exams-heading" className="panel flex w-full flex-col rounded-2xl p-5 sm:p-6">
      <h2 id="recent-exams-heading" className="text-xl font-semibold text-fg">
        Recent mock exams
      </h2>

      {exams.length === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center py-6">
          <span className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-silver">
            <Timer aria-hidden strokeWidth={1.75} className="size-5" />
          </span>
          <p className="mt-4 font-medium text-fg">No mock exams yet.</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            A timed mock exam shows how you perform across all four content categories under exam conditions.
          </p>
          <ButtonLink href={examHref} variant="secondary" size="sm" className="mt-5">
            Start a mock exam
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-white/8">
          {exams.map((exam) => {
            const pct = exam.total ? Math.round((exam.correct / exam.total) * 100) : 0;
            return (
              <li key={exam.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">
                    <time dateTime={new Date(exam.finishedAt).toISOString()}>{formatTimestamp(exam.finishedAt)}</time>
                    <span className="text-muted"> · {TRACK_LABEL[exam.track]}</span>
                  </p>
                  <p className="num mt-0.5 text-xs text-muted">
                    {exam.correct} of {exam.total} correct · {minutesUsed(exam)} min
                  </p>
                </div>
                <p className="num shrink-0 text-xl font-semibold text-fg">
                  {pct}
                  <span className="text-sm font-medium text-muted">%</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
