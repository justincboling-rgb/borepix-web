"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, UserRound } from "lucide-react";
import { TRACK_LABEL } from "@/lib/content/types";
import { useHydrated, useProgress } from "@/lib/store/progress";
import { countdownLabel, daysUntil } from "./exam-date";
import { SETTINGS_HREF } from "./nav";
import { useNow } from "./use-now";

/** Sidebar profile summary: name, track and exam countdown, or a guest prompt. */
export function ProfileBlock() {
  const { profile } = useProgress();
  const hydrated = useHydrated();
  const now = useNow();

  if (!hydrated) {
    return <div aria-hidden className="h-[5.5rem] animate-pulse rounded-2xl bg-white/[0.04]" />;
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-fg">
          <UserRound aria-hidden strokeWidth={1.75} className="size-4 text-silver" />
          Studying as a guest
        </p>
        <Link
          href="/signup"
          className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-blush underline-offset-4 hover:underline"
        >
          Create your study plan
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
        </Link>
      </div>
    );
  }

  const initial = profile.name.trim().charAt(0).toUpperCase() || "B";
  const days = profile.examDate && now !== null ? daysUntil(profile.examDate, now) : null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-pink/35 bg-pink/12 font-display text-base font-semibold text-blush"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-fg">{profile.name}</p>
          <p className="truncate text-xs text-muted">{TRACK_LABEL[profile.track]} track</p>
        </div>
      </div>
      {days !== null ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-silver">
          <CalendarDays aria-hidden strokeWidth={1.75} className="size-4 text-blush" />
          <span className="num">{countdownLabel(days)}</span>
        </p>
      ) : profile.examDate ? null : (
        <Link
          href={SETTINGS_HREF}
          className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-blush underline-offset-4 hover:underline"
        >
          <CalendarDays aria-hidden strokeWidth={1.75} className="size-4" />
          Set your exam date
        </Link>
      )}
    </div>
  );
}
