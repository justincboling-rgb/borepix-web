/** Placeholder layout shown until stored progress is readable, so the dashboard never flashes empty states. */
export function DashboardSkeleton() {
  const block = "animate-pulse rounded-2xl border border-line bg-card";
  return (
    <div aria-hidden className="mt-8 space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${block} h-80 lg:row-span-2 lg:h-auto`} />
        <div className={`${block} h-36`} />
        <div className={`${block} h-36`} />
        <div className={`${block} h-36`} />
        <div className={`${block} h-36`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${block} h-24`} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className={`${block} h-80 lg:col-span-3`} />
        <div className={`${block} h-80 lg:col-span-2`} />
      </div>
    </div>
  );
}
