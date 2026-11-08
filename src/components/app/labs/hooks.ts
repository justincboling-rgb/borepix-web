import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

/* ───────────────────────── Reduced motion ───────────────────────── */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** True when the user has asked the OS for reduced motion. False on the server and before hydration. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/* ───────────────────────── Visibility ───────────────────────── */

/**
 * True while the element is at least partly inside the viewport. Used to pause animation loops
 * that are scrolled out of view. The observer disconnects when the component unmounts or is hidden.
 */
export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = "0px"): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/* ───────────────────────── Clock ───────────────────────── */

const CLOCK_TICK_MS = 30_000;
let clockNow = 0;
let clockTimer: number | undefined;
const clockListeners = new Set<() => void>();

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (clockListeners.size === 1) {
    clockNow = Date.now();
    clockTimer = window.setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, CLOCK_TICK_MS);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer !== undefined) {
      window.clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

function getClock() {
  if (clockNow === 0) clockNow = Date.now();
  return clockNow;
}

function getServerClock() {
  return 0;
}

/**
 * Current epoch ms, refreshed every 30 seconds while mounted. Returns 0 on the server and during
 * hydration, so render nothing time-dependent until it is non-zero.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribeClock, getClock, getServerClock);
}
