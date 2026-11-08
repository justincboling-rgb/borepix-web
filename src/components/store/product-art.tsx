import { useId, type ReactNode } from "react";
import type { ProductArt as ProductArtVariant } from "@/data/types";
import { cn } from "@/lib/cn";

/**
 * Generated product artwork: one inline SVG per `product.art`. Silver line art, a single pink accent and a soft
 * pink radial glow, drawn on a 4:3 canvas so it sits flush in a card's art panel. Purely decorative (aria-hidden).
 * No raster assets, no colour literals: every colour is a design token.
 */

type Props = { variant: ProductArtVariant; className?: string };

/** Keeps hairlines 1px wherever the SVG is scaled. */
const NS = { vectorEffect: "non-scaling-stroke" } as const;

const PINK = { stopColor: "var(--color-pink)" } as const;

function Glow({ id, cx, cy, r, strength = 0.42 }: { id: string; cx: number; cy: number; r: number; strength?: number }) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={PINK} stopOpacity={strength} />
          <stop offset="45%" style={PINK} stopOpacity={strength * 0.28} />
          <stop offset="100%" style={PINK} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}

/* ───────────────────────── bore: MRI bore seen head-on ───────────────────────── */

const BORE_RINGS = [122, 100, 78, 56] as const;

function Bore({ id }: { id: string }) {
  return (
    <>
      <Glow id={`${id}-glow`} cx={200} cy={150} r={128} />
      {BORE_RINGS.map((r, i) => (
        <circle key={r} cx={200} cy={150} r={r} className="stroke-silver" strokeOpacity={0.16 + i * 0.12} strokeWidth={1} {...NS} />
      ))}
      {/* Isocentre ticks on the outer ring */}
      <path d="M200 20 V34 M200 266 V280 M70 150 H84 M316 150 H330" className="stroke-silver" strokeOpacity={0.5} strokeWidth={1} strokeLinecap="round" {...NS} />
      {/* Glowing core */}
      <circle cx={200} cy={150} r={46} fill={`url(#${id}-glow)`} />
      <circle cx={200} cy={150} r={36} className="stroke-pink" strokeOpacity={0.95} strokeWidth={1.5} {...NS} />
      {/* Patient table chord inside the bore */}
      <path d="M164 170 H236" className="stroke-silver" strokeOpacity={0.75} strokeWidth={1.25} strokeLinecap="round" {...NS} />
      <path d="M172 177 H228" className="stroke-silver" strokeOpacity={0.35} strokeWidth={1} strokeLinecap="round" {...NS} />
    </>
  );
}

/* ───────────────────────── vessel: branching arterial tree ───────────────────────── */

const VESSEL_SILVER: { d: string; w: number; o: number }[] = [
  { d: "M200 292 C204 252 198 228 196 196", w: 2.2, o: 0.85 },
  { d: "M196 196 C188 166 150 154 126 118 C112 98 100 80 92 52", w: 1.6, o: 0.75 },
  { d: "M126 118 C110 112 92 118 72 112", w: 1.1, o: 0.55 },
  { d: "M150 154 C134 150 118 158 104 170", w: 1.1, o: 0.5 },
  { d: "M92 52 C86 44 80 38 70 34", w: 0.9, o: 0.4 },
  { d: "M92 52 C96 42 104 36 112 30", w: 0.9, o: 0.4 },
  { d: "M196 196 C198 172 204 150 200 126 C197 108 194 92 198 70", w: 1.2, o: 0.6 },
  { d: "M198 70 C190 60 184 54 176 48", w: 0.9, o: 0.4 },
  { d: "M198 70 C206 60 212 54 222 50", w: 0.9, o: 0.4 },
  { d: "M268 118 C286 116 300 122 322 116", w: 1.1, o: 0.55 },
  { d: "M240 152 C258 150 272 160 284 174", w: 1.1, o: 0.5 },
  { d: "M314 46 C318 38 326 32 338 30", w: 0.9, o: 0.4 },
  { d: "M314 46 C308 36 300 30 292 24", w: 0.9, o: 0.4 },
];

const VESSEL_ENDS: [number, number][] = [
  [70, 34], [112, 30], [72, 112], [104, 170], [176, 48], [222, 50], [322, 116], [284, 174], [338, 30], [292, 24],
];

