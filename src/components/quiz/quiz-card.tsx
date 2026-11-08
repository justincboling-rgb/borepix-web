"use client";

import { useId } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { QUIZ_CATEGORY_LABEL, type Difficulty, type QuizQuestion } from "@/data/types";
import { cn } from "@/lib/cn";

export const LETTERS = ["A", "B", "C", "D"] as const;

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: "Foundation",
  2: "Intermediate",
  3: "Advanced",
};

export type QuizCardProps = {
  question: QuizQuestion;
  /** Index of the chosen option, or null. */
  selected: number | null;
  onSelect?: (choice: number) => void;
  /** Show correct/incorrect marking and lock the options. */
  revealed?: boolean;
  /** Show the rationale panel (only when revealed). Defaults to true. */
  showRationale?: boolean;
  /** Lock the options without revealing (e.g. while a result screen is open). */
  disabled?: boolean;
  /** e.g. "Question 3 of 16". */
  counter?: string;
  /** Heading level used for the stem. h2 under a page h1, h3 inside a landing section. */
  headingLevel?: "h2" | "h3";
  /** Tighter paddings and type for the landing-page preview. */
  compact?: boolean;
  className?: string;
};

/**
 * One self-quiz item. The stem is the legend of a fieldset of native radio inputs, so arrow keys, screen
 * readers and form semantics come from the browser. Correct and incorrect states use color, an icon and
 * a text label; the rationale panel explains the answer and, when the bank provides them, each distractor.
 */
export function QuizCard({
  question,
  selected,
  onSelect,
  revealed = false,
  showRationale = true,
  disabled = false,
  counter,
  headingLevel = "h2",
  compact = false,
  className,
}: QuizCardProps) {
  const uid = useId();
  const name = `quiz-${uid}`;
  const Heading = headingLevel;
  const locked = disabled || revealed;
  const isCorrect = selected !== null && selected === question.answer;

  return (
    <div className={cn("panel rounded-2xl", compact ? "p-4 sm:p-5" : "p-5 sm:p-7", className)}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {counter ? <span className="num mr-1 text-xs font-medium tracking-wide text-muted">{counter}</span> : null}
        <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted">
          {QUIZ_CATEGORY_LABEL[question.category]}
        </span>
        <span className="rounded-full border border-pink/30 bg-pink/10 px-2.5 py-0.5 text-xs text-blush">{question.topic}</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted">
          <span aria-hidden className="inline-flex items-center gap-1">
            {([1, 2, 3] as const).map((level) => (
              <span
                key={level}
                className={cn("size-1.5 rounded-full", level <= question.difficulty ? "bg-blush" : "bg-white/15")}
              />
            ))}
          </span>
          {DIFFICULTY_LABEL[question.difficulty]}
          <span className="sr-only">, difficulty {question.difficulty} of 3</span>
        </span>
      </div>

      <fieldset disabled={locked} className="min-w-0">
        <legend className="w-full">
          <Heading
            id={`${name}-stem`}
            className={cn("font-sans font-medium leading-relaxed text-fg", compact ? "text-base sm:text-lg" : "text-lg sm:text-xl")}
          >
            {question.stem}
          </Heading>
        </legend>

        <div className={cn("grid", compact ? "mt-4 gap-2.5" : "mt-5 gap-3")}>
          {question.choices.map((choice, i) => {
            const chosen = selected === i;
            const correct = revealed && i === question.answer;
            const wrongPick = revealed && chosen && i !== question.answer;
            const id = `${name}-${i}`;
            const note = revealed && question.choiceNotes ? question.choiceNotes[i] : null;
            return (
              <label
                key={id}
                htmlFor={id}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors duration-150",
                  compact ? "min-h-12" : "min-h-14",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush",
                  !revealed && !chosen && "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]",
                  !revealed && chosen && "border-pink/60 bg-pink/10",
                  correct && "border-success/60 bg-success/10",
                  wrongPick && "border-danger/60 bg-danger/10",
                  revealed && !correct && !wrongPick && "border-white/8 opacity-70",
                  locked && "cursor-default",
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
                    "num mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-colors duration-150",
                    chosen && !revealed ? "border-pink bg-pink-strong text-white" : "border-white/15 text-muted",
                    !revealed && !chosen && "group-hover:border-white/30 group-hover:text-fg",
                    correct && "border-success bg-success text-ink",
                    wrongPick && "border-danger bg-danger text-ink",
                  )}
                >
                  {LETTERS[i]}
                </span>
                <span className={cn("flex-1 leading-relaxed text-fg", compact ? "text-[0.95rem]" : "text-[0.98rem]")}>
                  <span className="sr-only">{LETTERS[i]}. </span>
                  {choice}
                  {correct ? (
                    <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-success">
                      <CheckCircle2 className="size-4" strokeWidth={1.75} aria-hidden /> Correct answer
                    </span>
                  ) : null}
                  {wrongPick ? (
                    <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-danger">
                      <XCircle className="size-4" strokeWidth={1.75} aria-hidden /> Your answer
                    </span>
                  ) : null}
                  {note ? <span className="mt-1 block text-sm leading-relaxed text-muted">{note}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {revealed && showRationale ? (
        <div className={cn("rounded-xl border border-white/10 bg-ink-2", compact ? "mt-5 p-4" : "mt-6 p-5")}>
          <p
            className={cn(
              "flex items-center gap-2 font-semibold",
              selected === null ? "text-muted" : isCorrect ? "text-success" : "text-danger",
            )}
          >
            {selected === null ? (
              <>Not answered. The answer is {LETTERS[question.answer]}.</>
            ) : isCorrect ? (
              <>
                <CheckCircle2 className="size-5" strokeWidth={1.75} aria-hidden /> Correct
              </>
            ) : (
              <>
                <XCircle className="size-5" strokeWidth={1.75} aria-hidden /> Incorrect. The answer is {LETTERS[question.answer]}.
              </>
            )}
          </p>
          <p className="mt-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted">Rationale</p>
          <p className="mt-2 leading-relaxed text-muted">{question.rationale}</p>
        </div>
      ) : null}
    </div>
  );
}
