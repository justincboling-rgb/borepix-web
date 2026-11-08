"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { CircleCheck, HardDrive, LogOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetProgress, signOut } from "@/lib/store/progress";
import { ConfirmDialog } from "./confirm-dialog";
import { dangerButtonClasses } from "./danger-button";

/** Where the data lives, reset with confirmation, and sign out. */
export function DataControls({ hasProfile }: { hasProfile: boolean }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Transient UI resets when React Activity hides the route: no reopened dialog, no stale notice.
  useLayoutEffect(
    () => () => {
      setConfirmOpen(false);
      setNotice(null);
    },
    [],
  );

  function onSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <section aria-labelledby="data-heading" className="panel rounded-2xl p-5 sm:p-7">
      <h2 id="data-heading" className="text-xl font-semibold text-fg">
        Data in this browser
      </h2>
      <div className="mt-4 flex items-start gap-4">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-silver">
          <HardDrive aria-hidden strokeWidth={1.75} className="size-5" />
        </span>
        <p className="text-sm leading-relaxed text-muted">
          Borepix is in preview. Your profile, answers, mock exams, flashcard schedule and lesson progress are stored
          only in this browser&apos;s local storage. They do not sync to other browsers or devices, and clearing this
          site&apos;s data in your browser removes them.
        </p>
      </div>

      <div className="mt-6 divide-y divide-white/8 border-t border-white/8">
        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-sans text-base font-semibold text-fg">Reset all progress</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Clears answers, mock exam history, flashcard scheduling, completed lessons and your streak. Your profile
              stays.
            </p>
          </div>
          <button
            type="button"
            className={dangerButtonClasses("outline", "shrink-0")}
            aria-haspopup="dialog"
            onClick={() => {
              setNotice(null);
              setConfirmOpen(true);
            }}
          >
            <RotateCcw aria-hidden strokeWidth={1.75} className="size-4" />
            Reset progress
          </button>
        </div>

        {hasProfile ? (
          <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-sans text-base font-semibold text-fg">Sign out</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Signs you out in this browser. Your study history stays here; log in again with the same email to pick
                up where you left off.
              </p>
            </div>
            <Button variant="secondary" className="shrink-0" onClick={onSignOut}>
              <LogOut aria-hidden strokeWidth={1.75} className="size-4" />
              Sign out
            </Button>
          </div>
        ) : null}
      </div>

      <p role="status" className="flex items-center gap-2 text-sm font-medium text-success">
        {notice ? (
          <>
            <CircleCheck aria-hidden strokeWidth={1.75} className="size-4" />
            {notice}
          </>
        ) : null}
      </p>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          resetProgress();
          setNotice("All progress in this browser was reset.");
        }}
        title="Reset all progress?"
        confirmLabel="Reset progress"
      >
        <p>
          This permanently clears your answers, mock exam history, flashcard scheduling, completed lessons and streak
          in this browser. It cannot be undone.
        </p>
      </ConfirmDialog>
    </section>
  );
}