function Vessel({ id }: { id: string }) {
  return (
    <>
      <Glow id={`${id}-glow`} cx={262} cy={122} r={120} />
      {VESSEL_SILVER.map((p) => (
        <path key={p.d} d={p.d} className="stroke-silver" strokeOpacity={p.o} strokeWidth={p.w} strokeLinecap="round" {...NS} />
      ))}
      {/* Accent: the right main branch, the pathway being assessed */}
      <path d="M196 196 C206 164 240 152 268 118 C290 92 304 72 314 46" className="stroke-pink" strokeOpacity={0.95} strokeWidth={1.6} strokeLinecap="round" {...NS} />
      {VESSEL_ENDS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} className="fill-silver" fillOpacity={0.7} />
      ))}
      <circle cx={196} cy={196} r={4} className="fill-pink" fillOpacity={0.9} />
      <circle cx={196} cy={196} r={9} className="stroke-pink" strokeOpacity={0.35} strokeWidth={1} {...NS} />
    </>
  );
}

/* ───────────────────────── slice: stacked axial slices ───────────────────────── */

const SLICE_COUNT = 5;

function Slice({ id }: { id: string }) {
  const slices = Array.from({ length: SLICE_COUNT }, (_, i) => ({ cx: 184 + i * 8, cy: 232 - i * 26, top: i === SLICE_COUNT - 1 }));
  const top = slices[slices.length - 1];
  return (
    <>
      <Glow id={`${id}-glow`} cx={top.cx} cy={top.cy} r={130} />
      <line x1={slices[0].cx} y1={slices[0].cy} x2={top.cx} y2={top.cy} className="stroke-silver" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="3 5" {...NS} />
      {slices.map((s, i) => {
        const o = 0.18 + i * 0.1;
        return (
          <g key={s.cy}>
            {s.top ? <ellipse cx={s.cx} cy={s.cy} rx={108} ry={36} className="fill-pink" fillOpacity={0.06} /> : null}
            <ellipse cx={s.cx} cy={s.cy} rx={108} ry={36} className={s.top ? "stroke-pink" : "stroke-silver"} strokeOpacity={s.top ? 0.95 : o} strokeWidth={s.top ? 1.5 : 1} {...NS} />
            <ellipse cx={s.cx} cy={s.cy} rx={66} ry={20} className={s.top ? "stroke-pink" : "stroke-silver"} strokeOpacity={s.top ? 0.55 : o * 0.7} strokeWidth={1} {...NS} />
            <path d={`M${s.cx} ${s.cy - 18} V${s.cy + 18}`} className={s.top ? "stroke-pink" : "stroke-silver"} strokeOpacity={s.top ? 0.45 : o * 0.6} strokeWidth={1} {...NS} />
          </g>
        );
      })}
    </>
  );
}

/* ───────────────────────── helix: CT helical acquisition ───────────────────────── */

const HELIX = (() => {
  const x0 = 64;
  const x1 = 336;
  const cy = 150;
  const ry = 60;
  const turns = 3;
  const samples = 360;
  const front: string[] = [];
  const back: string[] = [];
  let run: string[] = [];
  let runFront = true;
  const pt = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const flush = () => {
    if (run.length > 1) (runFront ? front : back).push(`M ${run[0]} L ${run.slice(1).join(" ")}`);
    run = [];
  };
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const theta = Math.PI * 2 * turns * t;
    const x = x0 + (x1 - x0) * t;
    const y = cy + ry * Math.sin(theta);
    const isFront = Math.cos(theta) >= 0;
    if (i > 0 && isFront !== runFront) {
      run.push(pt(x, y));
      flush();
      runFront = isFront;
    }
    run.push(pt(x, y));
  }
  flush();
  return { front: front.join(" "), back: back.join(" ") };
})();

