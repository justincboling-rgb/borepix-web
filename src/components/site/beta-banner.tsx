"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, X } from "lucide-react";
import { release } from "@/lib/site";

const DISMISS_KEY = "borepix:beta-banner:dismissed";

/* Dismissal is read through useSyncExternalStore so the server and the first client render both show
   the banner, then the client snapshot hides it after hydration. */
let dismissedInMemory = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readDismissed(): boolean {
  if (dismissedInMemory) return true;
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function dismissForSession() {
  dismissedInMemory = true;
  try {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // Storage is blocked; the in-memory flag keeps the banner hidden for this page lifetime.
  }
  listeners.forEach((l) => l());
}

/**
 * Slim Alpha/Beta notice above the nav: what is open now, and when the store and CE Library launch.
 * Hidden for the session once dismissed.
 */
export function BetaBanner() {
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => false);
  if (dismissed) return null;

  return (
    <div role="region" aria-label="Release notice" className="border-b border-white/8 bg-ink-2">
      <div className="container-x flex min-h-11 items-center gap-3 py-1.5">
        <span
          className="hairline inline-flex h-6 shrink-0 items-center rounded-md bg-pink/10 px-2 font-mono text-[0.625rem] font-semibold tracking-[0.16em] text-blush uppercase"
          aria-hidden
        >
          Beta
        </span>
        <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-5 text-muted sm:text-[0.8125rem]">
          <span>
            <span className="font-medium text-fg">{release.label}.</span>
            <span className="hidden xl:inline"> Workbooks and self-quizzes are open and free.</span>
            {` The store and CE Library launch in ${release.launch}.`}
          </span>
          <Link
            href="/faq#faq-beta"
            className="inline-flex items-center gap-1 font-medium text-fg underline decoration-white/25 underline-offset-4 transition-colors duration-150 hover:text-blush hover:decoration-blush"
          >
            What this means
            <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden />
          </Link>
        </p>
        <button
          type="button"
          onClick={dismissForSession}
          aria-label="Dismiss release notice"
          className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors duration-150 hover:bg-white/8 hover:text-fg"
        >
          <X className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
