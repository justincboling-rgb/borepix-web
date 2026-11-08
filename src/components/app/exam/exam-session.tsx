"use client";

import { useEffect, useEffectEvent, useRef, useState, type Dispatch } from "react";
import { flushSync } from "react-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Flag, ListChecks } from "lucide-react";
import { TRACK_LABEL } from "@/lib/content/types";
import { getQuestion } from "@/lib/content/questions";
import { QuestionCard } from "@/components/app/question-card";
import { Button } from "@/components/ui/button";
import { Kbd, KeyboardHint } from "@/components/app/practice/kbd";
import { choiceFromKey, isRadioTarget, shouldIgnoreShortcut } from "@/components/app/practice/keyboard";
import { useFocusOnMount } from "@/components/app/practice/use-focus-on-mount";
import { cn } from "@/lib/cn";
import type { ActiveExam, ExamAction } from "./exam-model";
import { ExamReview } from "./exam-review";
import { ExamTimer } from "./exam-timer";
import { QuestionNavigator } from "./question-navigator";

type Props = {
  exam: ActiveExam;
  dispatch: Dispatch<ExamAction>;
  onSubmit: () => void;
  onExpire: () => void;
  /** Move focus to the heading on mount (true when the learner just pressed Start). */
  focusHeading: boolean;
};

/** The in-progress exam: header with timer, one item at a time, flagging, navigator and review screen. */
export function ExamSession({ exam, dispatch, onSubmit, onExpire, focusHeading }: Props) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>(focusHeading);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  /** Item index to announce after Previous/Next (focus stays on the button there). */
  const [announced, setAnnounced] = useState<number | null>(null);
  /** The review screen was opened by the learner in this view (not restored on load). */
  const [reviewOpened, setReviewOpened] = useState(false);

  const total = exam.qids.length;
  const index = exam.index;
  const question = getQuestion(exam.qids[index]);
  const selected = exam.answers[index] ?? null;
  const isFlagged = exam.flagged[index] === true;
  const isLast = index === total - 1;
  const answeredCount = exam.answers.filter((a) => a !== null).length;
  const flaggedCount = exam.flagged.filter(Boolean).length;

  function step(delta: number) {
    const target = index + delta;
    if (exam.reviewing || target < 0 || target >= total) return;
    const wasOnPrev = document.activeElement === prevRef.current;
    flushSync(() => {
      dispatch({ type: "goto", index: target });
      setAnnounced(target);
    });
    // Previous becomes disabled on the first item; keep focus somewhere useful.
    if (target === 0 && wasOnPrev) counterRef.current?.focus();
  }

  function jump(target: number) {
    flushSync(() => {
      dispatch({ type: "goto", index: target });
      setAnnounced(null);
    });
    counterRef.current?.focus();
  }

  function openReview() {
    setAnnounced(null);
    setReviewOpened(true);
    dispatch({ type: "review", open: true });
  }

  function closeReview() {
    flushSync(() => dispatch({ type: "review", open: false }));
    counterRef.current?.focus();
  }

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (exam.reviewing || shouldIgnoreShortcut(e)) return;
    const choice = choiceFromKey(e.key);
    if (choice !== null) {
      e.preventDefault();
      dispatch({ type: "select", choice });
      return;
    }
    if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      if (!e.repeat) dispatch({ type: "toggleFlag" });
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      // Arrow keys move between answer choices inside a radio group; leave that native behavior alone.
      if (isRadioTarget(e.target)) return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    }
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKeyDown(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="grid gap-5">
      <header className="panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Mock exam in progress</p>
            <h1 ref={headingRef} tabIndex={-1} className="mt-1.5 text-xl font-semibold text-fg sm:text-2xl">
              {TRACK_LABEL[exam.track]} mock exam
            </h1>
          </div>
          <ExamTimer deadline={exam.deadline} onExpire={onExpire} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/8 pt-4">
          <p ref={counterRef} tabIndex={-1} className="num text-sm font-medium text-fg">
            {exam.reviewing ? `Reviewing ${total} items` : `Item ${index + 1} of ${total}`}
          </p>
          <p className="num text-sm text-muted">
            {answeredCount} answered <span aria-hidden>&middot;</span> {flaggedCount} flagged
          </p>
          {!exam.reviewing ? (
            <Button variant="secondary" className="sm:ml-auto" onClick={openReview}>
              <ListChecks className="size-4" strokeWidth={1.75} aria-hidden />
              Review and submit
            </Button>
          ) : null}
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announced !== null && !exam.reviewing ? `Item ${announced + 1} of ${total}` : ""}
        </p>
      </header>

      {exam.reviewing ? (
        <ExamReview exam={exam} onJump={jump} onBack={closeReview} onSubmit={onSubmit} focusHeading={reviewOpened} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
          <div className="grid min-w-0 gap-5">
            {question ? (
              <QuestionCard
                key={question.id}
                question={question}
                selected={selected}
                onSelect={(choice) => dispatch({ type: "select", choice })}
                hideMeta
                counter={`Item ${index + 1} of ${total}`}
                className={cn(isFlagged && "border-warning/40")}
              />
            ) : (
              <p className="panel rounded-2xl p-6 text-muted">This item is no longer available. Move to the next item.</p>
            )}
            {isFlagged ? (
              <p className="-mt-2 flex items-center gap-2 text-sm font-medium text-warning">
                <Flag className="size-4 fill-warning" strokeWidth={1.75} aria-hidden />
                Item {index + 1} is flagged for review
              </p>
            ) : null}

            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
              <Button
                ref={prevRef}
                variant="secondary"
                onClick={() => step(-1)}
                disabled={index === 0}
                className="px-3 sm:px-5"
              >
                <ChevronLeft className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Previous
              </Button>
              <Button
                variant="secondary"
                aria-pressed={isFlagged}
                onClick={() => dispatch({ type: "toggleFlag" })}
                className={cn(
                  "px-3 sm:px-5",
                  isFlagged && "border-warning/60 bg-warning/10 text-fg hover:border-warning/80 hover:bg-warning/15",
                )}
              >
                <Flag
                  className={cn("size-4 shrink-0", isFlagged ? "fill-warning text-warning" : "text-muted")}
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>
                  Flag<span className="sr-only sm:not-sr-only"> for review</span>
                </span>
              </Button>
              {isLast ? (
                <Button onClick={openReview} className="px-3 sm:px-5">
                  <span>
                    Review<span className="sr-only sm:not-sr-only"> and submit</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => step(1)} className="px-3 sm:px-5">
                  Next
                  <ChevronRight className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                </Button>
              )}
            </div>

            <KeyboardHint>
              <span>
                <Kbd>1</Kbd>&ndash;<Kbd>4</Kbd> choose
              </span>
              <span aria-hidden className="text-subtle">
                /
              </span>
              <span>
                <Kbd>F</Kbd> flag
              </span>
              <span aria-hidden className="text-subtle">
                /
              </span>
              <span>
                <Kbd>&larr;</Kbd> <Kbd>&rarr;</Kbd> previous or next item
                <span className="sr-only"> (Left and Right arrow keys)</span>
              </span>
            </KeyboardHint>
          </div>

          <aside aria-labelledby="exam-navigator-title" className="panel rounded-2xl p-4 sm:p-5">
            <h2 id="exam-navigator-title" className="text-base font-semibold text-fg">
              All items
            </h2>
            <p className="mt-1 text-sm text-muted">Jump to any item. Categories stay hidden until results.</p>
            <QuestionNavigator
              className="mt-4"
              answers={exam.answers}
              flagged={exam.flagged}
              current={index}
              onJump={jump}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
