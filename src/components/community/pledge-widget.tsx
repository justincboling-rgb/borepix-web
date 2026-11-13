"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { ArrowRight, Check, CircleAlert, CircleCheck, HeartHandshake, RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { community } from "@/data/community";
import type { Pledge } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/pricing";
import { firstIssueMessage, inKindPledgeSchema, moneyPledgeSchema } from "@/lib/schemas";
import { commerceEnabled } from "@/lib/site";
import { pledgeSummary, useOrders } from "@/lib/store/orders";

type Cadence = Pledge["cadence"];

const CADENCES: { value: Cadence; label: string }[] = [
  { value: "one-time", label: "One-time" },
  { value: "monthly", label: "Monthly" },
];

/** The tier selected on first paint while commerce is live. */
const DEFAULT_TIER = community.tiers[1].amount;

const wholeUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Whole dollars, at least $1, or null when the field is empty or not a number. */
function parseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  return rounded >= 1 ? rounded : null;
}

/** "Socks and thermal layers, Toiletry kits and Winter coats". */
function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function amountLabel(amount: number, cadence: Cadence): string {
  return `${formatPrice(amount)}${cadence === "monthly" ? " / month" : ""}`;
}

/** What the submit button and the announcement call a pledge, in either mode. */
function pledgeLabel(pledge: Pledge): string {
  if (pledge.items && pledge.items.length > 0) {
    return `${joinList(pledge.items)}${pledge.cadence === "monthly" ? ", monthly" : ""}`;
  }
  return amountLabel(pledge.amount, pledge.cadence);
}

/** Keeps `community.driveItems` order so the list reads the same everywhere. */
function orderedItems(selected: ReadonlySet<string>): string[] {
  return community.driveItems.filter((item) => selected.has(item));
}

/** How many times each drive item has been pledged on this device, in catalogue order. */
function itemTally(pledges: Pledge[]): { item: string; count: number }[] {
  return community.driveItems
    .map((item) => ({ item, count: pledges.filter((p) => p.items?.includes(item)).length }))
    .filter((row) => row.count > 0);
}

/** Segmented-control look for a native radio's label. The input itself is visually hidden but focusable. */
const segmentClasses = (checked: boolean) =>
  cn(
    "flex min-h-11 cursor-pointer select-none items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors duration-150",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush",
    checked ? "border-line bg-card-2 text-fg" : "border-transparent text-muted hover:bg-white/[0.04] hover:text-fg",
  );

/**
 * One-click pledge to the next Kearny supply drive. Pledges are written to the orders store (this device
 * and My Account); no money is collected. While commerce is live the supporter picks a dollar tier or a
 * custom amount; during the Alpha/Beta preview no amount appears and the supporter pledges items from the
 * drive list in kind instead. The pledge list is empty until the store hydrates after mount, so the first
 * paint is the blank form on the server and the client alike.
 */
