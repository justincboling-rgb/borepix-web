"use client";

import { ChevronDown, Package, Tag } from "lucide-react";
import { useId, useState } from "react";
import { AccountPanel, EmptyState } from "@/components/account/account-panel";
import { CopyButton } from "@/components/account/copy-button";
import { formatOrderDate, isoDate } from "@/components/account/format";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import type { Order } from "@/data/types";
import { cn } from "@/lib/cn";
import { CARD_BRAND_LABEL } from "@/lib/keys";
import { formatPrice } from "@/lib/pricing";
import { commerceEnabled, release } from "@/lib/site";

type Props = {
  /** Newest first, as the orders store keeps them. */
  orders: Order[];
  /** Keys that have been redeemed on this device. */
  redeemedKeys: ReadonlySet<string>;
};

/**
 * Order history: number, date, card, total, promo and items, with the license keys behind a disclosure.
 * During the Alpha/Beta preview no amount is printed: totals read "—" and line amounts are left out, while
 * keys from orders already on the device keep working.
 */
export function OrdersPanel({ orders, redeemedKeys }: Props) {
  const count = orders.length;
  return (
    <AccountPanel
      id="orders"
      eyebrow="Orders"
      title="Order history"
      lede={count > 0 ? `${count} ${count === 1 ? "order" : "orders"} placed on this device, newest first.` : undefined}
    >
      {count === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet."
          body={
            commerceEnabled
              ? "Test keys, suites and passes you buy appear here with their license keys."
              : `Purchases open with the public launch in ${release.launch}. Orders placed then appear here with their license keys.`
          }
          action={
            <ButtonLink href="/store" variant="secondary">
              {commerceEnabled ? "Browse the store" : "Browse the catalogue"}
            </ButtonLink>
          }
        />
      ) : (
        <ol className="divide-y divide-white/8 border-t border-white/8">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} redeemedKeys={redeemedKeys} />
          ))}
        </ol>
      )}
    </AccountPanel>
  );
}

/** A dash standing in for an amount the preview does not print. */
function HiddenAmount({ className }: { className?: string }) {
  return (
    <p className={className}>
      <span aria-hidden>—</span>
      <span className="sr-only">Amount not shown during the preview</span>
    </p>
  );
}

function OrderRow({ order, redeemedKeys }: { order: Order; redeemedKeys: ReadonlySet<string> }) {
  const [open, setOpen] = useState(false);
  const keysId = useId();
  const keyCount = order.items.reduce((n, item) => n + item.keys.length, 0);

  return (
    <li className="py-5">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="num text-base font-semibold text-fg">{order.number}</p>
          <p className="num mt-1 text-xs text-muted">
            <time dateTime={isoDate(order.createdAt)}>{formatOrderDate(order.createdAt)}</time>
            <span aria-hidden> · </span>
            {CARD_BRAND_LABEL[order.payment.brand]} ending in {order.payment.last4}
          </p>
        </div>
        <div className="text-right">
          {commerceEnabled ? (
            <>
              <p className="num text-lg font-semibold text-fg">{formatPrice(order.total)}</p>
              {order.promoCode && order.discount > 0 ? (
                <p className="num mt-1 inline-flex items-center gap-1 text-xs text-success">
                  <Tag className="size-3" strokeWidth={1.75} aria-hidden />
                  {order.promoCode} · −{formatPrice(order.discount)}
                </p>
              ) : null}
            </>
          ) : (
            <HiddenAmount className="num text-lg font-semibold text-fg" />
          )}
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="min-w-0 text-fg">
              {item.name} <span className="num text-muted">× {item.qty}</span>
            </span>
            {commerceEnabled ? <span className="num shrink-0 text-muted">{formatPrice(item.unitPrice * item.qty)}</span> : null}
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={keysId}
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-blush underline-offset-4 transition-colors duration-150 hover:underline"
      >
        {open ? "Hide license keys" : keyCount === 1 ? "Show license key" : `Show ${keyCount} license keys`}
        <ChevronDown
          className={cn("size-4 transition-transform duration-250 ease-out-expo", open && "rotate-180")}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      <ul id={keysId} hidden={!open} className="mt-1 space-y-2">
        {order.items.flatMap((item) =>
          item.keys.map((key) => {
            const redeemed = redeemedKeys.has(key);
            return (
              <li
                key={key}
                className="flex flex-col gap-3 rounded-xl border border-line bg-ink-2 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted">{item.name}</p>
                  <code className="num mt-0.5 block break-all text-[0.8125rem] text-fg">{key}</code>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={redeemed ? "success" : "neutral"}>{redeemed ? "Redeemed" : "Not redeemed"}</Badge>
                  <CopyButton text={key} label={`license key ${key}`} />
                </div>
              </li>
            );
          }),
        )}
      </ul>
    </li>
  );
}
