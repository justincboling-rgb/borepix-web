"use client";

/**
 * Shopping cart and commerce UI state (Zustand).
 *
 * - `lines` and `promoCode` persist to localStorage. Everything else is session UI state.
 * - Hydration is skipped at import time and run from <StoreHydrator /> after mount, so server HTML
 *   and the first client paint always agree (an empty cart) and the stored cart appears right after.
 * - Totals are not stored: derive them with `useCartTotals()` so prices and promo rules stay in one place.
 */

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProductById } from "@/data/products";
import type { Product } from "@/data/types";
import { useNow } from "@/lib/hooks/use-now";
import { computeTotals, normalizePromo, validatePromo, type PromoResult, type Totals } from "@/lib/pricing";
import { commerceEnabled } from "@/lib/site";

/** Stable stand-in for "now" before hydration, when the cart is still empty. Never `new Date()` in render. */
const EPOCH = new Date(0);

export type CartLine = { productId: string; qty: number };

export type CheckoutMode = "cart" | "buy-now";

type CartState = {
  lines: CartLine[];
  promoCode: string | null;
  /** True once localStorage has been read on the client. */
  hydrated: boolean;

  drawerOpen: boolean;
  checkoutOpen: boolean;
  checkoutMode: CheckoutMode;
  /** The single line checked out by "Buy now"; the cart is left untouched. */
  buyNowLine: CartLine | null;
  /** Most recent add, for the "Added to cart" toast. */
  lastAdded: { productId: string; at: number } | null;

  add: (productId: string, qty?: number, opts?: { openDrawer?: boolean }) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;

  applyPromo: (code: string) => PromoResult;
  removePromo: () => void;

  openDrawer: () => void;
  closeDrawer: () => void;
  /** Buy now with a product: opens checkout for that one line without touching the cart. */
  buyNow: (productId: string, qty?: number) => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  /** Called after a successful order: clears the purchased lines and closes both overlays. */
  completeCheckout: () => void;
  clearLastAdded: () => void;
};

const MAX_QTY = 10;

function clampQty(qty: number): number {
  return Math.max(1, Math.min(MAX_QTY, Math.round(qty)));
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      promoCode: null,
      hydrated: false,
      drawerOpen: false,
      checkoutOpen: false,
      checkoutMode: "cart",
      buyNowLine: null,
      lastAdded: null,

      add: (productId, qty = 1, opts) => {
        // No purchases during the Alpha/Beta preview: the store is a catalogue until launch.
        if (!commerceEnabled || !getProductById(productId)) return;
        set((s) => {
          const existing = s.lines.find((l) => l.productId === productId);
          const lines = existing
            ? s.lines.map((l) => (l.productId === productId ? { ...l, qty: clampQty(l.qty + qty) } : l))
            : [...s.lines, { productId, qty: clampQty(qty) }];
          return {
            lines,
            lastAdded: { productId, at: Date.now() },
            drawerOpen: opts?.openDrawer ?? s.drawerOpen,
          };
        });
      },

      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),

      setQty: (productId, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.productId !== productId)
              : s.lines.map((l) => (l.productId === productId ? { ...l, qty: clampQty(qty) } : l)),
        })),

      clear: () => set({ lines: [], promoCode: null }),

      applyPromo: (code) => {
        const { lines, buyNowLine, checkoutMode } = get();
        const active = checkoutMode === "buy-now" && buyNowLine ? [buyNowLine] : lines;
        const eligible = active.reduce((sum, l) => {
          const p = getProductById(l.productId);
          return p && p.promoEligible ? sum + p.price * l.qty : sum;
        }, 0);
        const result = validatePromo(code, new Date(), eligible);
        if (result.ok) set({ promoCode: normalizePromo(code) });
        return result;
      },

      removePromo: () => set({ promoCode: null }),

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),

      buyNow: (productId, qty = 1) => {
        if (!commerceEnabled || !getProductById(productId)) return;
        set({ buyNowLine: { productId, qty: clampQty(qty) }, checkoutMode: "buy-now", checkoutOpen: true, drawerOpen: false });
      },

      openCheckout: () => {
        if (!commerceEnabled || get().lines.length === 0) return;
        set({ checkoutMode: "cart", buyNowLine: null, checkoutOpen: true, drawerOpen: false });
      },

      closeCheckout: () => set({ checkoutOpen: false, buyNowLine: null, checkoutMode: "cart" }),

      completeCheckout: () =>
        set((s) =>
          s.checkoutMode === "buy-now"
            ? { checkoutOpen: false, drawerOpen: false, buyNowLine: null, checkoutMode: "cart" }
            : { checkoutOpen: false, drawerOpen: false, lines: [], promoCode: null, buyNowLine: null, checkoutMode: "cart" },
        ),

      clearLastAdded: () => set({ lastAdded: null }),
    }),
    {
      name: "borepix:cart:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, promoCode: s.promoCode }),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useCart.setState({ hydrated: true });
      },
    },
  ),
);

/* ───────────────────────── Derived data ───────────────────────── */

export type ResolvedLine = { product: Product; qty: number };

export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((l) => {
    const product = getProductById(l.productId);
    return product ? [{ product, qty: l.qty }] : [];
  });
}

/** The lines the checkout is pricing: the whole cart, or the single "Buy now" line. */
export function useCheckoutLines(): ResolvedLine[] {
  const lines = useCart((s) => s.lines);
  const buyNowLine = useCart((s) => s.buyNowLine);
  const mode = useCart((s) => s.checkoutMode);
  return resolveLines(mode === "buy-now" && buyNowLine ? [buyNowLine] : lines);
}

/**
 * Price a set of lines. Pass `now` explicitly from render paths (use `useNow()`); the default is only
 * for event handlers, because Next.js rejects `new Date()` during a Client Component's prerender.
 */
export function totalsFor(resolved: ResolvedLine[], promoCode: string | null, now: Date = new Date()): Totals {
  return computeTotals(
    resolved.map((l) => ({ unitPrice: l.product.price, qty: l.qty, promoEligible: l.product.promoEligible })),
    promoCode,
    now,
  );
}

/** The clock for pricing during render: null until hydrated, so callers fall back to EPOCH while the cart is empty. */
export function usePricingClock(): Date {
  return useNow(60_000) ?? EPOCH;
}

/** Totals for the cart drawer. Safe to call in an always-mounted client component. */
export function useCartTotals(): Totals {
  const lines = useCart((s) => s.lines);
  const promoCode = useCart((s) => s.promoCode);
  const now = usePricingClock();
  return totalsFor(resolveLines(lines), promoCode, now);
}

/** Number of units in the cart (0 until hydrated, so the badge never mismatches on first paint). */
export function useCartCount(): number {
  return useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
}

/** True once this component has hydrated on the client. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
