"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GAMMA_BAR_MHZ_PER_T, larmorMHz } from "@/lib/mri-physics";
import { cn } from "@/lib/cn";
import { useInView, usePrefersReducedMotion } from "./hooks";
import { LabFrame, type LabProps } from "./lab-frame";

const FIELDS = [
  { tesla: 0.35, tag: "Low field" },
  { tesla: 0.55, tag: "Low field" },
  { tesla: 1.0, tag: "Mid field" },
  { tesla: 1.5, tag: "Common clinical" },
  { tesla: 3.0, tag: "High field" },
  { tesla: 7.0, tag: "Ultra-high field" },
] as const;

type Tesla = (typeof FIELDS)[number]["tesla"];

const MAX_MHZ = larmorMHz(7);

/** On-screen revolutions per second at 1.5 T. Scales linearly with field, like the real frequency. */
const VIS_REV_PER_S_AT_1_5T = 0.4;
const SLOWDOWN_MILLIONS = Math.round((larmorMHz(1.5) * 1e6) / VIS_REV_PER_S_AT_1_5T / 1e6);

/* SVG geometry (viewBox 320 × 300). The vector is a cone of half-angle 30° around B0. */
const OX = 160;
const OY = 262;
const VEC_LEN = 160;
const TILT = Math.PI / 6;
const R = VEC_LEN * Math.sin(TILT);
const CX = OX;
const CY = OY - VEC_LEN * Math.cos(TILT);
const RY = R * 0.28;
const HEAD = 13;
const PHI0 = Math.PI / 3;

function geometry(phi: number) {
  const tx = CX + R * Math.cos(phi);
  const ty = CY + RY * Math.sin(phi);
  const dx = tx - OX;
  const dy = ty - OY;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const bx = tx - ux * HEAD;
  const by = ty - uy * HEAD;
  const nx = -uy * 6.5;
  const ny = ux * 6.5;
  return {
    tx,
    ty,
    bx,
    by,
    head: `${tx.toFixed(2)},${ty.toFixed(2)} ${(bx + nx).toFixed(2)},${(by + ny).toFixed(2)} ${(bx - nx).toFixed(2)},${(by - ny).toFixed(2)}`,
    /** In front of the B0 axis (toward the viewer) when sin φ ≥ 0. */
    opacity: Math.sin(phi) >= 0 ? "1" : "0.55",
  };
}

const INITIAL = geometry(PHI0);

type Playback = "auto" | "play" | "pause";

