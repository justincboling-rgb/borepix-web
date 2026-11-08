"use client";

import { useEffect, useRef } from "react";

/**
 * Moves focus to the returned element once, when it first mounts (and `enabled` is true).
 * Uses a ref guard so routes re-shown by React Activity do not steal focus again.
 */
export function useFocusOnMount<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (enabled) ref.current?.focus();
  }, [enabled]);

  return ref;
}
