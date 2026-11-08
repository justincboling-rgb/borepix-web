"use client";

import { ChevronDown, CircleCheck, RotateCcw, Target } from "lucide-react";
import type { ContentCategory } from "@/lib/content/types";
import { CATEGORY_LABEL } from "@/lib/content/types";
import { QuestionCard } from "@/components/app/question-card";
import { Button } from "@/components/ui/button";
import { CategoryBreakdown, categoryRows, type CategoryScore } from "./category-breakdown";
import type { PracticeResult } from "./practice-runner";
import { useFocusOnMount } from "./use-focus-on-mount";

type Props = {
  results: PracticeResult[];
  /** Questions in the session as planned (may exceed results when ended early). */
  planned: number;
  onPracticeMissed: () => void;
  onNewSession: () => void;
};

export function PracticeSummary({ results, planned, onPracticeMissed, onNewSession }: Props) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const answered = results.length;
  const correct = results.filter((r) => r.correct).length;
  const missed = results.filter((r) => !r.correct);
  const pct = answered ? Math.round((correct / answered) * 100) : 0;

  const scores: Partial<Record<ContentCategory, CategoryScore>> = {};
  for (const r of results) {
    const s = (scores[r.question.category] ??= { correct: 0, total: 0 });
    s.total += 1;
    if (r.correct) s.correct += 1;
  }
  const rows = categoryRows(scores);

  return (
    <div className="grid gap-6">
      <section className="panel relative overflow-hidden rounded-2xl p-5 sm:p-7" aria-labelledby="practice-summary-title">
        <div className="haze-top pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative">
          <p className="eyebrow">Session complete</p>
          <h2 id="practice-summary-title" ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-semibold text-fg sm:text-3xl">
            {answered === 0 ? "No questions answered" : `${correct} of ${answered} correct`}
          </h2>
          {answered > 0 ? (
            <p className="mt-2 text-muted">
              <span className="num text-4xl font-semibold text-fg sm:text-5xl">{pct}%</span>
              <span className="ml-3">
                {answered < planned ? `You ended after ${answered} of ${planned} questions.` : "Every answer is saved to your progress on this device."}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-muted">You ended the session before checking an answer. Start a new session when you are ready.</p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {missed.length > 0 ? (
              <>
                <Button size="lg" onClick={onPracticeMissed}>
                  <Target className="size-5" strokeWidth={1.75} aria-hidden />
                  Practice missed
                  <span className="num text-white/80">({missed.length})</span>
                </Button>
                <Button size="lg" variant="secondary" onClick={onNewSession}>
                  <RotateCcw className="size-5" strokeWidth={1.75} aria-hidden />
                  New session
                </Button>
              </>
            ) : (
              <Button size="lg" onClick={onNewSession}>
                <RotateCcw className="size-5" strokeWidth={1.75} aria-hidden />
                New session
              </Button>
            )}
          </div>
        </div>
      </section>

      {answered > 0 ? (
        <section className="panel rounded-2xl p-5 sm:p-7" aria-labelledby="practice-by-category">
          <h2 id="practice-by-category" className="text-lg font-semibold text-fg">
            Score by category
          </h2>
          <CategoryBreakdown rows={rows} className="mt-5" />
        </section>
      ) : null}

      {answered > 0 ? (
        <section aria-labelledby="practice-missed">
          <h2 id="practice-missed" className="text-lg font-semibold text-fg">
            Missed questions
          </h2>
          {missed.length === 0 ? (
            <p className="mt-3 flex items-center gap-2 text-muted">
              <CircleCheck className="size-5 text-success" strokeWidth={1.75} aria-hidden />
              None missed in this session.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {missed.map((r) => (
                <li key={r.question.id}>
                  <details className="group panel rounded-2xl">
                    <summary className="flex min-h-14 list-none items-start gap-3 rounded-2xl p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-medium uppercase tracking-wide text-muted">
                          {CATEGORY_LABEL[r.question.category]} <span aria-hidden>&middot;</span> {r.question.topic}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-fg">{r.question.stem}</span>
                      </span>
                      <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm text-blush">
                        <span className="hidden sm:inline group-open:hidden">Review</span>
                        <span className="hidden sm:group-open:inline">Hide</span>
                        <ChevronDown
                          className="size-5 transition-transform duration-150 group-open:rotate-180"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </span>
                    </summary>
                    <div className="px-2 pb-2 sm:px-3 sm:pb-3">
                      <QuestionCard
                        question={r.question}
                        selected={r.choice}
                        revealed
                        disabled
                        headingLevel="h3"
                        className="border-white/8 bg-ink-2 shadow-none"
                      />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
