"use client";

import { useLayoutEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import { useHydrated, useProgress } from "@/lib/store/progress";
import { DataControls } from "./data-controls";
import { PlanSummary } from "./plan-summary";
import { ProfileForm } from "./profile-form";

export function SettingsPanels() {
  const { profile } = useProgress();
  const hydrated = useHydrated();
  const [saved, setSaved] = useState<string | null>(null);

  // Drop a stale "saved" message when React Activity hides the route.
  useLayoutEffect(() => () => setSaved(null), []);

  if (!hydrated) {
    return (
      <div aria-hidden className="mt-8 space-y-6">
        <div className="h-[30rem] animate-pulse rounded-2xl border border-line bg-card" />
        <div className="h-44 animate-pulse rounded-2xl border border-line bg-card" />
        <div className="h-72 animate-pulse rounded-2xl border border-line bg-card" />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <section aria-labelledby="profile-heading" className="panel rounded-2xl p-5 sm:p-7">
        <h2 id="profile-heading" className="text-xl font-semibold text-fg">
          {profile ? "Study profile" : "Create your study profile"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {profile
            ? "Your name, track and exam date shape the dashboard. Changes save to this browser."
            : "You are studying as a guest. Add your details to personalize the dashboard and set an exam countdown."}
        </p>
        {/* Keyed by profile identity: signing out, or a new signup elsewhere, resets the fields. */}
        <ProfileForm
          key={profile?.createdAt ?? "guest"}
          profile={profile}
          onSaved={setSaved}
          onEdit={() => setSaved(null)}
        />
        <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-success">
          {saved ? (
            <>
              <CircleCheck aria-hidden strokeWidth={1.75} className="size-4" />
              {saved}
            </>
          ) : null}
        </p>
      </section>

      <PlanSummary plan={profile?.plan} />

      <DataControls hasProfile={Boolean(profile)} />
    </div>
  );
}