export function PledgeWidget() {
  const uid = useId();
  const addPledge = useOrders((s) => s.addPledge);
  const pledges = useOrders((s) => s.pledges);
  const summary = pledgeSummary(pledges);
  const tally = itemTally(pledges);
  const monthlyCount = pledges.filter((p) => p.cadence === "monthly").length;

  const [cadence, setCadence] = useState<Cadence>("one-time");
  const [tier, setTier] = useState<number | null>(DEFAULT_TIER);
  const [custom, setCustom] = useState("");
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Pledge | null>(null);
  const [announce, setAnnounce] = useState("");

  const customRef = useRef<HTMLInputElement>(null);
  const firstItemRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const titleId = `${uid}-title`;
  const cadenceName = `${uid}-cadence`;
  const tiersId = `${uid}-tiers`;
  const customId = `${uid}-custom`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;
  const itemsHintId = `${uid}-items-hint`;
  const nameId = `${uid}-name`;

  const amount = tier ?? parseAmount(custom);
  const items = orderedItems(selected);

  function chooseTier(value: number) {
    setTier(value);
    setCustom("");
    setError(null);
  }

  function onCustomChange(value: string) {
    setCustom(value);
    setTier(null);
    setError(null);
  }

  function toggleItem(item: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(item);
      else next.delete(item);
      return next;
    });
    setError(null);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let pledge: Pledge;
    if (commerceEnabled) {
      const parsed = moneyPledgeSchema.safeParse({ kind: "money", amount, cadence, name });
      if (!parsed.success) {
        setError(firstIssueMessage(parsed));
        customRef.current?.focus();
        return;
      }
      pledge = addPledge(parsed.data.amount, parsed.data.cadence, parsed.data.name);
    } else {
      const parsed = inKindPledgeSchema.safeParse({ kind: "in-kind", items, cadence, name });
      if (!parsed.success) {
        setError(firstIssueMessage(parsed));
        firstItemRef.current?.focus();
        return;
      }
      pledge = addPledge(0, parsed.data.cadence, parsed.data.name, parsed.data.items);
    }
    // Render the success view synchronously so focus can move to it in the same event.
    flushSync(() => {
      setDone(pledge);
      setAnnounce(`Pledge recorded: ${pledgeLabel(pledge)}.`);
    });
    doneRef.current?.focus();
  }

  function reset() {
    flushSync(() => {
      setDone(null);
      setCadence("one-time");
      setTier(DEFAULT_TIER);
      setCustom("");
      setSelected(new Set());
      setName("");
      setError(null);
      setAnnounce("");
    });
    titleRef.current?.focus();
  }

  const submitLabel = commerceEnabled
    ? amount === null
      ? "Pledge"
      : `Pledge ${amountLabel(amount, cadence)}`
    : items.length === 0
      ? "Pledge items"
      : `Pledge ${items.length} ${items.length === 1 ? "item" : "items"}`;

  return (
    <div className="panel rounded-2xl p-6 sm:p-8">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </p>

      {done ? (
        <div>
          <div className="flex items-start gap-4">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-success/40 bg-success/10 text-success">
              <CircleCheck className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 ref={doneRef} tabIndex={-1} className="font-display text-xl font-semibold text-fg outline-none sm:text-2xl">
                Pledge recorded
              </h3>
              {done.items && done.items.length > 0 ? (
                <>
                  <ul className="mt-3 space-y-1.5">
                    {done.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-base text-fg">
                        <Check className="size-4 shrink-0 text-blush" strokeWidth={2} aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-muted">{done.cadence === "monthly" ? "Every month" : "One-time"}</p>
                </>
              ) : (
                <p className="num mt-3 text-3xl font-semibold text-fg sm:text-4xl">
                  {formatPrice(done.amount)}
                  <span className="ml-2 font-sans text-base font-normal text-muted">
                    {done.cadence === "monthly" ? "per month" : "one-time"}
                  </span>
                </p>
              )}
              {done.name ? <p className="mt-2 text-sm text-muted">Recorded for {done.name}.</p> : null}
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Borepix fulfills pledges as supply-drive purchases from the shelter&rsquo;s current needs list and records
            them in My Account. Nothing is charged to a card.
          </p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/account" variant="secondary">
              View in My Account
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </ButtonLink>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />
              Pledge again
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate aria-labelledby={titleId}>
          <div className="flex items-start gap-4">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-ink text-blush">
              <HeartHandshake className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3
                id={titleId}
                ref={titleRef}
                tabIndex={-1}
                className="font-display text-xl font-semibold text-fg outline-none sm:text-2xl"
              >
                Pledge to the next supply drive
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {commerceEnabled
                  ? "Nothing is charged. Borepix buys from the shelter’s needs list and records your pledge in My Account."
                  : "Nothing is charged. Choose the items you will bring; Borepix adds them to the drive and records your pledge in My Account."}
              </p>
            </div>
          </div>

          {/* Cadence */}
          <fieldset className="mt-7">
            <legend className="text-sm font-medium text-fg">Cadence</legend>
            <div className="hairline mt-2 grid grid-cols-2 gap-1 rounded-xl bg-ink p-1">
              {CADENCES.map((option) => {
                const checked = option.value === cadence;
                return (
                  <label key={option.value} className={segmentClasses(checked)}>
                    <input
                      type="radio"
                      name={cadenceName}
                      value={option.value}
                      checked={checked}
                      onChange={() => setCadence(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {commerceEnabled ? (
            <>
              {/* Tiers */}
              <p id={tiersId} className="mt-6 text-sm font-medium text-fg">
                Amount
              </p>
              <div role="group" aria-labelledby={tiersId} className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {community.tiers.map((t) => {
                  const pressed = tier === t.amount;
                  return (
                    <button
                      key={t.amount}
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => chooseTier(t.amount)}
                      className={cn(
                        "flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 py-3 transition-colors duration-150",
                        pressed
                          ? "border-pink/60 bg-pink/10 text-fg"
                          : "border-line bg-ink text-muted hover:border-white/25 hover:text-fg",
                      )}
                    >
                      <span className="num text-lg font-semibold leading-none">{wholeUsd.format(t.amount)}</span>
                      <span className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em]">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom amount */}
              <label htmlFor={customId} className="mt-5 block text-sm font-medium text-fg">
                Custom amount
              </label>
              <div className="relative mt-2">
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-mono text-muted">
                  $
                </span>
                <input
                  id={customId}
                  ref={customRef}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  autoComplete="off"
                  placeholder="Any amount"
                  value={custom}
                  onChange={(e) => onCustomChange(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${errorId} ${hintId}` : hintId}
                  className={cn(
                    "num min-h-11 w-full rounded-xl border bg-ink py-2.5 pl-9 pr-4 text-base text-fg placeholder:text-subtle",
                    "transition-colors duration-150 hover:border-white/25 focus:border-blush focus:outline-none",
                    error ? "border-danger" : tier === null && custom ? "border-pink/60" : "border-line",
                  )}
                />
              </div>
              <p id={hintId} className="mt-2 text-xs text-muted">
                Whole dollars, $1 or more.
              </p>
            </>
          ) : (
            <fieldset className="mt-6" aria-describedby={error ? `${errorId} ${itemsHintId}` : itemsHintId}>
              <legend className="text-sm font-medium text-fg">Items you will bring</legend>
              <p id={itemsHintId} className="mt-1 text-xs text-muted">
                From the shelter&rsquo;s current list. Choose at least one.
              </p>
              <ul className="mt-2 space-y-2">
                {community.driveItems.map((item, i) => {
                  const checked = selected.has(item);
                  return (
                    <li key={item}>
                      <label
                        className={cn(
                          "flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-xl border bg-ink px-3.5 py-2.5 text-sm transition-colors duration-150",
                          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush",
                          checked ? "border-pink/60 bg-pink/10 text-fg" : "border-line text-muted hover:border-white/25 hover:text-fg",
                        )}
                      >
                        <input
                          ref={i === 0 ? firstItemRef : undefined}
                          type="checkbox"
                          name={`${uid}-item`}
                          value={item}
                          checked={checked}
                          onChange={(e) => toggleItem(item, e.target.checked)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150",
                            checked ? "border-pink bg-pink-strong text-white" : "border-line bg-ink-2 text-transparent",
                          )}
                        >
                          <Check className="size-3.5" strokeWidth={2.5} />
                        </span>
                        <span className="flex-1 font-medium">{item}</span>
                        <span className="num text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          )}

          {error ? (
            <p id={errorId} role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-danger">
              <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {error}
            </p>
          ) : null}

          {/* Name */}
          <label htmlFor={nameId} className="mt-5 block text-sm font-medium text-fg">
            Your name (optional)
          </label>
          <input
            id={nameId}
            type="text"
            autoComplete="name"
            maxLength={80}
            placeholder="As you would like it recorded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-xl border border-line bg-ink px-4 py-2.5 text-base text-fg placeholder:text-subtle transition-colors duration-150 hover:border-white/25 focus:border-blush focus:outline-none"
          />

          <Button type="submit" size="lg" className="mt-7 w-full">
            {submitLabel}
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </Button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted">
            Next drive: {community.nextDrive}. Pledges are recorded on this device and in My Account.
          </p>
        </form>
      )}

      {summary.count > 0 ? (
        <div className="mt-8 border-t border-line pt-6">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">Your pledges on this device</p>
          {commerceEnabled ? (
            <dl className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <dt className="text-xs text-muted">Pledges</dt>
                <dd className="num mt-1 text-base font-semibold text-fg">{summary.count}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">One-time</dt>
                <dd className="num mt-1 text-base font-semibold text-fg">{formatPrice(summary.oneTime)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Monthly</dt>
                <dd className="num mt-1 text-base font-semibold text-fg">
                  {formatPrice(summary.monthly)}
                  <span className="font-sans text-xs font-normal text-muted"> / mo</span>
                </dd>
              </div>
            </dl>
          ) : (
            <>
              <dl className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-muted">Pledges</dt>
                  <dd className="num mt-1 text-base font-semibold text-fg">{summary.count}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Monthly</dt>
                  <dd className="num mt-1 text-base font-semibold text-fg">{monthlyCount}</dd>
                </div>
              </dl>
              {tally.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Items pledged on this device">
                  {tally.map(({ item, count }) => (
                    <li
                      key={item}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-line bg-ink px-3 text-xs font-medium text-fg"
                    >
                      {item}
                      {count > 1 ? <span className="num text-muted">×{count}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
