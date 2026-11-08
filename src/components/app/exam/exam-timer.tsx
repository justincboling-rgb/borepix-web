"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatClock } from "./exam-model";

/** Thresholds (minutes remaining) that get one polite screen reader announcement each. */
const ANNOUNCE_AT = [10, 5, 1] as const;

function currentTime() {
  return Date.now();
}

/** The smallest threshold already reached, or 0 when above all of them. */
function thresholdFor(remainingSec: number): number {
  let hit = 0;
  for (const m of ANNOUNCE_AT) if (remainingSec <= m * 60) hit = m;
  return hit;
}

type Props = {
  /** Epoch ms when time runs out. */
  deadline: number;
  /** Called once when the deadline passes (auto-submit). */
  onExpire: () => void;
  className?: string;
};

/**
 * Countdown derived from a stored deadline, so it stays correct after tab sleep, refreshes and Activity hide/show.
 * Mounted only on the client (the exam tree renders after hydration), so reading the clock on mount is safe.
 */
export function ExamTimer({ deadline, onExpire, className }: Props) {
  const [now, setNow] = useState(currentTime);
  const expire = useEffectEvent(onExpire);

  useEffect(() => {
    let fired = false;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (!fired && t >= deadline) {
        fired = true;
        expire();
      }
    };
    const first = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 500);
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [deadline]);

  const remainingSec = Math.max(0, Math.ceil((deadline - now) / 1000));
  const threshold = thresholdFor(remainingSec);

  // Announce only when a threshold is crossed during the attempt, never on mount.
  const [lastThreshold, setLastThreshold] = useState(threshold);
  const [announcement, setAnnouncement] = useState("");
  if (threshold !== lastThreshold) {
    setLastThreshold(threshold);
    if (threshold !== 0 && (lastThreshold === 0 || threshold < lastThreshold)) {
      setAnnouncement(`${threshold} ${threshold === 1 ? "minute" : "minutes"} remaining.`);
    }
  }

  const low = remainingSec <= 5 * 60;
  const critical = remainingSec <= 60;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Timer
        className={cn("size-5 shrink-0", critical ? "text-danger" : low ? "text-warning" : "text-silver")}
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="leading-tight">
        <p className="text-xs text-muted">Time remaining</p>
        <p
          role="timer"
          className={cn(
            "num text-xl font-semibold tabular-nums",
            critical ? "text-danger" : low ? "text-warning" : "text-fg",
          )}
        >
          {formatClock(remainingSec)}
        </p>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}
