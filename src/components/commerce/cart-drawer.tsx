"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CircleAlert, Minus, Plus, ShoppingBag, Sparkles, Tag, Trash2, X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { FieldError, inputClasses } from "@/components/account/field";
import { LaunchBadge, LaunchNotify } from "@/components/commerce/launch-notice";
import { ProductArt } from "@/components/store/product-art";
import { Button, ButtonLink } from "@/components/ui/button";
import { ARRIVAL_EASE, Sheet } from "@/components/ui/sheet";
import { nrtw } from "@/data/nrtw";
import { cn } from "@/lib/cn";
import { formatPrice, type Totals } from "@/lib/pricing";
import { commerceEnabled, release } from "@/lib/site";
import { resolveLines, useCart, useCartTotals, type ResolvedLine } from "@/lib/store/cart";

/** Mirrors the clamp in the cart store. */
const MAX_QTY = 10;

/**
 * Slide-over cart. Lines with a quantity stepper and remove, the promo code control, totals, and the
 * Checkout button. Reads the persisted cart, so the first paint (before hydration) is the empty state.
 * During the Alpha/Beta preview it carries the release notice instead: no lines, totals or promo input,
 * even for a device that stored lines before the preview began.
 */
export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const closeDrawer = useCart((s) => s.closeDrawer);
  const lines = useCart((s) => s.lines);
  const resolved = commerceEnabled ? resolveLines(lines) : [];
  const count = resolved.reduce((n, l) => n + l.qty, 0);

  return (
    <Sheet
      open={open}
      onClose={closeDrawer}
      title={
        <>
          Your cart
          {count > 0 ? (
            <span className="num ml-2.5 text-sm font-normal text-muted">
              {count} {count === 1 ? "item" : "items"}
            </span>
          ) : null}
        </>
      }
    >
      {!commerceEnabled ? (
        <PreviewCart onClose={closeDrawer} />
      ) : resolved.length === 0 ? (
        <EmptyCart onClose={closeDrawer} />
      ) : (
        <CartBody lines={resolved} onClose={closeDrawer} />
      )}
    </Sheet>
  );
}

/** The drawer during the Alpha/Beta preview: the release notice, launch notification and the free routes. */
function PreviewCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-8 scrollbar-thin sm:px-6">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full border border-line bg-white/[0.03] text-silver">
          <ShoppingBag className="size-7" strokeWidth={1.5} aria-hidden />
        </span>
        <LaunchBadge full className="mt-6" />
        <p className="mt-4 font-display text-xl font-semibold text-fg">Purchases open at launch.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{release.notice}</p>
      </div>

      <LaunchNotify className="mt-8" />

      <div className="mt-6 grid gap-3">
        <ButtonLink href="/anatomy" variant="secondary" onClick={onClose}>
          Open the workbooks
          <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
        </ButtonLink>
        <ButtonLink href="/quizzes" variant="secondary" onClick={onClose}>
          Take a self-quiz
          <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
        </ButtonLink>
      </div>
    </div>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full border border-line bg-white/[0.03] text-silver">
        <ShoppingBag className="size-7" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-6 font-display text-xl font-semibold text-fg">Your cart is empty.</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
        Test keys, suites and passes you add will appear here.
      </p>
      <ButtonLink href="/store" onClick={onClose} className="mt-8">
        Browse the store
        <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
      </ButtonLink>
    </div>
  );
}

function CartBody({ lines, onClose }: { lines: ResolvedLine[]; onClose: () => void }) {
  const totals = useCartTotals();
  const openCheckout = useCart((s) => s.openCheckout);

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
        <ul className="divide-y divide-white/8 px-5 sm:px-6">
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <CartLine key={line.product.id} line={line} onNavigate={onClose} />
            ))}
          </AnimatePresence>
        </ul>
        <div className="border-t border-line px-5 py-5 sm:px-6">
          <PromoControl totals={totals} />
        </div>
      </div>

      <footer className="border-t border-line bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-6">
        <CartTotals totals={totals} />
        <div className="mt-5 space-y-3">
          <Button size="lg" className="w-full" onClick={openCheckout}>
            Checkout
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </Button>
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Continue shopping
          </Button>
        </div>
      </footer>
    </>
  );
}

