import {
  BatteryFull,
  CircleCheck,
  Flame,
  Layers,
  LayoutDashboard,
  Magnet,
  Signal,
  Target,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/** Illustrative screen content. 1.5 T × 42.58 MHz/T = 63.87 MHz, so the "correct" option is accurate. */
const SAMPLE_CHOICES = ["21.29 MHz", "42.58 MHz", "63.87 MHz", "127.7 MHz"] as const;
const SAMPLE_ANSWER = 2;
const LETTERS = ["A", "B", "C", "D"] as const;

const TABS: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Today", icon: LayoutDashboard, active: true },
  { label: "Practice", icon: Target },
  { label: "Cards", icon: Layers },
  { label: "MRI", icon: Magnet },
];

/**
 * Pure HTML/CSS phone with an illustrative Borepix app screen. Exposed to assistive tech as a single image,
 * so the miniature UI inside is presentational and never read out or focused.
 */
export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Illustration of the Borepix mobile app"
      className={cn("relative isolate mx-auto w-[16.5rem] select-none sm:w-[18.5rem]", className)}
    >
      {/* Neon bloom behind the device */}
      <div className="absolute inset-x-4 top-1/4 bottom-1/4 -z-10 rounded-full bg-pink/25 blur-3xl" />

      {/* Hardware buttons */}
      <div className="absolute top-28 -left-[3px] h-8 w-[3px] rounded-l-sm bg-silver/40" />
      <div className="absolute top-40 -left-[3px] h-14 w-[3px] rounded-l-sm bg-silver/40" />
      <div className="absolute top-36 -right-[3px] h-20 w-[3px] rounded-r-sm bg-silver/40" />

      {/* Brushed-metal frame */}
      <div className="rounded-[3rem] bg-linear-to-b from-silver/60 via-silver/15 to-silver/40 p-[3px] shadow-[var(--shadow-panel)]">
        <div className="rounded-[2.85rem] bg-black p-2">
          <div className="relative flex aspect-[9/19.5] flex-col overflow-hidden rounded-[2.4rem] bg-ink-2">
            {/* Dynamic-island notch */}
            <div className="absolute top-2.5 left-1/2 z-10 h-[1.4rem] w-[5.5rem] -translate-x-1/2 rounded-full bg-black" />

            {/* Status bar */}
            <div className="num flex items-center justify-between px-6 pt-3 text-[0.6875rem] font-semibold text-fg">
              <span>9:41</span>
              <span className="flex items-center gap-1 text-fg">
                <Signal className="size-3" strokeWidth={2.25} />
                <Wifi className="size-3" strokeWidth={2.25} />
                <BatteryFull className="size-3.5" strokeWidth={2} />
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3 px-3.5 pt-5 pb-2">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[0.5625rem] tracking-[0.16em] text-blush uppercase">MRI track</p>
                  <p className="font-display text-lg leading-tight font-semibold text-fg">Today</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-pink/30 bg-pink/10 px-2 py-1 text-[0.625rem] font-semibold text-fg">
                  <Flame className="size-3 text-pink" strokeWidth={2} />
                  <span className="num">6</span> day streak
                </span>
              </div>

              {/* Due flashcards */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.625rem] font-medium text-fg">
                  <Layers className="size-3 text-silver" strokeWidth={2} />
                  Flashcards due
                  <span className="num rounded-full bg-pink-strong px-1.5 text-[0.5625rem] leading-4 text-white">18</span>
                </span>
              </div>

              {/* Mini question card */}
              <div className="rounded-2xl border border-line bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-pink/30 bg-pink/10 px-2 py-0.5 text-[0.5625rem] text-blush">
                    Larmor frequency
                  </span>
                  <span className="num text-[0.5625rem] text-muted">4 / 10</span>
                </div>
                <p className="mt-2.5 text-[0.75rem] leading-snug font-medium text-fg">
                  At 1.5 T, hydrogen protons precess at approximately:
                </p>
                <div className="mt-2.5 space-y-1.5">
                  {SAMPLE_CHOICES.map((choice, i) => {
                    const correct = i === SAMPLE_ANSWER;
                    return (
                      <div
                        key={choice}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[0.6875rem]",
                          correct ? "border-success/60 bg-success/10 text-fg" : "border-white/8 text-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "num inline-flex size-4 shrink-0 items-center justify-center rounded text-[0.5625rem] font-semibold",
                            correct ? "bg-success text-ink" : "border border-white/15",
                          )}
                        >
                          {LETTERS[i]}
                        </span>
                        <span className="num flex-1">{choice}</span>
                        {correct ? <CircleCheck className="size-3.5 text-success" strokeWidth={2} /> : null}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 flex items-center gap-1 text-[0.625rem] font-semibold text-success">
                  <CircleCheck className="size-3" strokeWidth={2} />
                  Correct. 42.58 MHz/T × 1.5 T
                </p>
              </div>

              {/* Session progress */}
              <div>
                <div className="flex justify-between text-[0.5625rem] text-muted">
                  <span>Session</span>
                  <span className="num">40%</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-2/5 rounded-full bg-linear-to-r from-blush to-pink" />
                </div>
              </div>

              {/* Tab bar */}
              <div className="mt-auto grid grid-cols-4 border-t border-white/8 pt-2">
                {TABS.map(({ label, icon: Icon, active }) => (
                  <span
                    key={label}
                    className={cn(
                      "flex flex-col items-center gap-0.5 text-[0.5625rem] font-medium",
                      active ? "text-blush" : "text-muted",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                    {label}
                  </span>
                ))}
              </div>
              <div className="mx-auto mt-1 h-1 w-24 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