function Helix({ id }: { id: string }) {
  return (
    <>
      <Glow id={`${id}-glow`} cx={200} cy={150} r={118} />
      {/* Back half of the trajectory, behind the table */}
      <path d={HELIX.back} className="stroke-silver" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="3 4" strokeLinecap="round" {...NS} />
      {/* Gantry ring, seen edge-on */}
      <ellipse cx={200} cy={150} rx={24} ry={106} className="stroke-silver" strokeOpacity={0.22} strokeWidth={1} {...NS} />
      <ellipse cx={200} cy={150} rx={18} ry={94} className="stroke-silver" strokeOpacity={0.5} strokeWidth={1} {...NS} />
      {/* Patient table and pedestal */}
      <rect x={48} y={144} width={304} height={12} rx={6} className="stroke-silver" strokeOpacity={0.7} strokeWidth={1.25} {...NS} />
      <path d="M300 156 V206 H344" className="stroke-silver" strokeOpacity={0.4} strokeWidth={1} strokeLinecap="round" {...NS} />
      {/* Accent: the fan beam from tube to detector */}
      <path d="M200 60 L184 240 H216 Z" className="fill-pink stroke-pink" fillOpacity={0.08} strokeOpacity={0.85} strokeWidth={1} strokeLinejoin="round" {...NS} />
      <circle cx={200} cy={58} r={3} className="fill-pink" fillOpacity={0.95} />
      {/* Front half of the trajectory, in front of the table */}
      <path d={HELIX.front} className="stroke-silver" strokeOpacity={0.85} strokeWidth={1.5} strokeLinecap="round" {...NS} />
    </>
  );
}

/* ───────────────────────── shield: MR safety ───────────────────────── */

function Shield({ id }: { id: string }) {
  return (
    <>
      <Glow id={`${id}-glow`} cx={200} cy={146} r={118} />
      <path d="M200 34 L292 66 V148 C292 206 254 246 200 266 C146 246 108 206 108 148 V66 Z" className="stroke-silver" strokeOpacity={0.85} strokeWidth={1.5} strokeLinejoin="round" {...NS} />
      <path d="M200 52 L276 78 V148 C276 196 244 230 200 248 C156 230 124 196 124 148 V78 Z" className="stroke-silver" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="4 6" strokeLinejoin="round" {...NS} />
      {/* Field lines above the poles */}
      <path d="M160 100 C170 82 230 82 240 100" className="stroke-silver" strokeOpacity={0.35} strokeWidth={1} strokeLinecap="round" {...NS} />
      <path d="M150 92 C165 64 235 64 250 92" className="stroke-silver" strokeOpacity={0.2} strokeWidth={1} strokeLinecap="round" {...NS} />
      {/* Accent: the magnet mark */}
      <path d="M170 118 V158 A30 30 0 0 0 230 158 V118" className="stroke-pink" strokeOpacity={0.95} strokeWidth={6} strokeLinecap="butt" {...NS} />
      <rect x={165} y={106} width={10} height={14} rx={1} className="fill-silver" fillOpacity={0.9} />
      <rect x={225} y={106} width={10} height={14} rx={1} className="fill-silver" fillOpacity={0.9} />
    </>
  );
}

/* ───────────────────────── pass: CE Library membership card ───────────────────────── */

function Pass({ id }: { id: string }) {
  const grid = `${id}-grid`;
  const clip = `${id}-clip`;
  return (
    <>
      <Glow id={`${id}-glow`} cx={282} cy={104} r={120} />
      <defs>
        <pattern id={grid} patternUnits="userSpaceOnUse" width={14} height={14}>
          <path d="M14 0 H0 V14" className="stroke-silver" strokeOpacity={0.14} strokeWidth={1} fill="none" />
        </pattern>
        <clipPath id={clip}>
          <rect x={72} y={78} width={256} height={160} rx={16} />
        </clipPath>
      </defs>
      <g transform="rotate(-7 200 158)">
        <rect x={72} y={78} width={256} height={160} rx={16} className="fill-silver" fillOpacity={0.03} />
        <rect x={72} y={78} width={256} height={160} fill={`url(#${grid})`} clipPath={`url(#${clip})`} />
        <rect x={72} y={78} width={256} height={160} rx={16} className="stroke-silver" strokeOpacity={0.85} strokeWidth={1.5} {...NS} />
        {/* Chip */}
        <rect x={96} y={104} width={36} height={26} rx={5} className="stroke-silver" strokeOpacity={0.7} strokeWidth={1} {...NS} />
        <path d="M96 117 H132 M114 104 V130" className="stroke-silver" strokeOpacity={0.45} strokeWidth={1} {...NS} />
        {/* Monogram */}
        <circle cx={296} cy={112} r={12} className="stroke-silver" strokeOpacity={0.6} strokeWidth={1} {...NS} />
        <circle cx={296} cy={112} r={4} className="fill-silver" fillOpacity={0.55} />
        {/* Name and term lines */}
        <rect x={96} y={150} width={120} height={5} rx={2.5} className="fill-silver" fillOpacity={0.5} />
        <rect x={96} y={164} width={84} height={5} rx={2.5} className="fill-silver" fillOpacity={0.3} />
        {/* Accent: the active-term bar */}
        <rect x={96} y={198} width={136} height={3} rx={1.5} className="fill-pink" fillOpacity={0.95} />
        <rect x={240} y={196} width={62} height={7} rx={3.5} className="fill-silver" fillOpacity={0.25} />
      </g>
    </>
  );
}

