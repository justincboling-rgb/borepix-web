"use client";

import { Flag } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  answers: readonly (number | null)[];
  flagged: readonly boolean[];
  /** Current item index, or null on the review screen. */
  current: number | null;
  onJump: (index: number) => void;
  className?: string;
};

/**
 * Grid of every item. State is shown by pattern and icon (solid fill = answered, dashed outline = unanswered,
 * flag icon = flagged, pink ring = current) and repeated as screen reader text.
 */
export function QuestionNavigator({ answers, flagged, current, onJump, className }: Props) {
  return (
    <div className={className}>
      <ol className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2">
        {answers.map((a, i) => {
          const answered = a !== null;
          const isFlagged = flagged[i] === true;
          const isCurrent = current === i;
          const states = [answered ? "answered" : "unanswered", isFlagged ? "flagged" : null, isCurrent ? "current item" : null]
            .filter(Boolean)
            .join(", ");
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "num relative flex h-11 w-full items-center justify-center rounded-lg border text-sm font-medium transition-colors duration-150",
                  answered
                    ? "border-silver/35 bg-silver/15 text-fg hover:bg-silver/25"
                    : "border-dashed border-white/25 text-muted hover:border-white/45 hover:text-fg",
                  isCurrent && "ring-2 ring-pink ring-offset-2 ring-offset-card",
                )}
              >
                <span aria-hidden>{i + 1}</span>
                {isFlagged ? (
                  <Flag
                    className="absolute right-0.5 top-0.5 size-3 fill-warning text-warning"
                    strokeWidth={2}
                    aria-hidden
                  />
                ) : null}
                <span className="sr-only">
                  Item {i + 1}: {states}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted" aria-label="Navigator legend">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-3.5 rounded border border-silver/35 bg-silver/15" />
          Answered
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-3.5 rounded border border-dashed border-white/35" />
          Unanswered
        </li>
        <li className="flex items-center gap-1.5">
          <Flag className="size-3.5 fill-warning text-warning" strokeWidth={2} aria-hidden />
          Flagged
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-3.5 rounded ring-2 ring-pink ring-offset-1 ring-offset-card" />
          Current
        </li>
      </ul>
    </div>
  );
}
