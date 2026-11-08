"use client";

import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { QuestionCard } from "@/components/app/question-card";
import { Button, ButtonLink } from "@/components/ui/button";
import type { Question } from "@/lib/content/types";
import { cn } from "@/lib/cn";

const LETTERS = ["A", "B", "C", "D"] as const;

type State = {
  /** Index of the question on screen. */
  step: number;
  /** Chosen option per question. */
  choices: (number | null)[];
  /** Whether each question's answer has been checked. */
  checked: boolean[];
  /** True once the last question is done and the CTA panel shows. */
  finished: boolean;
};

function initialState(n: number): State {
  return {
    step: 0,
    choices: new Array<number | null>(n).fill(null),
    checked: new Array<boolean>(n).fill(false),
    finished: false,
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

/**
 * Landing-page sample quiz. Select, check, read the rationale, move on, then a sign-up panel.
 * Answers live in component state only; nothing is written to the progress store.
 */
export function TryQuestionWidget({ questions }: { questions: Question[] }) {
  const uid = useId();
  const n = questions.length;
  const [state, setState] = useState<State>(() => initialState(n));
  const questionRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const question = questions[state.step];
  const choice = state.choices[state.step] ?? null;
  const isChecked = state.checked[state.step] ?? false;
  const isLast = state.step >= n - 1;
  const score = questions.filter((q, i) => state.checked[i] && state.choices[i] === q.answer).length;

  const select = (i: number) => setState((s) => ({ ...s, choices: replaceAt(s.choices, s.step, i) }));

  const check = () => {
    if (choice === null) return;
    setState((s) => ({ ...s, checked: replaceAt(s.checked, s.step, true) }));
  };

  // Render the next view synchronously so focus can move to it in the same event.
  const advance = () => {
    const finishing = isLast;
    flushSync(() => setState((s) => (s.step >= n - 1 ? { ...s, finished: true } : { ...s, step: s.step + 1 })));
    (finishing ? doneRef.current : questionRef.current)?.focus();
  };

  const restart = () => {
    flushSync(() => setState(initialState(n)));
    questionRef.current?.focus();
  };

  if (state.finished) {
    return (
      <div className="panel mx-auto mt-12 max-w-3xl rounded-2xl px-5 py-10 text-center sm:px-10 sm:py-12">
        <p className="eyebrow justify-center">Sample complete</p>
        <h3 ref={doneRef} tabIndex={-1} className="mt-4 text-2xl font-semibold text-fg sm:text-3xl">
          Get the full Radiography and MRI banks
        </h3>
        <p className="mt-4 text-fg">
          You answered{" "}
          <span className="num font-semibold">
            {score} of {n}
          </span>{" "}
          correctly.
        </p>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted">
          Practice by content category, sit timed mock exams, and read a full rationale for every question.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/signup" size="lg">
            Start studying
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/app/practice" size="lg" variant="secondary">
            Open practice mode
          </ButtonLink>
        </div>
        <Button variant="ghost" size="sm" className="mt-5" onClick={restart}>
          <RotateCcw className="size-4" aria-hidden />
          Try these again
        </Button>
      </div>
    );
  }

  if (!question) return null;

  const counter = `Question ${state.step + 1} of ${n}`;
  const hintId = `${uid}-hint`;
  const status = !isChecked
    ? ""
    : choice === question.answer
      ? "Correct."
      : `Incorrect. The answer is ${LETTERS[question.answer]}.`;

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <div className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-3">
        {n > 1 ? (
          <ol aria-label="Sample progress" className="flex items-center">
            {questions.map((q, i) => {
              const stepStatus: StepStatus = state.checked[i]
                ? state.choices[i] === q.answer
                  ? "correct"
                  : "incorrect"
                : i === state.step
                  ? "current"
                  : "upcoming";
              return (
                <li key={q.id} aria-current={i === state.step ? "step" : undefined} className="flex items-center">
                  <span
                    aria-hidden
                    className={cn(
                      "num inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold",
                      stepStatus === "correct" && "border-success/60 bg-success/15 text-success",
                      stepStatus === "incorrect" && "border-danger/60 bg-danger/15 text-danger",
                      stepStatus === "current" && "border-pink bg-pink/10 text-fg",
                      stepStatus === "upcoming" && "border-white/15 text-muted",
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
                  </span>
                  {i < n - 1 ? <span aria-hidden className="mx-1.5 h-px w-6 bg-white/15 sm:w-10" /> : null}
                </li>
              );
            })}
          </ol>
        ) : (
          <span />
        )}
        <p className="num text-sm text-muted">
          {state.step + 1} / {n}
        </p>
      </div>

      <div ref={questionRef} tabIndex={-1} role="group" aria-label={counter} className="rounded-2xl">
        <QuestionCard
          key={question.id}
          question={question}
          selected={choice}
          onSelect={select}
          revealed={isChecked}
          headingLevel="h3"
        />
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
      </p>

      <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!isChecked ? (
          <p id={hintId} className="text-sm text-muted">
            {choice === null ? "Choose an answer, then check it." : "Check your answer to see the rationale."}
          </p>
        ) : (
          <p className="text-sm text-muted">
            <span className="num text-fg">
              {score} of {state.checked.filter(Boolean).length}
            </span>{" "}
            correct so far
          </p>
        )}
        {/* One button that changes role keeps keyboard focus in place between check and next. */}
        <Button
          size="lg"
          onClick={isChecked ? advance : check}
          disabled={!isChecked && choice === null}
          aria-describedby={!isChecked ? hintId : undefined}
          className="sm:min-w-44"
        >
          {isChecked ? (isLast ? "Finish" : "Next question") : "Check answer"}
          {isChecked ? <ArrowRight className="size-4" aria-hidden /> : null}
        </Button>
      </div>
    </div>
  );
}
