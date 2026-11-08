"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowRight, Check, LogOut } from "lucide-react";
import type { Question } from "@/lib/content/types";
import { QuestionCard } from "@/components/app/question-card";
import { Button } from "@/components/ui/button";
import { recordAnswer } from "@/lib/store/progress";
import { Kbd, KeyboardHint } from "./kbd";
import { choiceFromKey, isActivatableTarget, shouldIgnoreShortcut } from "./keyboard";
import { useFocusOnMount } from "./use-focus-on-mount";

export type PracticeResult = { question: Question; choice: number; correct: boolean };

type Props = {
  questions: Question[];
  /** Epoch ms when the session started (set in the Start handler). */
  startedAt: number;
  onFinish: (results: PracticeResult[]) => void;
};

/**
 * Tutor-mode loop: select, check, read the rationale, continue.
 * Each checked answer is recorded to the progress store immediately, so ending early loses nothing.
 */
export function PracticeRunner({ questions, startedAt, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [shownAt, setShownAt] = useState(startedAt);
  const counterRef = useFocusOnMount<HTMLParagraphElement>();

  const total = questions.length;
  const question = questions[index];
  const isLast = index + 1 >= total;
  const correctSoFar = results.filter((r) => r.correct).length;
  const answeredCount = results.length;

  function check() {
    if (selected === null || revealed || !question) return;
    const now = Date.now();
    const correct = selected === question.answer;
    recordAnswer({
      qid: question.id,
      track: question.track,
      category: question.category,
      choice: selected,
      correct,
      mode: "practice",
      ms: Math.max(0, now - shownAt),
      at: now,
    });
    setResults((r) => [...r, { question, choice: selected, correct }]);
    setRevealed(true);
  }

  function next() {
    if (!revealed) return;
    if (isLast) {
      onFinish(results);
      return;
    }
    flushSync(() => {
      setIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
      setShownAt(Date.now());
    });
    counterRef.current?.focus();
  }

  function primaryAction() {
    if (revealed) next();
    else check();
  }

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (shouldIgnoreShortcut(e)) return;
    const choice = choiceFromKey(e.key);
    if (choice !== null) {
      if (!revealed) {
        e.preventDefault();
        setSelected(choice);
      }
      return;
    }
    if (e.key === "Enter") {
      // Buttons and links keep their native Enter behavior (no double activation).
      if (e.repeat || isActivatableTarget(e.target)) return;
      if (revealed || selected !== null) {
        e.preventDefault();
        primaryAction();
      }
    }
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKeyDown(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (!question) return null;

  const progress = total ? answeredCount / total : 0;

  return (
    <section aria-label="Practice session" className="grid gap-5">
      <div className="panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p ref={counterRef} tabIndex={-1} className="num text-sm font-medium text-fg">
            Question {index + 1} of {total}
          </p>
          <p className="num text-sm text-muted">
            <span className="text-success">{correctSoFar}</span> correct of {answeredCount} answered
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answeredCount}
          aria-valuetext={`${answeredCount} of ${total} answered`}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
        >
          <div
            className="h-full w-full origin-left rounded-full bg-linear-to-r from-pink-strong to-rose transition-transform duration-250 ease-out-expo"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </div>

      <QuestionCard
        key={question.id}
        question={question}
        selected={selected}
        onSelect={(i) => {
          if (!revealed) setSelected(i);
        }}
        revealed={revealed}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => onFinish(results)} className="sm:-ml-3">
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
          End session
        </Button>
        <Button onClick={primaryAction} disabled={!revealed && selected === null} size="lg" className="w-full sm:w-auto">
          {revealed ? (
            <>
              {isLast ? "See summary" : "Next question"}
              <ArrowRight className="size-5" strokeWidth={1.75} aria-hidden />
            </>
          ) : (
            <>
              <Check className="size-5" strokeWidth={1.75} aria-hidden />
              Check answer
            </>
          )}
        </Button>
      </div>

      <KeyboardHint>
        <span>
          <Kbd>1</Kbd>&ndash;<Kbd>4</Kbd> choose an answer
        </span>
        <span aria-hidden className="text-subtle">
          /
        </span>
        <span>
          <Kbd>Enter</Kbd> check, then continue
        </span>
      </KeyboardHint>
    </section>
  );
}
