"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { getNrtwStatus, nrtw } from "@/data/nrtw";
import { cn } from "@/lib/cn";
import { useNow } from "@/lib/hooks/use-now";

const DISMISS_KEY = "borepix:nrtw-banner:dismissed";
const DATES_SHORT = "Nov 8–14, 2026";
const COPIED_MS = 1500;

/* ───────────────────────── Dismissal (session) ─────────────────────────
   Read through useSyncExternalStore so the server and the first client render both show the banner,
   then the client snapshot hides it after hydration. A module flag covers browsers that block
   sessionStorage so Dismiss still works there. */

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

/* ───────────────────────── Clipboard ───────────────────────── */

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or insecure context: fall through to the selection path.
  }
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  } catch {
    return false;
  }
}

function days(n: number): string {
  return `${n} ${n === 1 ? "day" : "days"}`;
}

/**
 * Slim NRTW notification bar above the nav. Shows the promo code (click to copy), a countdown once
 * the clock is known on the client, and a link to the store. Hidden for the session once dismissed
 * and permanently once the week has ended.
 */
export function NrtwBanner() {
  const now = useNow(60_000);
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => false);
  const [copies, setCopies] = useState(0);
  const copied = copies > 0;

  useEffect(() => {
    if (copies === 0) return;
    const id = window.setTimeout(() => setCopies(0), COPIED_MS);
    return () => window.clearTimeout(id);
  }, [copies]);

  const status = now ? getNrtwStatus(now) : null;
  if (dismissed || status?.phase === "ended") return null;

  const countdown = !status
    ? null
    : status.phase === "live"
      ? `Live now · ${days(status.daysLeft)} left`
      : `Starts in ${days(status.daysUntil)}`;

  const copy = async () => {
    if (await copyText(nrtw.code)) setCopies((n) => n + 1);
  };

  return (
    <div role="region" aria-label={`${nrtw.name} offer`} className="nrtw-stripe border-b border-white/8 bg-ink-2">
      <div className="container-x flex min-h-11 items-center gap-3 py-1.5">
        <span className="relative flex size-2.5 shrink-0" aria-hidden>
          <span className="absolute inset-0 animate-ring rounded-full bg-pink" />
          <span className="relative inline-flex size-2.5 rounded-full bg-pink" />
        </span>

        <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-muted sm:text-[0.8125rem]">
          <span>
            <span className="font-medium text-fg">
              <span className="hidden md:inline">{nrtw.name}</span>
              <span className="md:hidden">{nrtw.short}</span>
            </span>
            <span className="hidden sm:inline"> · {DATES_SHORT}</span>
            {` · ${nrtw.percent}% off every test key with code`}
          </span>

          <button
            type="button"
            onClick={() => void copy()}
            aria-label={`Copy code ${nrtw.code}`}
            className={cn(
              "hairline relative grid h-7 items-center rounded-md px-2 font-mono text-[0.6875rem] font-semibold tracking-[0.14em] uppercase transition-colors duration-150",
              "after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']",
              copied
                ? "border-success/50 bg-success/10 text-success"
                : "animate-nrtw-pulse bg-ink text-blush hover:border-pink/50 hover:bg-pink/10",
            )}
          >
            <span className={cn("col-start-1 row-start-1 inline-flex items-center justify-center", copied && "invisible")}>
              {nrtw.code}
            </span>
            <span
              className={cn("col-start-1 row-start-1 inline-flex items-center justify-center gap-1", !copied && "invisible")}
            >
              <Check className="size-3" strokeWidth={2.25} aria-hidden />
              Copied
            </span>
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? `Code ${nrtw.code} copied to clipboard` : ""}
          </span>

          {countdown ? (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="text-white/30">
                ·
              </span>
              <span className="num text-fg/80">{countdown}</span>
            </span>
          ) : null}

          <Link
            href="/store"
            className="inline-flex items-center gap-1 font-medium text-fg underline decoration-white/25 underline-offset-4 transition-colors duration-150 hover:text-blush hover:decoration-blush"
          >
            Shop test keys
            <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden />
          </Link>
        </p>

        <button
          type="button"
          onClick={dismissForSession}
          aria-label="Dismiss banner"
          className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors duration-150 hover:bg-white/8 hover:text-fg"
        >
          <X className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