function CartLine({ line, onNavigate }: { line: ResolvedLine; onNavigate: () => void }) {
  const { product, qty } = line;
  const reduce = useReducedMotion();
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const href = `/store/${product.slug}`;

  return (
    <motion.li
      layout={!reduce}
      exit={{ opacity: 0, x: reduce ? 0 : 24 }}
      transition={{ duration: reduce ? 0 : 0.25, ease: ARRIVAL_EASE }}
      className="flex gap-4 py-5"
    >
      <div aria-hidden className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-ink-2">
        <ProductArt variant={product.art} className="size-full" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={href}
            onClick={onNavigate}
            className="line-clamp-2 text-sm font-medium leading-snug text-fg transition-colors duration-150 hover:text-blush"
          >
            {product.name}
          </Link>
          <button
            type="button"
            onClick={() => remove(product.id)}
            aria-label={`Remove ${product.name} from cart`}
            className="-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-silver transition-colors duration-150 hover:bg-white/[0.06] hover:text-danger"
          >
            <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <p className="num mt-1 text-sm text-muted">{formatPrice(product.price)} each</p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div
            role="group"
            aria-label={`Quantity of ${product.name}`}
            className="inline-flex h-11 items-center rounded-xl border border-line bg-ink-2"
          >
            <button
              type="button"
              onClick={() => setQty(product.id, qty - 1)}
              disabled={qty <= 1}
              aria-label={`Decrease quantity of ${product.name}`}
              className="inline-flex size-11 items-center justify-center rounded-l-xl text-silver transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <Minus className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
            <output className="num w-8 text-center text-sm font-medium text-fg" aria-label={`Quantity ${qty}`}>
              {qty}
            </output>
            <button
              type="button"
              onClick={() => setQty(product.id, qty + 1)}
              disabled={qty >= MAX_QTY}
              aria-label={`Increase quantity of ${product.name}`}
              className="inline-flex size-11 items-center justify-center rounded-r-xl text-silver transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <Plus className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          <p className="num text-base font-semibold text-fg">{formatPrice(product.price * qty)}</p>
        </div>
      </div>
    </motion.li>
  );
}

/** Subtotal, discount (when applied) and total. Shared by the drawer footer and the checkout summary. */
export function CartTotals({ totals, emphasis = "lg" }: { totals: Totals; emphasis?: "md" | "lg" }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-muted">Subtotal</dt>
        <dd className="num text-fg">{formatPrice(totals.subtotal)}</dd>
      </div>
      {totals.promo && totals.discount > 0 ? (
        <div className="flex items-baseline justify-between gap-4 text-success">
          <dt className="flex items-center gap-1.5">
            <Tag className="size-3.5" strokeWidth={1.75} aria-hidden />
            Discount <span className="num">({totals.promo.code})</span>
          </dt>
          <dd className="num">−{formatPrice(totals.discount)}</dd>
        </div>
      ) : null}
      <div className="flex items-baseline justify-between gap-4 border-t border-white/8 pt-3">
        <dt className="font-medium text-fg">Total</dt>
        <dd className={cn("num font-semibold text-fg", emphasis === "lg" ? "text-2xl" : "text-xl")}>
          {formatPrice(totals.total)}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="sr-only">Delivery</dt>
        <dd className="text-xs text-muted">Digital delivery. Keys are issued the moment payment clears.</dd>
      </div>
    </dl>
  );
}

/**
 * Promo code entry, the applied-code chip, and the warning for a stored code that no longer applies.
 * Used by the cart drawer and the checkout order summary.
 */
export function PromoControl({ totals, className }: { totals: Totals; className?: string }) {
  const promoCode = useCart((s) => s.promoCode);
  const applyPromo = useCart((s) => s.applyPromo);
  const removePromo = useCart((s) => s.removePromo);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const uid = useId();
  const inputId = `${uid}-promo`;
  const errorId = `${uid}-promo-error`;
  const hintId = `${uid}-promo-hint`;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = applyPromo(code);
    if (result.ok) {
      setCode("");
      setError(null);
    } else {
      setError(result.reason);
    }
  }

  if (totals.promo) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-pink/40 bg-pink/10 py-1.5 pl-3.5 pr-1.5",
          className,
        )}
      >
        <p className="flex min-w-0 items-center gap-2 text-sm">
          <Tag className="size-4 shrink-0 text-blush" strokeWidth={1.75} aria-hidden />
          <span className="num font-semibold text-blush">{totals.promo.code}</span>
          <span className="truncate text-muted">{totals.promo.percent}% off test keys and suites</span>
        </p>
        <button
          type="button"
          onClick={removePromo}
          aria-label={`Remove promo code ${totals.promo.code}`}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-silver transition-colors duration-150 hover:bg-white/[0.08] hover:text-fg"
        >
          <X className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {promoCode && totals.promoError ? (
        <div
          role="alert"
          className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 py-2 pl-3.5 pr-1.5 text-sm"
        >
          <p className="flex items-start gap-2 py-1 text-fg">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
            <span>
              <span className="num font-semibold">{promoCode}</span> is not applied. {totals.promoError}
            </span>
          </p>
          <button
            type="button"
            onClick={removePromo}
            aria-label={`Remove promo code ${promoCode}`}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-silver transition-colors duration-150 hover:bg-white/[0.08] hover:text-fg"
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      ) : null}

      <form noValidate onSubmit={onSubmit}>
        <label htmlFor={inputId} className="block text-sm font-medium text-fg">
          Promo code
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id={inputId}
            name="promo"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError(null);
            }}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Enter code"
            aria-invalid={error ? true : undefined}
            aria-describedby={cn(error && errorId, hintId)}
            className={cn(inputClasses, "num uppercase placeholder:normal-case")}
          />
          <Button type="submit" variant="secondary" className="shrink-0" disabled={!code.trim()}>
            Apply
          </Button>
        </div>
        <FieldError id={errorId} message={error ?? undefined} />
        <p id={hintId} className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-muted">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-blush" strokeWidth={1.75} aria-hidden />
          <span>
            Rad Tech Week: <span className="num font-medium text-blush">{nrtw.code}</span> takes {nrtw.percent}% off test keys
          </span>
        </p>
      </form>
    </div>
  );
}
