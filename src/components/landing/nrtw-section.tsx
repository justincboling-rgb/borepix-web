"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Copy, KeyRound } from "lucide-react";
import { LaunchBadge } from "@/components/commerce/launch-notice";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getNrtwStatus, nrtw, type NrtwPhase } from "@/data/nrtw";
import { cn } from "@/lib/cn";
import { useNow } from "@/lib/hooks/use-now";
import { commerceEnabled, release } from "@/lib/site";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const WEEK_START = Date.parse(nrtw.start);
const WEEK_END = Date.parse(nrtw.end);

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function splitCountdown(ms: number): Countdown {
  const t = Math.max(0, ms);
  return {
    days: Math.floor(t / DAY),
    hours: Math.floor((t % DAY) / HOUR),
    minutes: Math.floor((t % HOUR) / MINUTE),
    seconds: Math.floor((t % MINUTE) / SECOND),
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const UNITS: { key: keyof Countdown; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

/** The line under the countdown tiles, by phase and release mode. */
function countdownNote(live: boolean): string {
  if (!commerceEnabled) {
    return live
      ? `The week is on. Every workbook and self-quiz is open now; the Rad Tech Week offer arrives with the store at launch.`
      : `The week begins November 8. Every workbook and self-quiz is open now; the Rad Tech Week offer arrives with the store at launch.`;
  }
  return live
    ? `${nrtw.code} is live. The discount comes off automatically once the code is in your cart.`
    : `${nrtw.code} is already open for early access. Apply it now and the discount holds through the week.`;
}

/**
 * National Radiologic Technology Week band: the offer, the code and a live countdown. The clock comes
 * from useNow(), which is null on the server and on the first client paint, so the tiles render "--"
 * until the component has mounted and the phase is known. During the Alpha/Beta preview the week is
 * still celebrated, but the offer and code give way to a panel that points at the launch.
 */
export function NrtwSection() {
  const now = useNow(1000);
  const phase: NrtwPhase | null = now ? getNrtwStatus(now).phase : null;
  const ended = phase === "ended";
  const live = phase === "live";

  const countdown = now && !ended ? splitCountdown((live ? WEEK_END : WEEK_START) - now.getTime()) : null;
  const countdownLabel = phase === null ? "Countdown" : live ? "Ends in" : "Starts in";

  return (
    <section
      id="rad-tech-week"
      aria-labelledby="nrtw-heading"
      className="relative isolate overflow-hidden border-y border-line bg-ink-2"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="nrtw-stripe absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_55%)]" />
        <div className="haze-top absolute inset-0" />
      </div>

      <div className="container-x py-24 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-20">
          <Reveal>
            <p className="eyebrow">
              {nrtw.name} · {nrtw.dates}
            </p>
            <h2 id="nrtw-heading" className="mt-5 text-3xl font-semibold text-fg sm:text-4xl lg:text-5xl">
              One week a year, the suite celebrates you.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{nrtw.fact}</p>

            {!commerceEnabled ? (
              <LaunchPanel ended={ended} />
            ) : ended ? (
              <div className="mt-10">
                <p className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                  Thank you for celebrating with us.
                </p>
                <p className="mt-4 max-w-xl text-muted">
                  {nrtw.short} has ended. Every test key remains in the store at its standard price.
                </p>
              </div>
            ) : (
              <div className="mt-10">
                <p className="font-display text-5xl font-semibold tracking-tight text-fg sm:text-6xl lg:text-7xl">
                  <span className="text-neon">{nrtw.percent}%</span> off every test key
                </p>
                <p className="mt-4 max-w-xl text-muted">
                  Use the code on {nrtw.eligibility} in the cart or at checkout. CE Library passes and the app license
                  are not discounted.
                </p>
                <div className="mt-8">
                  <CodeChip />
                </div>
              </div>
            )}

            {commerceEnabled ? (
              <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <ButtonLink href="/store" size="lg">
                  Shop test keys
                  <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                </ButtonLink>
                <ButtonLink href="/faq#faq-nrtw" variant="secondary" size="lg">
                  How the promo works
                </ButtonLink>
              </div>
            ) : (
              <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <ButtonLink href="/anatomy" size="lg">
                  Open the workbooks
                  <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                </ButtonLink>
                <ButtonLink href="/faq#faq-beta" variant="secondary" size="lg">
                  What this means
                </ButtonLink>
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="hairline rounded-2xl bg-card p-6 shadow-panel sm:p-8">
              {ended ? (
                <div>
                  <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">Ended</p>
                  <p className="mt-4 font-display text-2xl font-semibold text-fg">
                    {nrtw.name} ran {nrtw.dates}.
                  </p>
                  <p className="mt-3 text-muted">
                    {commerceEnabled
                      ? "The suite will celebrate again next November."
                      : `The suite will celebrate again next November, with the store open from ${release.launch}.`}
                  </p>
                </div>
              ) : (
                <div role="timer" aria-label={`${countdownLabel}: countdown to ${nrtw.name}`}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">{countdownLabel}</p>
                    <p className="num text-xs text-muted">{live ? "Through November 14" : "November 8, 12:00 a.m. EST"}</p>
                  </div>
                  <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
                    {UNITS.map((unit) => (
                      <Tile key={unit.key} value={countdown ? pad2(countdown[unit.key]) : "--"} label={unit.label} />
                    ))}
                  </div>
                  <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-muted">{countdownNote(live)}</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Replaces the offer and code during the Alpha/Beta preview: the week is still the occasion, and the test
 * keys and the Rad Tech Week offer open together with the public launch.
 */
function LaunchPanel({ ended }: { ended: boolean }) {
  return (
    <div className="hairline mt-10 max-w-xl rounded-2xl bg-card p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-pink/30 bg-pink/10 text-blush">
          <KeyRound className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <LaunchBadge full />
          <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Test keys and the Rad Tech Week offer open at launch.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {ended
              ? `${nrtw.short} has ended, and the celebration carries into the launch: test keys and the Rad Tech Week offer open with the public launch in ${release.launch}.`
              : `Borepix is in its ${release.label}. Test keys and the Rad Tech Week offer open with the public launch in ${release.launch}. Until then every workbook and self-quiz is open and free.`}
          </p>
        </div>
      </div>
    </div>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="hairline rounded-2xl bg-ink px-2 py-4 text-center sm:px-4 sm:py-5">
      <p className="num text-3xl font-semibold leading-none text-fg sm:text-4xl lg:text-5xl">{value}</p>
      <p className="mt-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">{label}</p>
    </div>
  );
}

/** The promo code as a hairline mono chip with a one-click copy. The only pulsing element in this viewport. */
function CodeChip() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  const codeRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(nrtw.code);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied: select the code so a manual copy is one keystroke away.
      const node = codeRef.current;
      const selection = window.getSelection();
      if (node && selection) selection.selectAllChildren(node);
    }
  }

  return (
    <div className="animate-nrtw-pulse hairline inline-flex max-w-full items-stretch overflow-hidden rounded-xl bg-ink">
      <span className="flex min-h-12 items-center gap-3 px-4 sm:px-5">
        <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted">Code</span>
        <span ref={codeRef} className="select-all font-mono text-lg font-semibold tracking-[0.12em] text-fg">
          {nrtw.code}
        </span>
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : `Copy code ${nrtw.code}`}
        className={cn(
          "inline-flex min-h-12 min-w-24 items-center justify-center gap-2 border-l border-line px-4 text-sm font-medium",
          "transition-colors duration-150 hover:bg-white/[0.06]",
          copied ? "text-success" : "text-fg",
        )}
      >
        {copied ? (
          <Check className="size-4" strokeWidth={2} aria-hidden />
        ) : (
          <Copy className="size-4" strokeWidth={1.75} aria-hidden />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {copied ? `${nrtw.code} copied to the clipboard` : ""}
      </span>
    </div>
  );
}
