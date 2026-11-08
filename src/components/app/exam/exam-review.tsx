"use client";

import { useRef } from "react";
import { ArrowLeft, CircleCheck, Flag, Send } from "lucide-react";
import { getQuestion } from "@/lib/content/questions";
import { Button } from "@/components/ui/button";
import { useFocusOnMount } from "@/components/app/practice/use-focus-on-mount";
import { ConfirmSubmitDialog } from "./confirm-submit-dialog";
import type { ActiveExam } from "./exam-model";
import { QuestionNavigator } from "./question-navigator";

type Props = {
  exam: ActiveExam;
  onJump: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  /** Move focus to the heading on mount (false when the page loads straight into review). */
  focusHeading: boolean;
};

/** Review-and-submit screen: unanswered and flagged items with jump links, then a confirm dialog. */
export function ExamReview({ exam, onJump, onBack, onSubmit, focusHeading }: Props) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>(focusHeading);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const total = exam.qids.length;
  const unanswered = exam.answers.flatMap((a, i) => (a === null ? [i] : []));
  const flagged = exam.flagged.flatMap((f, i) => (f ? [i] : []));
  const answered = total - unanswered.length;

  return (
    <section aria-labelledby="exam-review-title" className="grid gap-6">
      <div className="panel rounded-2xl p-5 sm:p-7">
        <h2 id="exam-review-title" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-fg">
          Review and submit
        </h2>
        <p className="mt-2 text-muted">
          Check unanswered and flagged items before you submit. The timer keeps running on this screen.
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Answered" value={`${answered}/${total}`} />
          <Stat label="Unanswered" value={String(unanswered.length)} />
          <Stat label="Flagged" value={String(flagged.length)} />
        </dl>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
            Return to item {exam.index + 1}
          </Button>
          <Button ref={submitRef} size="lg" onClick={() => dialogRef.current?.showModal()}>
            <Send className="size-4" strokeWidth={1.75} aria-hidden />
            Submit exam
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ItemList
          title="Unanswered items"
          empty="None. Every item has an answer."
          items={unanswered}
          exam={exam}
          onJump={onJump}
        />
        <ItemList
          title="Flagged for review"
          empty="No items are flagged."
          items={flagged}
          exam={exam}
          onJump={onJump}
          flaggedIcon
        />
      </div>

      <div className="panel rounded-2xl p-5 sm:p-7">
        <h3 className="text-lg font-semibold text-fg">
          All items
        </h3>
        <QuestionNavigator
          className="mt-4"
          answers={exam.answers}
          flagged={exam.flagged}
          current={null}
          onJump={onJump}
        />
      </div>

      <ConfirmSubmitDialog
        dialogRef={dialogRef}
        returnFocusRef={submitRef}
        answered={answered}
        total={total}
        flaggedCount={flagged.length}
        onConfirm={onSubmit}
      />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-2 p-3 sm:p-4">
      <dt className="text-xs text-muted sm:text-sm">{label}</dt>
      <dd className="num mt-1 text-xl font-semibold text-fg sm:text-2xl">{value}</dd>
    </div>
  );
}

function ItemList({
  title,
  empty,
  items,
  exam,
  onJump,
  flaggedIcon = false,
}: {
  title: string;
  empty: string;
  items: number[];
  exam: ActiveExam;
  onJump: (index: number) => void;
  flaggedIcon?: boolean;
}) {
  return (
    <div className="panel rounded-2xl p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-fg">
        {flaggedIcon ? <Flag className="size-4 text-warning" strokeWidth={1.75} aria-hidden /> : null}
        {title}
        <span className="num ml-auto text-sm font-normal text-muted">{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <CircleCheck className="size-4 text-success" strokeWidth={1.75} aria-hidden />
          {empty}
        </p>
      ) : (
        <ul className="mt-3 grid max-h-96 gap-1 overflow-y-auto pr-1">
          {items.map((i) => {
            const q = getQuestion(exam.qids[i]);
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className="flex min-h-11 w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-white/[0.05]"
                >
                  <span className="num shrink-0 pt-0.5 text-sm font-medium text-blush">Item {i + 1}</span>
                  <span className="line-clamp-2 text-sm text-muted">{q?.stem}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
