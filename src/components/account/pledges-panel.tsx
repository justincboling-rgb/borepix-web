"use client";

import { HeartHandshake, Trash2 } from "lucide-react";
import { AccountPanel, EmptyState, Stat } from "@/components/account/account-panel";
import { formatOrderDate, isoDate } from "@/components/account/format";
import { ButtonLink } from "@/components/ui/button";
import { community } from "@/data/community";
import type { Pledge } from "@/data/types";
import { formatPrice } from "@/lib/pricing";
import { commerceEnabled } from "@/lib/site";
import { pledgeSummary, useOrders } from "@/lib/store/orders";

const CADENCE_LABEL: Record<Pledge["cadence"], string> = {
  "one-time": "One-time",
  monthly: "Monthly",
};

/** "Socks and thermal layers, Toiletry kits and Winter coats". */
function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The headline of a pledge row: its items, or its amount while commerce is live. Never a dollar amount in the preview. */
function pledgeTitle(pledge: Pledge): string | null {
  if (pledge.items && pledge.items.length > 0) return joinList(pledge.items);
  return commerceEnabled ? formatPrice(pledge.amount) : null;
}

/**
 * Pledges to the Kearny supply drive recorded on this device, with a summary and a remove control. In-kind
 * pledges list their items; money pledges show their amount only while commerce is live.
 */
export function PledgesPanel({ pledges }: { pledges: Pledge[] }) {
  const removePledge = useOrders((s) => s.removePledge);
  const summary = pledgeSummary(pledges);
  const monthlyCount = pledges.filter((p) => p.cadence === "monthly").length;
  const itemCount = pledges.reduce((n, p) => n + (p.items?.length ?? 0), 0);

  return (
    <AccountPanel
      id="pledges"
      eyebrow={community.eyebrow}
      title="Community pledges"
      lede={`Pledges are fulfilled by Borepix as supply-drive purchases from the shelter's needs list. Nothing is charged to a card. Next drive: ${community.nextDrive}.`}
    >
      {pledges.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No pledges yet."
          body="Pledge to the next supply drive from the community section of the home page."
          action={
            <ButtonLink href="/#community" variant="secondary">
              Make a pledge
            </ButtonLink>
          }
        />
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-3">
            <Stat label="Pledges" value={summary.count} />
            {commerceEnabled ? (
              <>
                <Stat label="One-time" value={formatPrice(summary.oneTime)} />
                <Stat label="Monthly" value={formatPrice(summary.monthly)} note="Per month, across monthly pledges." />
              </>
            ) : (
              <>
                <Stat label="Items pledged" value={itemCount} note="Across every pledge on this device." />
                <Stat label="Monthly" value={monthlyCount} note="Pledges that repeat each month." />
              </>
            )}
          </dl>
          <ul className="mt-6 divide-y divide-white/8 border-t border-white/8">
            {pledges.map((pledge) => {
              const title = pledgeTitle(pledge);
              const inKind = Boolean(pledge.items && pledge.items.length > 0);
              const cadence = CADENCE_LABEL[pledge.cadence];
              const label = title ? `${title}, ${cadence.toLowerCase()}` : `${cadence.toLowerCase()} pledge`;
              return (
                <li key={pledge.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className={inKind ? "text-base font-semibold leading-snug text-fg" : "num text-base font-semibold text-fg"}>
                      {title ?? (
                        <>
                          <span aria-hidden>—</span>
                          <span className="sr-only">Amount not shown during the preview</span>
                        </>
                      )}
                      <span className="ml-2 font-sans text-sm font-normal text-muted">
                        {cadence}
                        {pledge.cadence === "monthly" ? " · per month" : ""}
                      </span>
                    </p>
                    <p className="num mt-1 text-xs text-muted">
                      <time dateTime={isoDate(pledge.createdAt)}>{formatOrderDate(pledge.createdAt)}</time>
                      {pledge.name ? (
                        <>
                          <span aria-hidden> · </span>
                          <span className="font-sans">Recorded for {pledge.name}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePledge(pledge.id)}
                    aria-label={`Remove pledge: ${label}`}
                    className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-silver transition-colors duration-150 hover:bg-white/[0.06] hover:text-danger"
                  >
                    <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </AccountPanel>
  );
}
