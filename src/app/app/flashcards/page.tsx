import type { Metadata } from "next";
import { Suspense } from "react";
import { flashcards } from "@/lib/content/flashcards";
import { FlashcardStudy } from "@/components/app/flashcards/flashcard-study";
import { FlashcardsSkeleton } from "@/components/app/flashcards/flashcards-skeleton";

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Spaced-repetition flashcards for the ARRT® Radiography and MRI registry exams. Grade each card and Borepix schedules the next review.",
};

export default function FlashcardsPage() {
  return (
    <div className="container-x py-8">
      <div className="mx-auto max-w-3xl">
        <header>
          <p className="eyebrow">Spaced repetition</p>
          <h1 className="mt-3 text-3xl font-semibold text-fg sm:text-4xl">Flashcards</h1>
          <p className="mt-3 leading-relaxed text-muted">
            Key facts for the ARRT® Radiography and MRI registry exams. Recall the answer, reveal it, then grade yourself
            honestly: cards you miss come back in minutes, cards you know space out to days and weeks.
          </p>
        </header>

        {/* The deck reads ?track= from the URL, so the interactive part renders under Suspense. */}
        <Suspense fallback={<FlashcardsSkeleton />}>
          <FlashcardStudy cards={flashcards} />
        </Suspense>
      </div>
    </div>
  );
}
