"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { useHydrated, useProgress } from "@/lib/store/progress";

type LessonRef = { slug: string; title: string };

/** Overall MRI Mastery progress with a link to the first lesson not yet completed. */
export function MriProgress({ lessons }: { lessons: LessonRef[] }) {
  const progress = useProgress();
  const hydrated = useHydrated();

  const doneSet = new Set(progress.lessonsDone);
  const total = lessons.length;
  const done = hydrated ? lessons.filter((l) => doneSet.has(l.slug)).length : 0;
  const next = lessons.find((l) => !doneSet.has(l.slug));
  const ratio = total ? done / total : 0;

  return (
    <section aria-labelledby="mri-progress-heading" className="panel rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="min-w-0 flex-1">
          <h2 id="mri-progress-heading" className="font-sans text-sm font-medium text-muted">
            Your progress
          </h2>
          <p className="mt-1 text-fg">
            <span className="num text-3xl font-semibold">{hydrated ? done : "–"}</span>
            <span className="ml-2 text-muted">
              of <span className="num">{total}</span> {total === 1 ? "lesson" : "lessons"} complete
            </span>
          </p>
          <div
            role="progressbar"
            aria-labelledby="mri-progress-heading"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            aria-valuetext={`${done} of ${total} lessons complete`}
            className="mt-3 h-2 overflow-hidden rounded-full bg-white/8"
          >
            <div
              className="h-full origin-left rounded-full bg-pink motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out-expo"
              style={{ transform: `scaleX(${ratio})` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">Progress is saved in this browser.</p>
        </div>

        <div className="min-h-11 md:max-w-sm md:text-right">
          {!hydrated ? null : next ? (
            <div className="flex flex-col gap-3 md:items-end">
              <p className="text-sm text-muted">
                {done ? "Up next" : "Start here"}: <span className="text-fg">{next.title}</span>
              </p>
              <ButtonLink href={`/app/mri/${next.slug}`} className="self-start md:self-end">
                {done ? "Continue" : "Start first lesson"}
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          ) : total ? (
            <p className="inline-flex items-center gap-2 font-medium text-success">
              <CheckCircle2 className="size-5" strokeWidth={1.75} aria-hidden />
              Every lesson complete
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
