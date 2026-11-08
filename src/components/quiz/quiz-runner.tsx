"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ArrowLeft, ArrowRight, BookOpen, Check, KeyRound, ListChecks, RotateCcw, X } from "lucide-react";
import { LETTERS, QuizCard } from "@/components/quiz/quiz-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { getProduct } from "@/data/products";
import type { Quiz, QuizQuestion } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/pricing";
import { commerceEnabled } from "@/lib/site";

/* ───────────────────────── State ───────────────────────── */

type Phase = "quiz" | "results" | "review";

type State = {
  phase: Phase;
  /** Index of the item on screen (quiz and review phases). */
  step: number;
  /** Chosen option per item; persists when the learner moves back and forth. */
  choices: (number | null)[];
  /** Whether each item's answer has been checked. */
  checked: boolean[];
};

function initialState(n: number): State {
  return {
    phase: "quiz",
    step: 0,
    choices: new Array<number | null>(n).fill(null),
    checked: new Array<boolean>(n).fill(false),
  };
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((item, i) => (i === index ? value : item));
}

type StepStatus = "correct" | "incorrect" | "current" | "upcoming";

const STEP_LABEL: Record<StepStatus, string> = {
  correct: "answered correctly",
  incorrect: "answered incorrectly",
  current: "current question",
  upcoming: "not started",
};

/* ───────────────────────── Keyboard ───────────────────────── */

const NON_TEXT_INPUTS = new Set(["radio", "checkbox", "button", "submit", "reset", "image"]);

/** True when the event target accepts text entry, so digit shortcuts must stay out of its way. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUTS.has(target.type);
  return false;
}

/** True when the target is a control whose own Enter behavior must not be doubled. */
function isActivatableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("button, a[href], summary, [role='button'], [role='link'], [role='tab']"));
}

/** Maps "1".."4" to a choice index 0..3, otherwise null. */
function choiceFromKey(key: string): number | null {
  if (key.length !== 1) return null;
  const n = key.charCodeAt(0) - 49; // "1" is 49
  return n >= 0 && n <= 3 ? n : null;
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="num inline-flex min-w-6 items-center justify-center rounded-md border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[0.72rem] font-medium leading-none text-fg">
      {children}
    </kbd>
  );
}

/* ───────────────────────── Results helpers ───────────────────────── */

type TopicRow = { topic: string; correct: number; total: number };

/** Score per topic chip, in bank order. */
function topicRows(questions: QuizQuestion[], state: State): TopicRow[] {
  const rows = new Map<string, TopicRow>();
  questions.forEach((q, i) => {
    const row = rows.get(q.topic) ?? { topic: q.topic, correct: 0, total: 0 };
    row.total += 1;
    if (state.checked[i] && state.choices[i] === q.answer) row.correct += 1;
    rows.set(q.topic, row);
  });
  return Array.from(rows.values());
}

function headlineFor(percent: number, passMark: number | null): string {
  if (percent === 100) return "Every item correct.";
  if (passMark !== null && percent >= passMark) return "Above the pass mark.";
  if (percent >= 50) return "Within reach.";
  return "Not yet. Read the rationales.";
}

/* ───────────────────────── Component ───────────────────────── */

export type QuizRunnerProps = {
  quiz: Quiz;
  questions: QuizQuestion[];
  /** Landing-page preview: hides the keyboard legend, shrinks paddings and adds a link to the full quiz. */
  compact?: boolean;
  /** Heading level for stems and the results title. h2 under a page h1, h3 inside a landing section. */
  headingLevel?: "h2" | "h3";
  className?: string;
};

/**
 * The self-quiz engine. Select, check, read the rationale, move on; move back at any time and the
 * answer is still there. Ends on a results screen with a topic breakdown, a review walk-through and
 * the two next steps: the certifying test key and the free workbook.
 *
 * Keyboard: 1–4 select, Enter checks then advances, while focus is inside the quiz. Native radios keep
 * their arrow-key behavior. Nothing is persisted; the state lives in this component only.
 */
