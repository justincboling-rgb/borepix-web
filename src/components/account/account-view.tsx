"use client";

import { GraduationCap, LogIn, Settings, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { AccountPanel, Stat } from "@/components/account/account-panel";
import { formatOrderDate, isoDate } from "@/components/account/format";
import { KeysPanel } from "@/components/account/keys-panel";
import { OrdersPanel } from "@/components/account/orders-panel";
import { PledgesPanel } from "@/components/account/pledges-panel";
import { RedeemPanel } from "@/components/account/redeem-panel";
import { ButtonLink } from "@/components/ui/button";
import { getProductById } from "@/data/products";
import type { RedeemedKey } from "@/data/types";
import { TRACK_LABEL } from "@/lib/content/types";
import { commerceEnabled, plans, release } from "@/lib/site";
import { useHydrated } from "@/lib/store/cart";
import { useLicenseKeys, useOrders } from "@/lib/store/orders";
import { useProgress, type Profile } from "@/lib/store/progress";

/**
 * My Account body. Everything here comes from localStorage (the learner profile and the orders store), so
 * the server and the first client paint render a skeleton and the panels appear once both stores have
 * hydrated. Signed-out visitors still see the orders, keys and pledges recorded on this device.
 */
export function AccountView() {
  const hydrated = useHydrated();
  const ordersHydrated = useOrders((s) => s.hydrated);
  const { profile } = useProgress();
  const orders = useOrders((s) => s.orders);
  const redeemed = useOrders((s) => s.redeemed);
  const pledges = useOrders((s) => s.pledges);
  const keys = useLicenseKeys();

  if (!hydrated || !ordersHydrated) return <AccountSkeleton />;

  const redeemedKeys = new Set(redeemed.map((r) => r.key));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">{profile ? <ProfilePanel profile={profile} /> : <SignedOutPanel />}</div>
      <CeSummaryPanel redeemed={redeemed} keyCount={keys.length} />
      <div className="lg:col-span-3">
        <OrdersPanel orders={orders} redeemedKeys={redeemedKeys} />
      </div>
      <div className="lg:col-span-2">
        <KeysPanel keys={keys} />
      </div>
      <RedeemPanel />
      <div className="lg:col-span-3">
        <PledgesPanel pledges={pledges} />
      </div>
    </div>
  );
}

/* ───────────────────────── Skeleton ───────────────────────── */

const SKELETON_BLOCKS = [
  "h-52 lg:col-span-2",
  "h-52",
  "h-64 lg:col-span-3",
  "h-72 lg:col-span-2",
  "h-72",
  "h-56 lg:col-span-3",
] as const;

function AccountSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <span className="sr-only">Loading your account</span>
      {SKELETON_BLOCKS.map((classes, i) => (
        <div key={i} aria-hidden className={`${classes} animate-pulse rounded-2xl border border-line bg-card`} />
      ))}
    </div>
  );
}

/* ───────────────────────── Profile ───────────────────────── */

function planLabel(plan: Profile["plan"]): string {
  if (plan === "trial") return "Trial";
  if (plan === "monthly" || plan === "annual") return `${plans.find((p) => p.id === plan)?.name ?? "Paid"} plan`;
  return "Preview access";
}

function ProfilePanel({ profile }: { profile: Profile }) {
  const initial = profile.name.trim().charAt(0).toUpperCase() || "B";
  return (
    <AccountPanel
      id="profile"
      eyebrow="Profile"
      title={profile.name}
      action={
        <ButtonLink href="/app/settings" variant="secondary" size="sm">
          <Settings className="size-4" strokeWidth={1.75} aria-hidden />
          Settings
        </ButtonLink>
      }
    >
      <div className="flex items-start gap-5">
        <span
          aria-hidden
          className="inline-flex size-14 shrink-0 items-center justify-center rounded-full border border-pink/35 bg-pink/12 font-display text-xl font-semibold text-blush"
        >
          {initial}
        </span>
        <dl className="grid min-w-0 flex-1 grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <ProfileFact label="Email" value={profile.email} />
          <ProfileFact label="Track" value={`${TRACK_LABEL[profile.track]} registry`} />
          <ProfileFact label="Plan" value={planLabel(profile.plan)} />
          <ProfileFact
            label="Member since"
            value={<time dateTime={isoDate(profile.createdAt)}>{formatOrderDate(profile.createdAt)}</time>}
          />
        </dl>
      </div>
    </AccountPanel>
  );
}

function ProfileFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-1 truncate text-sm text-fg">{value}</dd>
    </div>
  );
}

function SignedOutPanel() {
  return (
    <AccountPanel
      id="profile"
      eyebrow="Profile"
      title="You are not signed in"
      lede="Create an account to keep your keys and CE credit with your profile. Orders, keys and pledges recorded on this device are listed below either way."
    >
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <ButtonLink href="/signup">
          <UserPlus className="size-4" strokeWidth={1.75} aria-hidden />
          Create account
        </ButtonLink>
        <ButtonLink href="/login" variant="secondary">
          <LogIn className="size-4" strokeWidth={1.75} aria-hidden />
          Sign in
        </ButtonLink>
      </div>
    </AccountPanel>
  );
}

/* ───────────────────────── CE summary ───────────────────────── */

function CeSummaryPanel({ redeemed, keyCount }: { redeemed: RedeemedKey[]; keyCount: number }) {
  const credits = redeemed.reduce((n, r) => n + (getProductById(r.productId)?.ceCredits ?? 0), 0);
  const redeemedCount = redeemed.length;

  // A device with no keys at all during the preview is waiting on the launch, not on a redemption.
  const summary =
    redeemedCount > 0
      ? "Credit is recorded on a passing submission. Open the CE Library to continue an assessment."
      : keyCount === 0 && !commerceEnabled
        ? `Test keys open with the public launch in ${release.launch}. Credit is recorded on a passing submission once a key is redeemed here.`
        : "No keys redeemed yet. Redeem a test key to open its assessment; credit is recorded on a passing submission.";

  return (
    <AccountPanel id="ce" eyebrow="CE summary" title="Continuing education">
      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Keys redeemed" value={redeemedCount} note={keyCount > 0 ? `of ${keyCount} on this device` : undefined} />
        <Stat label="CE credits" value={credits.toFixed(1)} note="Unlocked by redeemed keys" />
      </dl>
      <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-muted">
        <GraduationCap className="mt-0.5 size-4 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
        <span>{summary}</span>
      </p>
    </AccountPanel>
  );
}
