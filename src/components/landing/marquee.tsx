"use client";

import { useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Seamless horizontal marquee with a pause control, so the motion can be stopped without hovering
 * (WCAG 2.2.2). `children` is one row; it is rendered twice and translated by half its width.
 * The global reduced-motion rule freezes the animation on its first frame.
 */
export function Marquee({ label, children }: { label: string; children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  return (
    <div role="region" aria-label={label} className="relative">
      <div className="mask-fade-x overflow-hidden py-4 sm:py-5">
        <div
          className={cn("flex w-max animate-marquee hover:[animation-play-state:paused]", paused && "[animation-play-state:paused]")}
        >
          {children}
          <div aria-hidden className="flex shrink-0 items-center">
            {children}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Resume scrolling vocabulary" : "Pause scrolling vocabulary"}
        className="absolute top-1/2 right-2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-xl text-muted transition-colors duration-150 hover:bg-white/8 hover:text-fg sm:right-4"
      >
        {paused ? <Play className="size-4" strokeWidth={1.75} aria-hidden /> : <Pause className="size-4" strokeWidth={1.75} aria-hidden />}
      </button>
    </div>
  );
}