export function QuizRunner({ quiz, questions, compact = false, headingLevel = "h2", className }: QuizRunnerProps) {
  const uid = useId();
  const n = questions.length;
  const [state, setState] = useState<State>(() => initialState(n));
  const questionRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  const Heading = headingLevel;
  const SubHeading = headingLevel === "h2" ? "h3" : "h4";

  const question = questions[state.step];
  const choice = state.choices[state.step] ?? null;
  const isChecked = state.checked[state.step] ?? false;
  const isLast = state.step >= n - 1;
  const answered = state.checked.filter(Boolean).length;
  const score = questions.reduce((sum, q, i) => sum + (state.checked[i] && state.choices[i] === q.answer ? 1 : 0), 0);

  const product = getProduct(quiz.testKeySlug);
  const passMark = product?.passMark ?? null;

  /* ── Transitions. Each renders synchronously so focus can move to the new view in the same event. ── */

  const select = (i: number) => {
    if (isChecked) return;
    setState((s) => ({ ...s, choices: replaceAt(s.choices, s.step, i) }));
  };

  const check = () => {
    if (choice === null || isChecked) return;
    flushSync(() => setState((s) => ({ ...s, checked: replaceAt(s.checked, s.step, true) })));
    primaryRef.current?.focus();
  };

  const goTo = (step: number) => {
    flushSync(() => setState((s) => ({ ...s, step })));
    questionRef.current?.focus();
  };

  const showResults = () => {
    flushSync(() => setState((s) => ({ ...s, phase: "results" })));
    resultsRef.current?.focus();
  };

  const next = () => {
    if (!isChecked) return;
    if (isLast) showResults();
    else goTo(state.step + 1);
  };

  const previous = () => {
    if (state.step > 0) goTo(state.step - 1);
  };

  const review = () => {
    flushSync(() => setState((s) => ({ ...s, phase: "review", step: 0 })));
    questionRef.current?.focus();
  };

  const reviewNext = () => {
    if (isLast) showResults();
    else goTo(state.step + 1);
  };

  const retake = () => {
    flushSync(() => setState(initialState(n)));
    questionRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.nativeEvent.isComposing) return;
    if (isEditableTarget(e.target) || state.phase === "results") return;

    const picked = choiceFromKey(e.key);
    if (picked !== null) {
      if (state.phase === "quiz" && !isChecked) {
        e.preventDefault();
        select(picked);
      }
      return;
    }

    if (e.key === "Enter") {
      // Buttons and links keep their native Enter behavior (no double activation).
      if (e.repeat || isActivatableTarget(e.target)) return;
      if (state.phase === "review") {
        e.preventDefault();
        reviewNext();
      } else if (isChecked || choice !== null) {
        e.preventDefault();
        if (isChecked) next();
        else check();
      }
    }
  };

  if (n === 0 || !question) {
    return (
      <div className={cn("panel rounded-2xl p-6 text-muted", className)}>
        This quiz has no items yet. Check back shortly.
      </div>
    );
  }

  const regionLabel = `${quiz.title} self-quiz`;

  /* ───────────────────────── Results ───────────────────────── */

  if (state.phase === "results") {
    const percent = Math.round((score / n) * 100);
    const rows = topicRows(questions, state);
    const passed = passMark !== null && percent >= passMark;

    return (
      <section aria-label={regionLabel} className={cn("panel relative overflow-hidden rounded-2xl", compact ? "p-5 sm:p-6" : "p-6 sm:p-10", className)}>
        <div aria-hidden className="haze-top pointer-events-none absolute inset-0" />
        <div className="relative">
          <p className="eyebrow">
            {compact ? "Preview complete" : "Quiz complete"} · {quiz.title}
          </p>
          <Heading ref={resultsRef} tabIndex={-1} className="mt-4 text-2xl font-semibold text-fg sm:text-3xl">
            {headlineFor(percent, passMark)}
          </Heading>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">
            You answered{" "}
            <span className="num font-semibold text-fg">
              {score} of {n}
            </span>{" "}
            correctly.
            {compact
              ? " The full quiz covers every topic in the workbook."
              : passMark !== null
                ? ` The official test key passes at ${passMark}%.`
                : ""}
          </p>

          <dl className={cn("mt-7 grid gap-2 sm:gap-3", passMark !== null ? "grid-cols-3" : "grid-cols-2")}>
            <Tile label="Score" value={`${score} / ${n}`} />
            <Tile label="Percent" value={`${percent}%`} />
            {passMark !== null ? <Tile label="Pass mark" value={`${passMark}%`} tone={passed ? "success" : "neutral"} /> : null}
          </dl>

          <SubHeading className="mt-8 font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">By topic</SubHeading>
          <ul className={cn("mt-4 grid", compact ? "gap-3" : "gap-4")}>
            {rows.map((row) => {
              const p = Math.round((row.correct / row.total) * 100);
              return (
                <li key={row.topic}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-medium text-fg">{row.topic}</span>
                    <span className="num text-sm text-muted">
                      {row.correct} of {row.total} correct <span className="text-fg">{p}%</span>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
                    <div
                      className={cn(
                        "h-full w-full origin-left rounded-full transition-transform duration-500 ease-out-expo",
                        p === 0 ? "bg-danger/70" : "bg-linear-to-r from-pink-strong to-rose",
                      )}
                      style={{ transform: `scaleX(${p / 100})` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button variant="secondary" size={compact ? "md" : "lg"} onClick={review}>
              <ListChecks className="size-4" strokeWidth={1.75} aria-hidden />
              Review answers
            </Button>
            <Button variant="ghost" size={compact ? "md" : "lg"} onClick={retake}>
              <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />
              Retake
            </Button>
          </div>

          <div className="mt-8 border-t border-white/8 pt-6">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">Next step</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {compact ? (
                <>
                  <ButtonLink href={`/quizzes/${quiz.slug}`} size="lg">
                    Take the full quiz
                    <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                  </ButtonLink>
                  <ButtonLink href={`/store/${quiz.testKeySlug}`} variant="secondary" size="lg">
                    <KeyRound className="size-4" strokeWidth={1.75} aria-hidden />
                    Get the test key
                  </ButtonLink>
                </>
              ) : (
                <>
                  <ButtonLink href={`/store/${quiz.testKeySlug}`} size="lg">
                    <KeyRound className="size-4" strokeWidth={1.75} aria-hidden />
                    Get the official test key
                  </ButtonLink>
                  <ButtonLink href={`/anatomy/${quiz.workbookSlug}`} variant="secondary" size="lg">
                    <BookOpen className="size-4" strokeWidth={1.75} aria-hidden />
                    Back to the workbook
                  </ButtonLink>
                </>
              )}
            </div>
            {product ? (
              <p className="num mt-4 text-sm text-muted">
                {product.name}
                {commerceEnabled ? ` · ${formatPrice(product.price)}` : ""}
                {product.ceCredits !== null ? ` · ${product.ceCredits.toFixed(1)} CE credits` : ""}
              </p>
            ) : null}
            {compact ? (
              <p className="mt-3 text-sm text-muted">
                Or{" "}
                <Link
                  href={`/anatomy/${quiz.workbookSlug}`}
                  className="inline-flex min-h-11 items-center font-medium text-blush underline decoration-blush/40 underline-offset-4 transition-colors duration-150 hover:decoration-blush"
                >
                  review the free workbook first
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  /* ───────────────────────── Quiz and review ───────────────────────── */

  const reviewing = state.phase === "review";
  const counter = reviewing ? `Review ${state.step + 1} of ${n}` : `Question ${state.step + 1} of ${n}`;
  const hintId = `${uid}-hint`;
  const status = !isChecked ? "" : choice === question.answer ? "Correct." : `Incorrect. The answer is ${LETTERS[question.answer]}.`;

  return (
    <section aria-label={regionLabel} onKeyDown={onKeyDown} className={className}>
      <div className={cn("flex min-h-8 flex-wrap items-center justify-between gap-3", compact ? "mb-3" : "mb-4")}>
        <ol aria-label={`${quiz.title} progress`} className={cn("flex flex-wrap items-center", compact ? "gap-0" : "gap-1.5")}>
          {questions.map((q, i) => {
            const current = i === state.step;
            const stepStatus: StepStatus = state.checked[i]
              ? state.choices[i] === q.answer
                ? "correct"
                : "incorrect"
              : current
                ? "current"
                : "upcoming";
            return (
              <li key={q.id} aria-current={current ? "step" : undefined} className="flex items-center">
                <span
                  aria-hidden
                  className={cn(
                    "num inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-150",
                    stepStatus === "correct" && "border-success/60 bg-success/15 text-success",
                    stepStatus === "incorrect" && "border-danger/60 bg-danger/15 text-danger",
                    stepStatus === "current" && "border-pink bg-pink/10 text-fg",
                    stepStatus === "upcoming" && "border-white/15 text-muted",
                    current && stepStatus !== "current" && "outline-2 outline-offset-2 outline-pink/70",
                  )}
                >
                  {stepStatus === "correct" ? (
                    <Check className="size-4" strokeWidth={2.25} />
                  ) : stepStatus === "incorrect" ? (
                    <X className="size-4" strokeWidth={2.25} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="sr-only">
                  Question {i + 1}, {STEP_LABEL[stepStatus]}
                  {current && stepStatus !== "current" ? ", current question" : ""}
                </span>
                {compact && i < n - 1 ? <span aria-hidden className="mx-1.5 h-px w-6 bg-white/15 sm:w-10" /> : null}
              </li>
            );
          })}
        </ol>
        <p className="num text-sm text-muted">
          {reviewing ? "Review " : ""}
          {state.step + 1} / {n}
        </p>
      </div>

      <div ref={questionRef} tabIndex={-1} role="group" aria-label={counter} className="rounded-2xl">
        <QuizCard
          key={question.id}
          question={question}
          selected={choice}
          onSelect={select}
          revealed={reviewing || isChecked}
          disabled={reviewing}
          headingLevel={headingLevel}
          compact={compact}
        />
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
      </p>

      <div className={cn("flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between", compact ? "mt-4" : "mt-5")}>
        {reviewing ? (
          <Button variant="ghost" onClick={showResults} className="sm:-ml-3">
            <ListChecks className="size-4" strokeWidth={1.75} aria-hidden />
            Back to results
          </Button>
        ) : !isChecked ? (
          <p id={hintId} className="text-sm text-muted">
            {choice === null ? "Choose an answer, then check it." : "Check your answer to see the rationale."}
          </p>
        ) : (
          <p className="text-sm text-muted">
            <span className="num text-fg">
              {score} of {answered}
            </span>{" "}
            correct so far
          </p>
        )}

        <div className="flex items-center gap-2 sm:justify-end">
          <Button variant="ghost" onClick={previous} disabled={state.step === 0} className="shrink-0">
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
            Previous
          </Button>
          {/* One button that changes role keeps keyboard focus in place between check and next. */}
          <Button
            ref={primaryRef}
            size={compact ? "md" : "lg"}
            onClick={reviewing ? reviewNext : isChecked ? next : check}
            disabled={!reviewing && !isChecked && choice === null}
            aria-describedby={!reviewing && !isChecked ? hintId : undefined}
            className="flex-1 sm:min-w-44 sm:flex-none"
          >
            {reviewing ? (isLast ? "Results" : "Next") : isChecked ? (isLast ? "See results" : "Next") : "Check answer"}
            {reviewing || isChecked ? <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden /> : null}
          </Button>
        </div>
      </div>

      {!compact ? (
        <p className="mt-5 hidden flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted sm:flex">
          <span className="font-medium text-silver">Keyboard:</span>
          {reviewing ? (
            <span>
              <Kbd>Enter</Kbd> next item, while the quiz has focus
            </span>
          ) : (
            <>
              <span>
                <Kbd>1</Kbd>&ndash;<Kbd>4</Kbd> choose an answer
              </span>
              <span aria-hidden className="text-subtle">
                /
              </span>
              <span>
                <Kbd>Enter</Kbd> check, then continue
              </span>
              <span aria-hidden className="text-subtle">
                /
              </span>
              <span>
                <Kbd>&larr;</Kbd> <Kbd>&rarr;</Kbd> move within the answers
              </span>
            </>
          )}
        </p>
      ) : null}
    </section>
  );
}

function Tile({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "success" }) {
  return (
    <div className="hairline flex flex-col-reverse rounded-2xl bg-ink px-2 py-4 text-center sm:px-4 sm:py-5">
      <dt className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className={cn("num text-2xl font-semibold leading-none sm:text-3xl", tone === "success" ? "text-success" : "text-fg")}>
        {value}
      </dd>
    </div>
  );
}
