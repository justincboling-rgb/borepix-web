"use client";

import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import { useHydrated, useProgress } from "@/lib/store/progress";

/** Slim notice for learners without a profile. Everything in the app still works for guests. */
export function GuestBanner() {
  const { profile } = useProgress();
  const hydrated = useHydrated();
  if (!hydrated || profile) return null;

  return (
    <div className="border-b border-pink/20 bg-pink/[0.06]">
      <div className="container-x flex flex-wrap items-center justify-between gap-x-4 py-1.5 text-sm">
        <p className="flex items-center gap-2 py-2 text-fg">
          <UserRound aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-blush" />
          You&apos;re studying as a guest.
        </p>
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-blush underline-offset-4 hover:underline"
        >
          Create your study plan
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
        </Link>
      </div>
    </div>
  );
}
