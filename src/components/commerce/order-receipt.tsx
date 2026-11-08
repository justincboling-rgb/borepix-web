"use client";

import { ArrowRight, CheckCircle2, KeyRound, Mail, Tag } from "lucide-react";
import { useEffect, useRef } from "react";
import { CopyButton } from "@/components/account/copy-button";
import { formatOrderDateTime, isoDate } from "@/components/account/format";
import { Button, ButtonLink } from "@/components/ui/button";
import type { Order } from "@/data/types";
import { CARD_BRAND_LABEL } from "@/lib/keys";
import { formatPrice } from "@/lib/pricing";

type Props = {
  order: Order;
  /** Closes the checkout and clears the purchased lines. Also fired when the account link is followed. */
  onDone: () => void;
};

/**
 * Post-payment receipt shown inside the checkout dialog: order number, every license key with a Copy
 * button, totals, and the way to My Account.
 */
export function OrderReceipt({ order, onDone }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The dialog is already open when the receipt replaces the form, so announce it by moving focus here.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const keyCount = order.items.reduce((n, item) => n + item.keys.length, 0);

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full border border-success/40 bg-success/10 text-success">
          <CheckCircle2 className="size-7" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="eyebrow mt-5">Payment received</p>
        <h3 ref={headingRef} tabIndex={-1} className="num mt-3 text-2xl font-semibold text-fg outline-none sm:text-3xl">
          Order {order.number}
        </h3>
        <p className="num mt-2 text-sm text-muted">
          <time dateTime={isoDate(order.createdAt)}>{formatOrderDateTime(order.createdAt)}</time>
          <span aria-hidden> · </span>
          {CARD_BRAND_LABEL[order.payment.brand]} ending in {order.payment.last4}
        </p>
      </div>

      <section aria-labelledby="receipt-keys" className="mt-8">
        <h4 id="receipt-keys" className="eyebrow">
          <KeyRound className="size-3.5" strokeWidth={1.75} aria-hidden />
          {keyCount === 1 ? "Your license key" : `Your ${keyCount} license keys`}
        </h4>
        <ul className="mt-4 space-y-4">
          {order.items.map((item) => (
            <li key={item.productId} className="hairline rounded-2xl bg-ink-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-snug text-fg">{item.name}</p>
                <p className="num shrink-0 text-sm text-muted">
                  {item.qty} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <ul className="mt-3 space-y-2">
                {item.keys.map((key) => (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card py-2 pl-3.5 pr-2"
                  >
                    <code className="num break-all text-[0.8125rem] text-fg">{key}</code>
                    <CopyButton text={key} label={`license key ${key}`} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <dl className="mt-8 space-y-2 border-t border-white/8 pt-5 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd className="num text-fg">{formatPrice(order.subtotal)}</dd>
        </div>
        {order.discount > 0 && order.promoCode ? (
          <div className="flex items-baseline justify-between gap-4 text-success">
            <dt className="flex items-center gap-1.5">
              <Tag className="size-3.5" strokeWidth={1.75} aria-hidden />
              Discount <span className="num">({order.promoCode})</span>
            </dt>
            <dd className="num">−{formatPrice(order.discount)}</dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between gap-4 border-t border-white/8 pt-3">
          <dt className="font-medium text-fg">Total paid</dt>
          <dd className="num text-2xl font-semibold text-fg">{formatPrice(order.total)}</dd>
        </div>
      </dl>

      <p className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-muted">
        <Mail className="mt-0.5 size-4 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
        <span>
          Your keys are saved to My Account on this device. Keep a copy of this receipt for{" "}
          <span className="font-medium text-fg">{order.email}</span>.
        </span>
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <ButtonLink href="/account" variant="secondary" onClick={onDone}>
          Go to My Account
          <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
        </ButtonLink>
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}