export function LarmorLab({ headingLevel = "h2", className }: LabProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const Sub = headingLevel === "h2" ? "h3" : "h4";
  const [tesla, setTesla] = useState<Tesla>(1.5);
  const [playback, setPlayback] = useState<Playback>("auto");
  const reducedMotion = usePrefersReducedMotion();

  const svgWrapRef = useRef<HTMLDivElement>(null);
  const vectorRef = useRef<SVGGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const headRef = useRef<SVGPolygonElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const phiRef = useRef(PHI0);
  const inView = useInView(svgWrapRef, "64px");

  const mhz = larmorMHz(tesla);
  const animating = playback === "play" || (playback === "auto" && !reducedMotion);
  const revPerSec = (VIS_REV_PER_S_AT_1_5T * tesla) / 1.5;

  useEffect(() => {
    if (!animating || !inView) return;
    const group = vectorRef.current;
    const line = lineRef.current;
    const head = headRef.current;
    const tip = tipRef.current;
    if (!group || !line || !head || !tip) return;

    let raf = 0;
    let last = performance.now();
    const frame = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      phiRef.current = (phiRef.current + dt * revPerSec * 2 * Math.PI) % (2 * Math.PI);
      const g = geometry(phiRef.current);
      line.setAttribute("x2", g.bx.toFixed(2));
      line.setAttribute("y2", g.by.toFixed(2));
      head.setAttribute("points", g.head);
      tip.setAttribute("cx", g.tx.toFixed(2));
      tip.setAttribute("cy", g.ty.toFixed(2));
      group.setAttribute("opacity", g.opacity);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [animating, inView, revPerSec]);

  const fieldLabel = (t: number) => `${t.toFixed(t < 1 ? 2 : 1)} T`;
  const periodNs = 1000 / mhz;

  return (
    <LabFrame
      id={`lab-larmor-${uid}`}
      title="Larmor frequency lab"
      caption="Precessional frequency rises in direct proportion to field strength, and the RF pulse must match it to cause resonance."
      headingLevel={headingLevel}
      className={className}
    >
      <div className="grid gap-8 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Visual + readouts */}
        <div>
          <div ref={svgWrapRef} className="relative mx-auto max-w-sm rounded-2xl border border-white/8 bg-ink-2 haze-top">
            <svg
              viewBox="0 0 320 300"
              role="img"
              aria-label={`Diagram: the net magnetization vector, tilted 30 degrees from the B0 axis, precessing around it at ${mhz.toFixed(1)} MHz. The animation is slowed for visibility.`}
              className="block h-auto w-full"
            >
              <defs>
                <marker id={`${uid}-b0`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" className="fill-silver" />
                </marker>
                <radialGradient id={`${uid}-glow`}>
                  <stop offset="0%" stopColor="var(--color-pink)" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="var(--color-pink)" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* B0 axis */}
              <line x1={OX} y1={OY + 18} x2={OX} y2={30} className="stroke-silver" strokeWidth="2" markerEnd={`url(#${uid}-b0)`} />
              <text x={OX + 12} y={38} className="fill-silver font-mono" fontSize="14" fontWeight="600">
                B0
              </text>

              {/* Precession cone */}
              <line x1={OX} y1={OY} x2={CX - R} y2={CY} className="stroke-white/15" strokeWidth="1" />
              <line x1={OX} y1={OY} x2={CX + R} y2={CY} className="stroke-white/15" strokeWidth="1" />
              <path
                d={`M ${CX - R} ${CY} A ${R} ${RY} 0 0 1 ${CX + R} ${CY}`}
                fill="none"
                className="stroke-silver/40"
                strokeWidth="1.5"
                strokeDasharray="4 5"
              />
              <path d={`M ${CX - R} ${CY} A ${R} ${RY} 0 0 0 ${CX + R} ${CY}`} fill="none" className="stroke-silver/60" strokeWidth="1.5" />

              {/* Magnetization vector (positions updated imperatively while animating) */}
              <g ref={vectorRef} opacity={INITIAL.opacity}>
                <circle ref={tipRef} cx={INITIAL.tx} cy={INITIAL.ty} r="16" fill={`url(#${uid}-glow)`} />
                <line
                  ref={lineRef}
                  x1={OX}
                  y1={OY}
                  x2={INITIAL.bx}
                  y2={INITIAL.by}
                  className="stroke-pink"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <polygon ref={headRef} points={INITIAL.head} className="fill-pink" />
              </g>

              {/* Hydrogen nucleus */}
              <circle cx={OX} cy={OY} r="11" className="fill-card-2 stroke-silver" strokeWidth="1.5" />
              <text x={OX} y={OY + 4} textAnchor="middle" className="fill-fg font-mono" fontSize="11" fontWeight="600">
                H
              </text>
              <text x={CX + R + 8} y={CY - 6} className="fill-blush font-mono" fontSize="12">
                M
              </text>
            </svg>
          </div>

          <div className="mx-auto mt-3 flex max-w-sm flex-wrap items-center justify-between gap-3">
            <p className="text-xs leading-relaxed text-muted">
              {animating
                ? `Animation speed is scaled for visibility, about ${SLOWDOWN_MILLIONS} million times slower than real precession.`
                : reducedMotion && playback === "auto"
                  ? "Animation is off because your system requests reduced motion."
                  : "Animation paused."}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPlayback(animating ? "pause" : "play")}
              aria-label={animating ? "Pause precession animation" : "Play precession animation"}
            >
              {animating ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              {animating ? "Pause" : "Play"}
            </Button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/8 bg-ink-2 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Larmor frequency at {fieldLabel(tesla)}</p>
            <p className="num mt-1 text-4xl font-semibold text-fg @md:text-5xl">
              {mhz.toFixed(1)}
              <span className="ml-2 text-xl font-medium text-blush">MHz</span>
            </p>
            <p className="num mt-3 text-sm text-muted">
              ω0 = γ × B0 = {GAMMA_BAR_MHZ_PER_T.toFixed(2)} MHz/T × {fieldLabel(tesla)}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">One precession</dt>
                <dd className="num mt-0.5 text-fg">{periodNs.toFixed(1)} ns</dd>
              </div>
              <div>
                <dt className="text-muted">Real rate</dt>
                <dd className="num mt-0.5 text-fg">{mhz.toFixed(1)} million turns/s</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Field strength selection, doubling as a proportionality chart */}
        <fieldset className="min-w-0">
          <legend>
            <Sub className="font-sans text-base font-semibold text-fg">Field strength (B0)</Sub>
          </legend>
          <p className="mt-1 text-sm text-muted">Pick a magnet. Bar length is the Larmor frequency, so you can see it scale linearly.</p>
          <div className="mt-4 grid gap-2">
            {FIELDS.map((f) => {
              const id = `${uid}-field-${f.tesla}`;
              const checked = f.tesla === tesla;
              const fMhz = larmorMHz(f.tesla);
              return (
                <label
                  key={f.tesla}
                  htmlFor={id}
                  className={cn(
                    "relative grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-xl border px-3.5 py-2.5",
                    "transition-colors duration-150",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush",
                    checked ? "border-pink/60 bg-pink/10" : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]",
                  )}
                >
                  <input
                    id={id}
                    type="radio"
                    name={`${uid}-field`}
                    value={f.tesla}
                    checked={checked}
                    onChange={() => setTesla(f.tesla)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded-full border",
                      checked ? "border-pink" : "border-white/30",
                    )}
                  >
                    {checked ? <span className="size-2 rounded-full bg-pink" /> : null}
                  </span>
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="num shrink-0 text-sm font-semibold text-fg">{fieldLabel(f.tesla)}</span>
                    <span className="truncate text-xs text-muted">{f.tag}</span>
                  </span>
                  <span className="num text-right text-sm text-fg">{fMhz.toFixed(1)} MHz</span>
                  <span aria-hidden className="col-span-2 col-start-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <span
                      className={cn("block h-full rounded-full", checked ? "bg-pink" : "bg-silver/50")}
                      style={{ width: `${(fMhz / MAX_MHZ) * 100}%` }}
                    />
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Doubling the field doubles the frequency: 1.5 T resonates near 63.9 MHz and 3.0 T near 127.7 MHz. The RF pulse
            must be transmitted at this frequency to tip the protons out of alignment.
          </p>
        </fieldset>
      </div>
    </LabFrame>
  );
}
