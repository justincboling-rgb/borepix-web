"use client";

import { useRef } from "react";
import { flushSync } from "react-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { completeLesson, useHydrated, useProgress } from "@/lib/store/progress";

type Props = {
  slug: string;
  next?: { slug: string; title: string };
};

/** "Mark lesson complete" control. After completion it shows a confirmation and moves focus to it. */
export function CompleteLesson({ slug, next }: Props) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const statusRef = useRef<HTMLDivElement>(null);
  const done = progress.lessonsDone.includes(slug);

  function onComplete() {
    flushSync(() => completeLesson(slug));
    statusRef.current?.focus();
  }

  if (!hydrated) return <div className="min-h-[4.5rem]" aria-hidden />;

  if (done) {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        className="flex min-h-[4.5rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-success/30 bg-success/10 px-5 py-4"
      >
        <p className="flex items-center gap-2 font-semibold text-success">
          <CheckCircle2 className="size-5" strokeWidth={1.75} aria-hidden />
          Lesson complete
        </p>
        {next ? (
          <ButtonLink href={`/app/mri/${next.slug}`} variant="secondary" size="sm">
            Next lesson
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        ) : (
          <ButtonLink href="/app/mri" variant="secondary" size="sm">
            All lessons
          </ButtonLink>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-[4.5rem] flex-wrap items-center gap-x-5 gap-y-3">
      <Button onClick={onComplete}>
        <CheckCircle2 className="size-4" aria-hidden />
        Mark lesson complete
      </Button>
      <p className="text-sm text-muted">Saved to your progress in this browser.</p>
    </div>
  );
}
