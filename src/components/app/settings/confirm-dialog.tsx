"use client";

import { useId, useLayoutEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dangerButtonClasses } from "./danger-button";

type Props = {
  open: boolean;
  /** Called whenever the dialog closes: Escape, Cancel, backdrop click, confirm, or the view being hidden. */
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
};

/**
 * Destructive-action confirmation on a native <dialog> opened with showModal(): focus is trapped and the
 * page behind is inert, Escape closes it, and focus returns to the element that opened it. Cancel gets
 * initial focus so the safe choice is the default.
 */
export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel, cancelLabel = "Cancel" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // If React Activity hides this route while the dialog is open, close it: an invisible modal would
  // otherwise leave the visible page inert.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  function handleClose() {
    onClose();
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target?.isConnected) target.focus();
  }

  function onBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    // The dialog has no padding of its own, so a click whose target is the dialog element hit the backdrop.
    if (e.target === e.currentTarget) e.currentTarget.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onClose={handleClose}
      onClick={onBackdropClick}
      className="m-auto w-[min(28rem,calc(100vw_-_2rem))] rounded-2xl border border-line bg-card p-0 text-fg shadow-[var(--shadow-panel)] backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
            <TriangleAlert aria-hidden strokeWidth={1.75} className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-fg">
              {title}
            </h2>
            <div id={bodyId} className="mt-2 text-sm leading-relaxed text-muted">
              {children}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} variant="secondary" onClick={() => dialogRef.current?.close()}>
            {cancelLabel}
          </Button>
          <button
            type="button"
            className={dangerButtonClasses("solid")}
            onClick={() => {
              onConfirm();
              dialogRef.current?.close();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
