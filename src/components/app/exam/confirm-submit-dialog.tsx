"use client";

import { useId, useLayoutEffect, type RefObject } from "react";
import { Flag, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  answered: number;
  total: number;
  flaggedCount: number;
  onConfirm: () => void;
  /** Focus returns here when the dialog closes without submitting. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Native modal <dialog>: focus is trapped by the browser, Escape cancels, and the backdrop is inert.
 * Open it with dialogRef.current.showModal().
 */
export function ConfirmSubmitDialog({ dialogRef, answered, total, flaggedCount, onConfirm, returnFocusRef }: Props) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const unanswered = total - answered;

  // Close if this route is hidden by Activity, so it never reappears already open.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [dialogRef]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClose={() => returnFocusRef?.current?.focus()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-card p-6 text-fg shadow-panel backdrop:bg-ink/80 backdrop:backdrop-blur-sm sm:p-7"
    >
      <h2 id={titleId} className="text-xl font-semibold text-fg">
        Submit your exam?
      </h2>
      <div id={descId} className="mt-3 grid gap-2.5 text-muted">
        <p>
          You answered{" "}
          <span className="num text-fg">
            {answered} of {total}
          </span>{" "}
          items.
        </p>
        {unanswered > 0 ? (
          <p className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
            <span>
              {unanswered} unanswered {unanswered === 1 ? "item is" : "items are"} scored as incorrect.
            </span>
          </p>
        ) : null}
        {flaggedCount > 0 ? (
          <p className="flex items-start gap-2">
            <Flag className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
            <span>
              {flaggedCount} {flaggedCount === 1 ? "item is" : "items are"} still flagged for review.
            </span>
          </p>
        ) : null}
        <p>You cannot change answers after you submit.</p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
          Keep reviewing
        </Button>
        <Button
          onClick={() => {
            dialogRef.current?.close();
            onConfirm();
          }}
        >
          Submit exam
        </Button>
      </div>
    </dialog>
  );
}
