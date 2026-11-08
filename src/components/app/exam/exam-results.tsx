"use client";

import { useState, type ReactNode } from "react";
import { CircleCheck, CircleDashed, CircleX, Flag, RotateCcw, Target, Timer } from "lucide-react";
import { TRACK_LABEL } from "@/lib/content/types";
import { getQuestion } from "@/lib/content/questions";
import type { ExamAnswer, ExamResult } from "@/lib/store/progress";
import { QuestionCard } from "@/components/app/question-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { CategoryBreakdown, categoryRows, weakestCategory } from "@/components/app/practice/category-breakdown";
import { useFocusOnMount } from "@/components/app/practice/use-focus-on-mount";
import { cn } from "@/lib/cn";
import { APPROXIMATE_MINUTES_PER_ITEM, formatClock, formatDuration } from "./exam-model";

type Filter = "all" | "incorrect" | "flagged";

type Props = {
  result: ExamResult;
  autoSubmitted: boolean;
  approximatePace: boolean;
  onNewExam: () => void;
  focusHeading: boolean;
};

export function ExamResults({ result, autoSubmitted, approximatePace, onNewExam, focusHeading }: Props) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>(focusHeading);
  const [filter, setFilter] = useState<Filter>("all");

  const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
  const usedSec = Math.min(result.timeLimitSec, Math.max(0, Math.round((result.finishedAt - result.startedAt) / 1000)));
  const rows = categoryRows(result.byCategory);
  const weakest = weakestCategory(rows);
  const unansweredCount = result.answers.filter((a) => a.choice === null).length;
  const counts: Record<Filter, number> = {
    all: result.answers.length,
    incorrect: result.answers.filter((a) => !a.correct).length,
    flagged: result.answers.filter((a) => a.flagged).length,
  };
  const items = result.answers
    .map((answer, index) => ({ answer, index }))
    .filter(({ answer }) => (filter === "incorrect" ? !answer.correct : filter === "flagged" ? answer.flagged : true));

  const practiceHref = `/app/practice?track=${result.track}${weakest ? `&category=${weakest}` : ""}`;

  return (
    <div className="grid gap-6">
      <section className="panel relative overflow-hidden rounded-2xl p-5 sm:p-8" aria-labelledby="exam-results-title">
        <div className="haze-top pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative">
          <p className="eyebrow">Mock exam results</p>
          <h1
            id="exam-results-title"
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 text-3xl font-semibold text-fg sm:text-4xl"
          >
            {TRACK_LABEL[result.track]} mock exam results
          </h1>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="num text-6xl font-semibold leading-none text-fg sm:text-7xl">{pct}%</p>
              <p className="mt-2 text-lg text-muted">
                <span className="num text-fg">{result.correct}</span> of <span className="num text-fg">{result.total}</span>{" "}
                correct
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-3 sm:min-w-96">
              <Stat label="Time used" value={formatClock(usedSec)} sub={`of ${formatDuration(result.timeLimitSec)}`} />
              <Stat label="Unanswered" value={String(unansweredCount)} />
              <Stat label="Flagged" value={String(counts.flagged)} />
            </dl>
          </div>

          <p className="mt-6 max-w-2xl text-sm text-muted">
            Raw percentage on Borepix practice items. ARRT® reports scaled scores; this is not a prediction of your
            scaled score.
          </p>
          <ul className="mt-3 grid gap-1.5 text-sm text-muted">
            {autoSubmitted ? (
              <li className="flex items-start gap-2">
                <Timer className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
                Time ran out, so the exam was submitted automatically.
              </li>
            ) : null}
            {approximatePace ? (
              <li className="flex items-start gap-2">
                <Timer className="mt-0.5 size-4 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
                The time limit used an approximate pace of {APPROXIMATE_MINUTES_PER_ITEM} minutes per item.
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
              Saved to your progress on this device.
            </li>
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={practiceHref} size="lg">
              <Target className="size-5" strokeWidth={1.75} aria-hidden />
              Practice weak areas
            </ButtonLink>
            <Button variant="secondary" size="lg" onClick={onNewExam}>
              <RotateCcw className="size-5" strokeWidth={1.75} aria-hidden />
              New mock exam
            </Button>
          </div>
        </div>
      </section>

      <section className="panel rounded-2xl p-5 sm:p-7" aria-labelledby="exam-results-categories">
        <h2 id="exam-results-categories" className="text-lg font-semibold text-fg">
          Score by category
        </h2>
        <p className="mt-1 text-sm text-muted">Categories were hidden during the exam.</p>
        <CategoryBreakdown rows={rows} weakest={weakest} className="mt-5" />
      </section>

      <section aria-labelledby="exam-results-review">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="exam-results-review" className="text-lg font-semibold text-fg">
              Review every item
            </h2>
            <p className="mt-1 text-sm text-muted">Correct answers and rationales for each item.</p>
          </div>
          <div role="group" aria-label="Show items" className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["incorrect", "Incorrect"],
                ["flagged", "Flagged"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                variant="secondary"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={cn(filter === value && "border-pink/60 bg-pink/10 hover:border-pink/70 hover:bg-pink/15")}
              >
                {label}
                <span className="num text-muted">{counts[value]}</span>
              </Button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <p className="panel mt-5 rounded-2xl p-6 text-muted">
            {filter === "flagged" ? "You did not flag any items." : "No incorrect items. Every answer was correct."}
          </p>
        ) : (
          <ol className="mt-5 grid gap-5">
            {items.map(({ answer, index }) => (
              <ReviewItem key={answer.qid} answer={answer} index={index} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function ReviewItem({ answer, index }: { answer: ExamAnswer; index: number }) {
  const question = getQuestion(answer.qid);
  if (!question) return null;
  return (
    <li className="[contain-intrinsic-size:auto_36rem] [content-visibility:auto]">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="num font-medium text-fg">Item {index + 1}</span>
        {answer.choice === null ? (
          <StatusChip icon={<CircleDashed className="size-3.5" strokeWidth={1.75} aria-hidden />} className="text-muted">
            Not answered
          </StatusChip>
        ) : answer.correct ? (
          <StatusChip icon={<CircleCheck className="size-3.5" strokeWidth={1.75} aria-hidden />} className="border-success/40 text-success">
            Correct
          </StatusChip>
        ) : (
          <StatusChip icon={<CircleX className="size-3.5" strokeWidth={1.75} aria-hidden />} className="border-danger/40 text-danger">
            Incorrect
          </StatusChip>
        )}
        {answer.flagged ? (
          <StatusChip icon={<Flag className="size-3.5 fill-warning" strokeWidth={1.75} aria-hidden />} className="border-warning/40 text-warning">
            Flagged
          </StatusChip>
        ) : null}
      </div>
      <QuestionCard question={question} selected={answer.choice} revealed disabled headingLevel="h3" />
    </li>
  );
}

function StatusChip({ icon, children, className }: { icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-xs font-medium", className)}>
      {icon}
      {children}
    </span>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-2 p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="num mt-1 text-base font-semibold text-fg sm:text-lg">{value}</dd>
      {sub ? <dd className="text-xs text-muted">{sub}</dd> : null}
    </div>
  );
}
