"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * The current time, refreshed every `intervalMs`. Returns null on the server and during hydration so
 * date-dependent UI (countdowns, promo windows) never mismatches; the real time arrives on the first
 * client render after hydration.
 *
 * Built on useSyncExternalStore: the snapshot is the time quantized to the interval, so it is stable
 * between ticks and React never sees a changing value during one render.
 */
export function useNow(intervalMs = 60_000): Date | null {
  const tick = Math.max(250, intervalMs);
  const subscribe = useCallback(
    (onChange: () => void) => {
      const id = window.setInterval(onChange, tick);
      return () => window.clearInterval(id);
    },
    [tick],
  );
  const ms = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / tick) * tick,
    () => null,
  );
  return useMemo(() => (ms === null ? null : new Date(ms)), [ms]);
}
