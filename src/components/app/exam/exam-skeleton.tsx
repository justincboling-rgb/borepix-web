/** Static first paint for /app/exam before the client-only exam tree mounts. Carries the page h1. */
export function ExamSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true">
      <header>
        <p className="eyebrow">Timed simulation</p>
        <h1 className="mt-3 text-3xl font-semibold text-fg sm:text-4xl">Mock exam</h1>
        <p className="mt-3 max-w-2xl text-muted">
          A timed, registry-style exam built from original Borepix questions written to the ARRT® content categories.
          These are not actual exam items.
        </p>
      </header>
      <p className="sr-only">Loading the mock exam.</p>
      <div aria-hidden className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="panel grid gap-6 rounded-2xl p-5 sm:p-7">
          <div className="h-6 w-44 rounded-lg bg-white/[0.06]" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-18 rounded-xl border border-white/8 bg-white/[0.02]" />
            <div className="h-18 rounded-xl border border-white/8 bg-white/[0.02]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-18 rounded-xl border border-white/8 bg-white/[0.02]" />
            <div className="h-18 rounded-xl border border-white/8 bg-white/[0.02]" />
            <div className="h-18 rounded-xl border border-white/8 bg-white/[0.02]" />
          </div>
          <div className="h-13 w-48 rounded-xl bg-white/[0.06]" />
        </div>
        <div className="panel h-80 rounded-2xl" />
      </div>
    </div>
  );
}
