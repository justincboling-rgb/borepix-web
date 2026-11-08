"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared client clock for countdowns, streaks and due-card counts.
 *
 * Returns null on the server and during hydration, so prerendered HTML never contains a time-dependent
 * value (cacheComponents forbids reading the clock while prerendering). On the client it refreshes
 * once a minute and whenever the tab becomes visible again, and it stops ticking when nothing listens
 * (for example when React Activity hides the route).
 */

const TICK_MS = 60_000;

let current: number | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function refresh() {
  current = Date.now();
  listeners.forEach((listener) => listener());
}

function onVisibilityChange() {
  if (document.visibilityState === "visible") refresh();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    // First subscriber after an idle period: start from a fresh reading.
    current = Date.now();
    timer = setInterval(refresh, TICK_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (timer) clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}

function getSnapshot() {
  if (current === null) current = Date.now();
  return current;
}

function getServerSnapshot() {
  return null;
}

/** Epoch milliseconds on the client, null on the server and during hydration. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
