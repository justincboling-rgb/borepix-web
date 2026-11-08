"use client";

import { useId } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Question } from "@/lib/content/types";
import { CATEGORY_LABEL, TRACK_LABEL } from "@/lib/content/types";
import { cn } from "@/lib/cn";

const LETTERS = ["A", "B", "C", "D"] as const;

export type QuestionCardProps = {
  question: Question;
  /** Index of the chosen option, or null. */
  selected: number | null;
  onSelect?: (choice: number) => void;
  /** Show correct/incorrect marking. */
  revealed?: boolean;
  /** Show the rationale panel (only when revealed). Defaults to true. */
  showRationale?: boolean;
  /** Lock the options (e.g. after reveal, or in review). */
  disabled?: boolean;
  /** e.g. "Question 3 of 25". */
  counter?: string;
  /** Hide track/category chips (mock exams hide category to mirror the real exam). */
  hideMeta?: boolean;
  className?: string;
  /** Heading level used for the stem; defaults to h2. */
  headingLevel?: "h2" | "h3";
};

/**
 * Accessible multiple-choice question. Options are native radio inputs inside a fieldset, so arrow keys,
 * screen readers and form semantics work without extra code. Correct/incorrect use color + icon + text.
 */
export function QuestionCard({
  question,
  selected,
  onSelect,
  revealed = false,
  showRationale = true,
  disabled = false,
  counter,
  hideMeta = false,
  className,
  headingLevel = "h2",
}: QuestionCardProps) {
  const uid = useId();
  const name = `q-${uid}`;
  const Heading = headingLevel;
  const isCorrect = selected !== null && selected === question.answer;

  return (
    <div className={cn("panel rounded-2xl p-5 sm:p-7", className)}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {counter ? <span className="num text-xs font-medium tracking-wide text-muted">{counter}</span> : null}
        {!hideMeta ? (
          <>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted">
              {TRACK_LABEL[question.track]}
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted">
              {CATEGORY_LABEL[question.category]}
            </span>
            <span className="rounded-full border border-pink/30 bg-pink/10 px-2.5 py-0.5 text-xs text-blush">
              {question.topic}
            </span>
          </>
        ) : null}
      </div>

      <Heading id={`${name}-stem`} className="font-sans text-lg font-medium leading-relaxed text-fg sm:text-xl">
        {question.stem}
      </Heading>

      <fieldset disabled={disabled || revealed} aria-labelledby={`${name}-stem`}>
        <div className="mt-5 grid gap-3">
          {question.choices.map((choice, i) => {
            const chosen = selected === i;
            const correct = revealed && i === question.answer;
            const wrongPick = revealed && chosen && i !== question.answer;
            const id = `${name}-${i}`;
            return (
              <div key={i}>
                <label
                  htmlFor={id}
                  className={cn(
                    "group flex min-h-14 items-start gap-3 rounded-xl border px-4 py-3 transition-colors duration-150",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush",
                    !revealed && !chosen && "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]",
                    !revealed && chosen && "border-pink/60 bg-pink/10",
                    correct && "border-success/60 bg-success/10",
                    wrongPick && "border-danger/60 bg-danger/10",
                    revealed && !correct && !wrongPick && "border-white/8 opacity-70",
                    (disabled || revealed) && "cursor-default",
                  )}
                >
                  <input
                    id={id}
                    type="radio"
                    name={name}
                    value={i}
                    checked={chosen}
                    onChange={() => onSelect?.(i)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "num mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold",
                      chosen && !revealed ? "border-pink bg-pink-strong text-white" : "border-white/15 text-muted",
                      correct && "border-success bg-success text-ink",
                      wrongPick && "border-danger bg-danger text-ink",
                    )}
                  >
                    {LETTERS[i]}
                  </span>
                  <span className="flex-1 text-[0.98rem] leading-relaxed text-fg">
                    {choice}
                    {correct ? (
                      <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-success">
                        <CheckCircle2 className="size-4" aria-hidden /> Correct answer
                      </span>
                    ) : null}
                    {wrongPick ? (
                      <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-danger">
                        <XCircle className="size-4" aria-hidden /> Your answer
                      </span>
                    ) : null}
                    {revealed && question.choiceNotes ? (
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{question.choiceNotes[i]}</span>
                    ) : null}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {revealed && showRationale ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-ink-2 p-5">
          <p
            className={cn(
              "flex items-center gap-2 font-semibold",
              selected === null ? "text-muted" : isCorrect ? "text-success" : "text-danger",
            )}
          >
            {selected === null ? (
              "Not answered"
            ) : isCorrect ? (
              <>
                <CheckCircle2 className="size-5" aria-hidden /> Correct
              </>
            ) : (
              <>
                <XCircle className="size-5" aria-hidden /> Incorrect. The answer is {LETTERS[question.answer]}.
              </>
            )}
          </p>
          <p className="mt-3 leading-relaxed text-muted">{question.rationale}</p>
        </div>
      ) : null}
    </div>
  );
}
