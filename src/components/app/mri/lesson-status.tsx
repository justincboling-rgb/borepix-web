"use client";

import { CheckCircle2 } from "lucide-react";
import { useHydrated, useProgress } from "@/lib/store/progress";

/** "Completed" marker for a lesson card. Renders nothing until stored progress is available. */
export function LessonStatus({ slug }: { slug: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  if (!hydrated || !progress.lessonsDone.includes(slug)) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
      <CheckCircle2 className="size-4" strokeWidth={1.75} aria-hidden />
      Completed
    </span>
  );
}
