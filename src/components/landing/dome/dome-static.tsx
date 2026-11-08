import { cn } from "@/lib/cn";
import { DOME_PARTS } from "./parts";

/** Five concentric rings in the bore palette, used by both the skeleton and the no-WebGL fallback. */
function Rings({ animated }: { animated: boolean }) {
  const rings = [
    { r: 150, stroke: "text-silver/70", width: 3 },
    { r: 122, stroke: "text-silver/45", width: 8 },
    { r: 98, stroke: "text-muted/60", width: 4 },
    { r: 80, stroke: "text-pink", width: 2 },
  ];
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="dome-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff007f" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ff007f" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ff007f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="150" fill="url(#dome-glow)" />
      {rings.map((ring, i) => (
        <circle
          key={ring.r}
          cx="200"
          cy="200"
          r={ring.r}
          fill="none"
          stroke="currentColor"
          strokeWidth={ring.width}
          className={cn(ring.stroke, animated && "origin-center animate-[bp-float_6s_ease-in-out_infinite]")}
          style={animated ? { animationDelay: `${i * 0.35}s` } : undefined}
        />
      ))}
      <rect x="150" y="196" width="150" height="8" rx="4" className="fill-silver/40" />
      <rect x="178" y="186" width="90" height="12" rx="6" className="fill-white/80" />
    </svg>
  );
}

/** Shown while the WebGL bundle loads. */
export function DomeSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0", className)} aria-hidden="true">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-0 flex items-center justify-center p-10">
        <div className="aspect-square h-full max-h-[22rem] opacity-70">
          <Rings animated />
        </div>
      </div>
      <p className="absolute left-4 top-4 flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-fg/70 sm:left-5 sm:top-5">
        <span className="relative inline-flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-pink/60" />
          <span className="relative inline-block size-2 rounded-full bg-pink" />
        </span>
        Loading bore
      </p>
    </div>
  );
}

/** Static version of the bore for browsers without WebGL: rings plus the numbered layer list. */
export function DomeFallback({ className }: { className?: string }) {
  return (
    <figure className={cn("absolute inset-0 flex flex-col", className)}>
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
      <div className="relative flex flex-1 items-center justify-center p-8">
        <div className="aspect-square h-full max-h-[20rem]">
          <Rings animated={false} />
        </div>
      </div>
      <figcaption className="relative border-t border-white/8 px-4 py-4 sm:px-5">
        <p className="eyebrow">MRI bore anatomy · outer to inner</p>
        <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {DOME_PARTS.map((part, i) => (
            <li key={part.id} className="flex items-baseline gap-2">
              <span className="num text-xs text-blush">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-fg">{part.name}</span>
              <span className="font-mono text-[0.6875rem] text-muted">{part.short}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
