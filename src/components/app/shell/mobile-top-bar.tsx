"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { CalendarDays, Settings } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHydrated, useProgress } from "@/lib/store/progress";
import { countdownLabel, daysUntil } from "./exam-date";
import { isActivePath, SETTINGS_HREF } from "./nav";
import { ShellLogo } from "./shell-logo";
import { useNow } from "./use-now";

/** Mobile and tablet (below lg) top bar: logo, exam countdown chip, settings. */
export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-ink/80 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <ShellLogo />
        <div className="flex items-center gap-1">
          <ExamChip />
          <Suspense fallback={<SettingsButton active={false} />}>
            <ActiveSettingsButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function ActiveSettingsButton() {
  const pathname = usePathname();
  return <SettingsButton active={isActivePath(pathname, SETTINGS_HREF)} />;
}

function SettingsButton({ active }: { active: boolean }) {
  return (
    <Link
      href={SETTINGS_HREF}
      aria-label="Settings"
      aria-current={active ? "page" : undefined}
      className={cn(
        "-mr-2 inline-flex size-11 items-center justify-center rounded-xl transition-colors duration-150",
        active ? "bg-pink/10 text-pink" : "text-silver hover:bg-white/8 hover:text-fg",
      )}
    >
      <Settings aria-hidden strokeWidth={1.75} className="size-5" />
    </Link>
  );
}

function ExamChip() {
  const { profile } = useProgress();
  const hydrated = useHydrated();
  const now = useNow();
  if (!hydrated || now === null || !profile?.examDate) return null;
  const days = daysUntil(profile.examDate, now);
  if (days === null || days < 0) return null;
  const label = countdownLabel(days);
  return (
    <span className="mr-1 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-silver">
      <CalendarDays aria-hidden strokeWidth={1.75} className="size-3.5 text-blush" />
      <span className="num">{days === 0 ? label : `${days}d`}</span>
      {days === 0 ? null : <span className="sr-only">{label}</span>}
    </span>
  );
}
