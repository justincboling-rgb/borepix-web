/** Placeholder shown while the flashcard deck reads URL filters and stored progress. Server-safe. */
export function FlashcardsSkeleton() {
  return (
    <div className="mt-8 grid gap-8" aria-busy="true" aria-label="Loading flashcards">
      <div className="panel rounded-2xl p-5 sm:p-6">
        <div className="h-5 w-24 rounded-md bg-white/8" />
        <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
          <div className="h-11 rounded-xl bg-white/[0.05]" />
          <div className="h-11 rounded-xl bg-white/[0.05]" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[4.5rem] rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
      <CardSkeleton />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="panel min-h-72 rounded-2xl p-6 sm:p-8 motion-safe:animate-pulse" aria-hidden>
      <div className="h-5 w-32 rounded-full bg-white/8" />
      <div className="mt-8 h-6 w-3/4 rounded-md bg-white/8" />
      <div className="mt-3 h-6 w-1/2 rounded-md bg-white/8" />
    </div>
  );
}
