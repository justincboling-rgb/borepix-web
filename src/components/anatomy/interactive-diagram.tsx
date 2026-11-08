"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type ReactElement } from "react";
import { AxialBrain } from "@/components/anatomy/diagrams/axial-brain";
import { CtPhaseTimeline } from "@/components/anatomy/diagrams/ct-phase-timeline";
import type { DiagramProps } from "@/components/anatomy/diagrams/shared";
import { VascularTree } from "@/components/anatomy/diagrams/vascular-tree";
import type { DiagramHotspot, DiagramId } from "@/data/types";
import { cn } from "@/lib/cn";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const DIAGRAMS: Record<DiagramId, (props: DiagramProps) => ReactElement> = {
  "axial-brain": AxialBrain,
  "vascular-tree": VascularTree,
  "ct-phase-timeline": CtPhaseTimeline,
};

const pad2 = (n: number) => String(n).padStart(2, "0");

type Props = {
  diagram: DiagramId;
  hotspots: DiagramHotspot[];
  /** Accessible name of the diagram group, usually the workbook title. */
  title: string;
  /** One line printed in the panel header, e.g. the slice or projection. */
  caption?: string;
  className?: string;
};

/**
 * An SVG diagram with numbered hotspots laid over it. One hotspot is active at a time: its structure
 * glows in the drawing and its note shows beneath. Pointer users tap markers; keyboard users arrow
 * through the markers (roving tabindex) or tab along the chip row, which lists every landmark.
 * All state changes happen in event handlers, never in effects.
 */
export function InteractiveDiagram({ diagram, hotspots, title, caption, className }: Props) {
  const reduce = useReducedMotion() ?? false;
  const [selected, setSelected] = useState(0);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const count = hotspots.length;
  const index = count === 0 ? 0 : Math.min(selected, count - 1);
  const active = hotspots[index];
  const Diagram = DIAGRAMS[diagram];

  function select(next: number, focus: "marker" | "chip" | null) {
    if (count === 0) return;
    const i = ((next % count) + count) % count;
    setSelected(i);
    chipRefs.current[i]?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
    if (focus === "marker") markerRefs.current[i]?.focus();
    if (focus === "chip") chipRefs.current[i]?.focus();
  }

  /** The landmark an arrow, Home or End key moves to, or null for any other key. */
  function nextIndex(key: string): number | null {
    switch (key) {
      case "ArrowRight":
      case "ArrowDown":
        return index + 1;
      case "ArrowLeft":
      case "ArrowUp":
        return index - 1;
      case "Home":
        return 0;
      case "End":
        return count - 1;
      default:
        return null;
    }
  }

  function onStageKeyDown(e: KeyboardEvent<HTMLElement>) {
    const next = nextIndex(e.key);
    if (next === null) return;
    e.preventDefault();
    select(next, "marker");
  }

  function onChipKeyDown(e: KeyboardEvent<HTMLElement>) {
    const next = nextIndex(e.key);
    if (next === null) return;
    e.preventDefault();
    select(next, "chip");
  }

  const navButton =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-ink text-fg transition-colors duration-150 hover:border-white/25 hover:bg-white/[0.06] disabled:opacity-40";

  return (
    <div className={cn("hairline overflow-hidden rounded-2xl bg-ink-2 shadow-panel", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="eyebrow">Interactive diagram</p>
          {caption ? <p className="mt-1 text-sm leading-snug text-muted">{caption}</p> : null}
        </div>
        <p className="num shrink-0 pt-0.5 text-xs text-muted">
          {count} landmark{count === 1 ? "" : "s"}
        </p>
      </div>

      {/* Stage: the SVG fills a 4:3 box, so hotspot percentages map straight onto the viewBox. */}
      <div
        role="group"
        aria-label={`${title}: diagram landmarks`}
        className="relative aspect-4/3 w-full select-none"
        onKeyDown={onStageKeyDown}
      >
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        {/* No padding here: the stage's percentages must map one-to-one onto the 800×600 viewBox. */}
        <Diagram active={active?.id ?? null} className="absolute inset-0 size-full" />

        {hotspots.map((spot, i) => {
          const isActive = i === index;
          return (
            <button
              key={spot.id}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              type="button"
              tabIndex={isActive ? 0 : -1}
              aria-pressed={isActive}
              aria-label={spot.label}
              onClick={() => select(i, null)}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              className={cn(
                "absolute z-10 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-[0.6875rem] font-semibold leading-none",
                "transition-[background-color,border-color,color,box-shadow,transform] duration-150",
                // 44px hit area around the 28px marker.
                "before:absolute before:-inset-2 before:rounded-full before:content-['']",
                // Active fill is pink-strong: white type reads at 4.8:1 there, only 3.8:1 on plain pink.
                isActive
                  ? "border-pink-strong bg-pink-strong text-white shadow-[var(--shadow-glow-sm)] ring-4 ring-pink/25 after:absolute after:inset-0 after:animate-ring after:rounded-full after:border after:border-pink after:content-['']"
                  : "border-pink/60 bg-ink/80 text-fg backdrop-blur-sm hover:border-pink hover:bg-ink hover:ring-4 hover:ring-pink/15 motion-safe:hover:scale-110",
              )}
            >
              <span aria-hidden>{i + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-line p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div aria-live="polite" aria-atomic="true" className="min-h-[6.75rem] min-w-0 flex-1 sm:min-h-[5.75rem]">
            <AnimatePresence mode="wait" initial={false}>
              {active ? (
                <motion.div
                  key={active.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 1 } : { opacity: 0, y: -4 }}
                  transition={{ duration: reduce ? 0 : 0.22, ease: EASE }}
                >
                  <p className="num text-xs text-blush">
                    {pad2(index + 1)} / {pad2(count)}
                  </p>
                  <p className="mt-1.5 font-display text-lg font-semibold leading-snug text-fg">{active.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{active.note}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              className={navButton}
              aria-label="Previous landmark"
              disabled={count < 2}
              onClick={() => select(index - 1, null)}
            >
              <ChevronLeft className="size-5" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              className={navButton}
              aria-label="Next landmark"
              disabled={count < 2}
              onClick={() => select(index + 1, null)}
            >
              <ChevronRight className="size-5" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>

        <ul
          role="list"
          aria-label="Landmarks"
          onKeyDown={onChipKeyDown}
          className="scrollbar-thin -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5"
        >
          {hotspots.map((spot, i) => {
            const isActive = i === index;
            return (
              <li key={spot.id} className="shrink-0">
                <button
                  ref={(el) => {
                    chipRefs.current[i] = el;
                  }}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => select(i, null)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-xs font-medium transition-colors duration-150",
                    isActive
                      ? "border-pink/60 bg-pink/10 text-fg"
                      : "border-line bg-ink text-muted hover:border-white/25 hover:text-fg",
                  )}
                >
                  <span className={cn("num", isActive ? "text-blush" : "text-muted")}>{pad2(i + 1)}</span>
                  {spot.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
