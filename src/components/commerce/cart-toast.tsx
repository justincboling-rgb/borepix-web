"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ARRIVAL_EASE } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/data/products";
import type { Product } from "@/data/types";
import { commerceEnabled } from "@/lib/site";
import { useCart } from "@/lib/store/cart";

const AUTO_DISMISS_MS = 4000;

/**
 * "Added to cart" confirmation. Bottom-center on phones, bottom-right from `sm`, z-70. Auto-dismisses
 * after 4 s (paused while hovered or focused), and stays out of the way when the drawer is already open.
 * Renders nothing during the Alpha/Beta preview, when nothing can be added.
 */
export function CartToast() {
  if (!commerceEnabled) return null;
  return <CartToastLive />;
}

function CartToastLive() {
  const lastAdded = useCart((s) => s.lastAdded);
  const drawerOpen = useCart((s) => s.drawerOpen);
  const clearLastAdded = useCart((s) => s.clearLastAdded);
  const openDrawer = useCart((s) => s.openDrawer);
  const reduce = useReducedMotion();

  // The drawer shows the line itself, so a toast on top of it would only repeat the news.
  useEffect(() => {
    if (lastAdded && drawerOpen) clearLastAdded();
  }, [lastAdded, drawerOpen, clearLastAdded]);

  const product = lastAdded ? getProductById(lastAdded.productId) : undefined;
  const show = Boolean(lastAdded && product && !drawerOpen);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex justify-center sm:inset-x-auto sm:bottom-6 sm:right-6 sm:justify-end"
    >
      <AnimatePresence mode="wait">
        {show && lastAdded && product ? (
          <motion.div
            key={lastAdded.at}
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : 8 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: ARRIVAL_EASE }}
            className="pointer-events-auto w-full max-w-sm"
          >
            <Toast
              product={product}
              onDismiss={clearLastAdded}
              onView={() => {
                clearLastAdded();
                openDrawer();
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Toast({ product, onDismiss, onView }: { product: Product; onDismiss: () => void; onView: () => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(id);
  }, [paused, onDismiss]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      className="glass flex items-start gap-3 rounded-2xl p-4 shadow-panel"
    >
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">Added to cart</p>
        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted">{product.name}</p>
        <div className="mt-3">
          <Button size="sm" onClick={onView}>
            View cart
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-silver transition-colors duration-150 hover:bg-white/[0.08] hover:text-fg"
      >
        <X className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}
