/** Static placeholder shown while the practice setup reads the URL and stored progress. */
export function PracticeSkeleton() {
  return (
    <div className="panel rounded-2xl p-5 sm:p-7" aria-busy="true">
      <p className="sr-only">Loading practice options.</p>
      <div aria-hidden className="grid gap-6">
        <div className="h-6 w-44 rounded-lg bg-white/[0.06]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-18 rounded-xl border border-white/8 bg-white/[0.02]" />
          <div className="h-18 rounded-xl border border-white/8 bg-white/[0.02]" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-11 rounded-xl border border-white/8 bg-white/[0.02]" />
          <div className="h-11 rounded-xl border border-white/8 bg-white/[0.02]" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-11 rounded-xl border border-white/8 bg-white/[0.02]" />
          <div className="h-11 rounded-xl border border-white/8 bg-white/[0.02]" />
          <div className="h-11 rounded-xl border border-white/8 bg-white/[0.02]" />
        </div>
        <div className="h-13 w-44 rounded-xl bg-white/[0.06]" />
      </div>
    </div>
  );
}
