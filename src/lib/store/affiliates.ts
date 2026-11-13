"use client";

/**
 * Affiliate partner program (Zustand, persisted).
 *
 * Front-end only: partners who join on this device are stored here, a `?ref=CODE` visit is captured
 * as the active referral, and orders placed afterwards carry that code. Commission and payouts are
 * derived from the orders store. Swap for an API when the affiliate backend exists.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Affiliate, Order, Payout, PayoutMethod } from "@/data/types";
import { generateId } from "@/lib/keys";
import { cents } from "@/lib/pricing";
import { referralCodeSchema } from "@/lib/schemas";
import { affiliateProgram } from "@/lib/site";

export { normalizeReferralCode } from "@/lib/schemas";

export type Referral = { code: string; capturedAt: number };

export type JoinInput = {
  firstName: string;
  lastName: string;
  email: string;
  payoutMethod: PayoutMethod;
  payoutHandle: string;
};

type AffiliatesState = {
  affiliates: Affiliate[];
  payouts: Payout[];
  /** The partner signed in to the portal on this device. */
  currentAffiliateId: string | null;
  referral: Referral | null;
  hydrated: boolean;

  join: (input: JoinInput) => Affiliate;
  /** Re-open the portal for a partner who already joined on this device (matched by email). */
  signIn: (email: string) => Affiliate | null;
  signOut: () => void;
  captureReferral: (code: string) => void;
  recordPayout: (affiliateId: string, amount: number) => Payout | null;
  clearAll: () => void;
};

const DAY = 86_400_000;

function baseCode(firstName: string, createdAt: number): string {
  const name = firstName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
  return `${name || "BPX"}${new Date(createdAt).getFullYear()}`;
}

const SUFFIX = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function uniqueCode(firstName: string, createdAt: number, taken: Set<string>): string {
  const base = baseCode(firstName, createdAt);
  if (!taken.has(base)) return base;
  for (let i = 0; i < 64; i++) {
    const bytes = new Uint8Array(2);
    crypto.getRandomValues(bytes);
    const candidate = `${base}${SUFFIX[bytes[0] % SUFFIX.length]}${SUFFIX[bytes[1] % SUFFIX.length]}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export const useAffiliates = create<AffiliatesState>()(
  persist(
    (set, get) => ({
      affiliates: [],
      payouts: [],
      currentAffiliateId: null,
      referral: null,
      hydrated: false,

      join: (input) => {
        const createdAt = Date.now();
        const taken = new Set(get().affiliates.map((a) => a.code));
        const affiliate: Affiliate = {
          id: generateId(),
          code: uniqueCode(input.firstName, createdAt, taken),
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: input.email.trim().toLowerCase(),
          payoutMethod: input.payoutMethod,
          payoutHandle: input.payoutHandle.trim(),
          createdAt,
        };
        set((s) => ({ affiliates: [affiliate, ...s.affiliates], currentAffiliateId: affiliate.id }));
        return affiliate;
      },

      signIn: (email) => {
        const want = email.trim().toLowerCase();
        const match = get().affiliates.find((a) => a.email === want) ?? null;
        if (match) set({ currentAffiliateId: match.id });
        return match;
      },

      signOut: () => set({ currentAffiliateId: null }),

      captureReferral: (code) => {
        const parsed = referralCodeSchema.safeParse(code);
        if (!parsed.success) return;
        set({ referral: { code: parsed.data, capturedAt: Date.now() } });
      },

      recordPayout: (affiliateId, amount) => {
        const affiliate = get().affiliates.find((a) => a.id === affiliateId);
        const value = cents(amount);
        if (!affiliate || value <= 0) return null;
        const payout: Payout = {
          id: generateId(),
          affiliateId,
          amount: value,
          method: affiliate.payoutMethod,
          createdAt: Date.now(),
        };
        set((s) => ({ payouts: [payout, ...s.payouts] }));
        return payout;
      },

      clearAll: () => set({ affiliates: [], payouts: [], currentAffiliateId: null, referral: null }),
    }),
    {
      name: "borepix:affiliates:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        affiliates: s.affiliates,
        payouts: s.payouts,
        currentAffiliateId: s.currentAffiliateId,
        referral: s.referral,
      }),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useAffiliates.setState({ hydrated: true });
      },
    },
  ),
);

/* ───────────────────────── Derived data ───────────────────────── */

/** The referral code to stamp on a new order, or null when none is active or it has expired. */
export function activeReferralCode(referral: Referral | null, now: number = Date.now()): string | null {
  if (!referral) return null;
  return now - referral.capturedAt <= affiliateProgram.cookieDays * DAY ? referral.code : null;
}

export function commissionFor(order: Order): number {
  return cents((order.total * affiliateProgram.commissionPercent) / 100);
}

export type AffiliateStats = {
  attributed: Order[];
  earned: number;
  paid: number;
  due: number;
};

export function affiliateStats(affiliate: Affiliate, orders: Order[], payouts: Payout[]): AffiliateStats {
  const attributed = orders.filter((o) => (o.referralCode ?? null) === affiliate.code);
  const earned = cents(attributed.reduce((n, o) => n + commissionFor(o), 0));
  const paid = cents(payouts.filter((p) => p.affiliateId === affiliate.id).reduce((n, p) => n + p.amount, 0));
  return { attributed, earned, paid, due: cents(Math.max(0, earned - paid)) };
}

export function referralLink(siteUrl: string, code: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/?ref=${code}`;
}

/** The partner signed in on this device, if any. */
export function useCurrentAffiliate(): Affiliate | null {
  const id = useAffiliates((s) => s.currentAffiliateId);
  const affiliates = useAffiliates((s) => s.affiliates);
  return affiliates.find((a) => a.id === id) ?? null;
}
