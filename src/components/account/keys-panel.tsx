"use client";

import { ArrowRight, CircleAlert, CircleCheck, KeyRound } from "lucide-react";
import { useState } from "react";
import { AccountPanel, EmptyState } from "@/components/account/account-panel";
import { CopyButton } from "@/components/account/copy-button";
import { formatOrderDate, isoDate } from "@/components/account/format";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { commerceEnabled, release } from "@/lib/site";
import { useLicenseKeys, useOrders } from "@/lib/store/orders";

export type LicenseKeyRow = ReturnType<typeof useLicenseKeys>[number];

type Notice = { tone: "success" | "danger"; text: string };

/** Every license key on this device with its redemption state, a copy control and a one-click Redeem. */
export function KeysPanel({ keys }: { keys: LicenseKeyRow[] }) {
  const redeemKey = useOrders((s) => s.redeemKey);
  const [notice, setNotice] = useState<Notice | null>(null);
  const pending = keys.filter((k) => k.redeemedAt === null).length;

  function redeem(row: LicenseKeyRow) {
    const name = row.product?.name ?? row.item.name;
    const result = redeemKey(row.key);
    if (!result.ok) {
      setNotice({ tone: "danger", text: result.reason });
      return;
    }
    setNotice({
      tone: "success",
      text: result.alreadyRedeemed
        ? `${name} was already redeemed. It is in your CE Library.`
        : `${name} is redeemed. Open the CE Library to begin.`,
    });
  }

  return (
    <AccountPanel
      id="keys"
      eyebrow="License keys"
      title="Your keys"
      lede={
        keys.length > 0
          ? pending === 0
            ? "Every key on this device is redeemed."
            : `${pending} of ${keys.length} ${keys.length === 1 ? "key is" : "keys are"} waiting to be redeemed.`
          : undefined
      }
      action={
        keys.length > 0 ? (
          <ButtonLink href="/app" variant="secondary" size="sm">
            Open the CE Library
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </ButtonLink>
        ) : undefined
      }
    >
      {keys.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No license keys on this device."
          body={
            commerceEnabled
              ? "Buy a test key or a pass and its key is issued here the moment payment clears."
              : `Test keys and passes open with the public launch in ${release.launch}. Keys issued then appear here, ready to redeem.`
          }
          action={
            <ButtonLink href="/store" variant="secondary">
              {commerceEnabled ? "Shop test keys" : "Browse the catalogue"}
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-white/8 border-t border-white/8">
          {keys.map((row) => {
            const redeemed = row.redeemedAt !== null;
            return (
              <li key={row.key} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug text-fg">{row.product?.name ?? row.item.name}</p>
                  <code className="num mt-1 block break-all text-[0.8125rem] text-muted">{row.key}</code>
                  <p className="num mt-1 text-xs text-muted">
                    Order {row.order.number}
                    <span aria-hidden> · </span>
                    {redeemed && row.redeemedAt !== null ? (
                      <>
                        Redeemed <time dateTime={isoDate(row.redeemedAt)}>{formatOrderDate(row.redeemedAt)}</time>
                      </>
                    ) : (
                      <>
                        Issued <time dateTime={isoDate(row.order.createdAt)}>{formatOrderDate(row.order.createdAt)}</time>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone={redeemed ? "success" : "neutral"}>{redeemed ? "Redeemed" : "Not redeemed"}</Badge>
                  <CopyButton text={row.key} label={`license key ${row.key}`} />
                  {redeemed ? null : (
                    <Button variant="secondary" size="sm" onClick={() => redeem(row)}>
                      Redeem
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "mt-4 flex items-start gap-2 text-sm font-medium",
          notice?.tone === "danger" ? "text-danger" : "text-success",
          !notice && "sr-only",
        )}
      >
        {notice ? (
          <>
            {notice.tone === "danger" ? (
              <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            ) : (
              <CircleCheck className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            )}
            {notice.text}
          </>
        ) : null}
      </p>
    </AccountPanel>
  );
}
