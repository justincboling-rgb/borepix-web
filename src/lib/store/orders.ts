"use client";

/**
 * Orders, license keys and community pledges (Zustand, persisted).
 *
 * Front-end only: the checkout is simulated, so orders are written here after the simulated
 * payment succeeds. Swap `placeOrder` for an API call when the Stripe backend exists.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProductById } from "@/data/products";
import type { CardBrand, Order, OrderItem, Pledge, RedeemedKey } from "@/data/types";
import { generateId, generateLicenseKey, generateOrderNumber } from "@/lib/keys";
import type { Totals } from "@/lib/pricing";
import { firstIssueMessage, licenseKeySchema } from "@/lib/schemas";
import { activeReferralCode, useAffiliates } from "./affiliates";
import type { ResolvedLine } from "./cart";

export type PlaceOrderInput = {
  lines: ResolvedLine[];
  totals: Totals;
  email: string;
  name: string;
  payment: { brand: CardBrand; last4: string };
};

export type RedeemResult =
  | { ok: true; productId: string; alreadyRedeemed: boolean }
  | { ok: false; reason: string };

type OrdersState = {
  orders: Order[];
  redeemed: RedeemedKey[];
  pledges: Pledge[];
  hydrated: boolean;

  placeOrder: (input: PlaceOrderInput) => Order;
  /** Redeems a key that belongs to one of this device's orders. */
  redeemKey: (raw: string) => RedeemResult;
  /** `amount` may be 0 for an in-kind pledge; pass the pledged `items` then. */
  addPledge: (amount: number, cadence: Pledge["cadence"], name: string | null, items?: string[]) => Pledge;
  removePledge: (id: string) => void;
  clearAll: () => void;
};

const MAX_ORDERS = 200;

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      redeemed: [],
      pledges: [],
      hydrated: false,

      placeOrder: ({ lines, totals, email, name, payment }) => {
        const now = new Date();
        const items: OrderItem[] = lines.map(({ product, qty }) => ({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          unitPrice: product.price,
          qty,
          keys: Array.from({ length: qty }, () => generateLicenseKey(product.keyPrefix)),
        }));
        const order: Order = {
          id: generateId(),
          number: generateOrderNumber(now),
          createdAt: now.getTime(),
          email: email.trim(),
          name: name.trim(),
          items,
          subtotal: totals.subtotal,
          discount: totals.discount,
          promoCode: totals.promo?.code ?? null,
          total: totals.total,
          payment,
          status: "paid",
          referralCode: activeReferralCode(useAffiliates.getState().referral, now.getTime()),
        };
        set((s) => ({ orders: [order, ...s.orders].slice(0, MAX_ORDERS) }));
        return order;
      },

      redeemKey: (raw) => {
        const parsed = licenseKeySchema.safeParse(raw);
        if (!parsed.success) return { ok: false, reason: firstIssueMessage(parsed) };
        const key = parsed.data;
        const { orders, redeemed } = get();
        const owner = orders.flatMap((o) => o.items).find((item) => item.keys.includes(key));
        if (!owner) {
          return { ok: false, reason: "That key is not on this device. Sign in on the device you purchased with, or contact support." };
        }
        if (!getProductById(owner.productId)) {
          return { ok: false, reason: "That product is no longer available." };
        }
        if (redeemed.some((r) => r.key === key)) {
          return { ok: true, productId: owner.productId, alreadyRedeemed: true };
        }
        set((s) => ({ redeemed: [...s.redeemed, { key, productId: owner.productId, redeemedAt: Date.now() }] }));
        return { ok: true, productId: owner.productId, alreadyRedeemed: false };
      },

      addPledge: (amount, cadence, name, items) => {
        const inKind = items && items.length > 0;
        const pledge: Pledge = {
          id: generateId(),
          amount: inKind ? Math.max(0, Math.round(amount)) : Math.max(1, Math.round(amount)),
          cadence,
          createdAt: Date.now(),
          name: name?.trim() || null,
          ...(inKind ? { items: [...items] } : {}),
        };
        set((s) => ({ pledges: [pledge, ...s.pledges] }));
        return pledge;
      },

      removePledge: (id) => set((s) => ({ pledges: s.pledges.filter((p) => p.id !== id) })),

      clearAll: () => set({ orders: [], redeemed: [], pledges: [] }),
    }),
    {
      name: "borepix:orders:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ orders: s.orders, redeemed: s.redeemed, pledges: s.pledges }),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useOrders.setState({ hydrated: true });
      },
    },
  ),
);

/** Every license key on this device with its product and redemption state, newest order first. */
export function useLicenseKeys() {
  const orders = useOrders((s) => s.orders);
  const redeemed = useOrders((s) => s.redeemed);
  return orders.flatMap((order) =>
    order.items.flatMap((item) =>
      item.keys.map((key) => ({
        key,
        order,
        item,
        product: getProductById(item.productId) ?? null,
        redeemedAt: redeemed.find((r) => r.key === key)?.redeemedAt ?? null,
      })),
    ),
  );
}

/** Sum of pledges on this device, split by cadence. */
export function pledgeSummary(pledges: Pledge[]) {
  return {
    oneTime: pledges.filter((p) => p.cadence === "one-time").reduce((n, p) => n + p.amount, 0),
    monthly: pledges.filter((p) => p.cadence === "monthly").reduce((n, p) => n + p.amount, 0),
    count: pledges.length,
  };
}
