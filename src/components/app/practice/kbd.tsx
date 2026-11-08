import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A keyboard key, as used in shortcut hints. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "num inline-flex min-w-6 items-center justify-center rounded-md border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[0.72rem] font-medium leading-none text-fg",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/** Small "Keyboard:" hint line. Hidden on narrow (touch-first) screens. */
export function KeyboardHint({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("hidden flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted sm:flex", className)}>
      <span className="font-medium text-silver">Keyboard:</span>
      {children}
    </p>
  );
}
