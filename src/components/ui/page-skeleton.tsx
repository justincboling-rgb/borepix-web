import { cn } from "@/lib/cn";

/**
 * Placeholder painted while a slug-dependent page body resolves inside <Suspense>. Keeps the static
 * shell instant under cacheComponents. Blocks approximate an eyebrow, a title, a lede and a panel.
 */
export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("container-x pt-24 sm:pt-28", className)} aria-busy="true" aria-label="Loading">
      <div className="h-3 w-40 animate-pulse rounded-full bg-white/10" />
      <div className="mt-6 h-10 w-3/4 max-w-xl animate-pulse rounded-lg bg-white/10" />
      <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded-md bg-white/[0.07]" />
      <div className="mt-2 h-5 w-5/6 max-w-xl animate-pulse rounded-md bg-white/[0.07]" />
      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="h-80 animate-pulse rounded-2xl border border-line bg-card" />
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-card" />
      </div>
    </div>
  );
}
