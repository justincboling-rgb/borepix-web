import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeApp } from "@/components/app/practice/practice-app";
import { PracticeSkeleton } from "@/components/app/practice/practice-skeleton";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "Tutor-mode practice for the ARRT® Radiography and MRI registry exams: filter by content category and topic, check each answer and read the full rationale.",
};

export default function PracticePage() {
  return (
    <div className="container-x py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="eyebrow">Tutor mode</p>
          <h1 className="mt-3 text-3xl font-semibold text-fg sm:text-4xl">Practice</h1>
          <p className="mt-3 text-muted">
            One question at a time. Check your answer, read the rationale, then move on. Questions are original Borepix
            items written to the ARRT® content categories, not actual exam items.
          </p>
        </header>

        {/* useSearchParams reads ?track= and ?category=, so the interactive part renders under Suspense. */}
        <Suspense fallback={<PracticeSkeleton />}>
          <PracticeApp />
        </Suspense>
      </div>
    </div>
  );
}