/* ───────────────────────── phone: mobile app with a quiz rail ───────────────────────── */

const PHONE_OPTIONS = [0, 1, 2, 3] as const;
const PHONE_SELECTED = 1;

function Phone({ id }: { id: string }) {
  return (
    <>
      <Glow id={`${id}-glow`} cx={200} cy={150} r={132} />
      <rect x={140} y={28} width={120} height={244} rx={24} className="stroke-silver" strokeOpacity={0.85} strokeWidth={1.5} {...NS} />
      <rect x={148} y={36} width={104} height={228} rx={17} className="stroke-silver" strokeOpacity={0.3} strokeWidth={1} {...NS} />
      <path d="M138 84 V104 M138 112 V132 M262 96 V124" className="stroke-silver" strokeOpacity={0.6} strokeWidth={1.25} strokeLinecap="round" {...NS} />
      <rect x={184} y={44} width={32} height={8} rx={4} className="fill-silver" fillOpacity={0.55} />
      {/* Progress rail */}
      <rect x={160} y={66} width={80} height={3} rx={1.5} className="fill-silver" fillOpacity={0.2} />
      <rect x={160} y={66} width={52} height={3} rx={1.5} className="fill-silver" fillOpacity={0.7} />
      {/* Question stem */}
      <rect x={160} y={80} width={80} height={5} rx={2.5} className="fill-silver" fillOpacity={0.5} />
      <rect x={160} y={90} width={58} height={5} rx={2.5} className="fill-silver" fillOpacity={0.3} />
      {/* Options; the selected one is the accent */}
      {PHONE_OPTIONS.map((i) => {
        const y = 108 + i * 32;
        const selected = i === PHONE_SELECTED;
        return (
          <g key={i}>
            {selected ? <rect x={160} y={y} width={80} height={24} rx={7} className="fill-pink" fillOpacity={0.08} /> : null}
            <rect x={160} y={y} width={80} height={24} rx={7} className={selected ? "stroke-pink" : "stroke-silver"} strokeOpacity={selected ? 0.9 : 0.35} strokeWidth={1} {...NS} />
            <circle cx={172} cy={y + 12} r={4.5} className={selected ? "stroke-pink" : "stroke-silver"} strokeOpacity={selected ? 0.95 : 0.5} strokeWidth={1} {...NS} />
            {selected ? <circle cx={172} cy={y + 12} r={2.4} className="fill-pink" fillOpacity={0.95} /> : null}
            <rect x={182} y={y + 9.5} width={selected ? 50 : 40} height={5} rx={2.5} className="fill-silver" fillOpacity={selected ? 0.55 : 0.3} />
          </g>
        );
      })}
      {/* Next control */}
      <rect x={160} y={240} width={80} height={16} rx={8} className="fill-silver" fillOpacity={0.22} />
      <rect x={188} y={246} width={24} height={4} rx={2} className="fill-silver" fillOpacity={0.5} />
    </>
  );
}

const ART: Record<ProductArtVariant, (props: { id: string }) => ReactNode> = {
  bore: Bore,
  vessel: Vessel,
  slice: Slice,
  helix: Helix,
  shield: Shield,
  pass: Pass,
  phone: Phone,
};

export function ProductArt({ variant, className }: Props) {
  // Gradient and pattern ids must be unique per instance; useId is safe on the server and the client.
  const id = `art-${useId().replace(/[^A-Za-z0-9_-]/g, "")}`;
  const Art = ART[variant];
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-full w-full", className)}
    >
      <Art id={id} />
    </svg>
  );
}

/** The cart drawer imports this as a default; the store files use the named export. Both are the same component. */
export default ProductArt;
