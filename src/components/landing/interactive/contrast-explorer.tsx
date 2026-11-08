"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { Check, Info } from "lucide-react";
import {
  GAMMA_BAR_MHZ_PER_T,
  TISSUES,
  classifyWeighting,
  larmorMHz,
  spinEchoSignal,
  type FieldStrength,
  type Weighting,
} from "@/lib/mri-physics";
import { cn } from "@/lib/cn";

const TR = { min: 100, max: 4000, step: 10 } as const;
const TE = { min: 5, max: 150, step: 1 } as const;

type Params = { tr: number; te: number };

const DEFAULTS: Params = { tr: 500, te: 15 };

const PRESETS = [
  { label: "T1W", tr: 500, te: 15 },
  { label: "PDW", tr: 2500, te: 20 },
  { label: "T2W", tr: 3000, te: 100 },
] as const;

const FIELDS: { value: FieldStrength; label: string }[] = [
  { value: 1.5, label: "1.5 T" },
  { value: 3, label: "3.0 T" },
];

const WEIGHTING_NOTE: Record<Weighting, string> = {
  "T1-weighted": "Short TR cuts T1 recovery short. Short-T1 tissue such as fat stays bright; fluid stays dark.",
  "T2-weighted": "Long TR evens out T1 differences. Long TE lets T2 decay separate tissues, so fluid stays bright.",
  "PD-weighted": "Long TR and short TE keep T1 and T2 effects small, so signal tracks proton density more closely.",
  "Mixed weighting": "Outside the classic ranges. Contrast blends T1 and T2 effects.",
};

/** Phantom ring radii in SVG units (viewBox 200), outer ring first. */
const RING_OUTER = 88;
const RING_INNER = 22;

/** Native range input styled for WebKit/Blink and Firefox. The filled part of the track reads --fill. */
const rangeClass = cn(
  "block h-11 w-full cursor-pointer appearance-none bg-transparent",
  "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full",
  "[&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-pink)_var(--fill),rgb(255_255_255/0.14)_var(--fill))]",
  "[&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none",
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-pink",
  "[&::-webkit-slider-thumb]:bg-fg [&::-webkit-slider-thumb]:shadow-[var(--shadow-glow-sm)]",
  "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/14",
  "[&::-moz-range-progress]:h-1.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-pink",
  "[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2",
  "[&::-moz-range-thumb]:border-pink [&::-moz-range-thumb]:bg-fg",
);

function gray(rel: number): string {
  const v = Math.round(Math.min(1, Math.max(0, rel)) * 255);
  return `rgb(${v} ${v} ${v})`;
}

/**
 * Interactive spin-echo contrast explorer: TR, TE and field strength drive a relative-signal bar chart
 * and a synthetic phantom whose gray levels equal the computed signal.
 */
export function ContrastExplorer() {
  const uid = useId();
  const [params, setParams] = useState<Params>(DEFAULTS);
  const [field, setField] = useState<FieldStrength>(1.5);
  const { tr, te } = params;

  const model = useMemo(() => {
    const tissues = TISSUES[field];
    const raw = tissues.map((t) => spinEchoSignal(tr, te, t));
    const peak = Math.max(...raw);
    const rows = tissues.map((t, i) => {
      const rel = peak > 0 ? raw[i] / peak : 0;
      return { id: t.id, label: t.label, color: t.color, rel, pct: Math.round(rel * 100), fill: gray(rel) };
    });
    const ranked = [...rows].sort((a, b) => b.rel - a.rel);
    const ringStep = rows.length > 1 ? (RING_OUTER - RING_INNER) / (rows.length - 1) : 0;
    return {
      rows,
      rings: rows.map((r, i) => ({ id: r.id, r: RING_OUTER - i * ringStep, fill: r.fill })),
      brightest: ranked[0],
      darkest: ranked[ranked.length - 1],
      weighting: classifyWeighting(tr, te, field),
    };
  }, [tr, te, field]);

  const fieldLabel = FIELDS.find((f) => f.value === field)?.label ?? `${field} T`;
  const larmor = larmorMHz(field).toFixed(1);
  const ringOrder = model.rows.map((r) => (r.id === "csf" ? r.label : r.label.toLowerCase())).join(", ");

  // TE is always kept shorter than TR, as in a real spin-echo sequence: each slider pushes the other.
  const setTr = (next: number) =>
    setParams((p) => ({ tr: next, te: p.te >= next ? Math.max(TE.min, next - TR.step) : p.te }));
  const setTe = (next: number) =>
    setParams((p) => ({
      te: next,
      tr: next >= p.tr ? Math.min(TR.max, Math.ceil((next + TR.step) / TR.step) * TR.step) : p.tr,
    }));

  const ids = {
    tr: `${uid}-tr`,
    te: `${uid}-te`,
    presets: `${uid}-presets`,
    phantom: `${uid}-phantom`,
    pairing: `${uid}-pairing`,
  };

  return (
    <div className="panel overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-white/8 px-5 py-4 sm:px-6">
        <h3 className="flex items-center gap-2.5 font-display text-base font-semibold text-fg">
          <span aria-hidden className="size-2 rounded-full bg-pink shadow-[var(--shadow-glow-sm)]" />
          Contrast explorer
        </h3>
        <p className="num text-xs text-muted">
          Spin echo: S = PD &times; (1 &minus; e<sup>&minus;TR/T1</sup>) &times; e<sup>&minus;TE/T2</sup>
        </p>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {/* Readout: phantom + weighting */}
        <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-6">
          <svg viewBox="0 0 200 200" className="h-auto w-full" role="img" aria-labelledby={ids.phantom}>
            <circle cx="100" cy="100" r="97" fill="none" className="stroke-white/15" strokeWidth="1" />
            {[0, 90, 180, 270].map((deg) => (
              <line
                key={deg}
                x1="100"
                y1="0"
                x2="100"
                y2="7"
                transform={`rotate(${deg} 100 100)`}
                className="stroke-blush/70"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ))}
            {model.rings.map((ring) => (
              <circle key={ring.id} cx="100" cy="100" r={ring.r} fill={ring.fill} className="stroke-ink" strokeWidth="2.5" />
            ))}
          </svg>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Image weighting</p>
            <p aria-live="polite" aria-atomic="true" className="mt-1 font-display text-xl font-semibold text-fg sm:text-2xl">
              {model.weighting}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{WEIGHTING_NOTE[model.weighting]}</p>
            <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <div className="flex gap-1.5">
                <dt className="text-muted">Brightest</dt>
                <dd className="font-medium text-fg">{model.brightest.label}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-muted">Darkest</dt>
                <dd className="font-medium text-fg">{model.darkest.label}</dd>
              </div>
            </dl>
          </div>
        </div>

        <p id={ids.phantom} className="text-xs leading-relaxed text-muted">
          Synthetic phantom, outer ring to center: {ringOrder}. Each gray level equals that tissue&rsquo;s relative
          signal.
        </p>

        {/* Relative signal bars */}
        <figure>
          <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
            <span className="font-medium text-fg">Relative signal</span>
            <span className="text-xs text-muted">Brightest tissue = 100%</span>
          </figcaption>
          <ul className="mt-3 space-y-2">
            {model.rows.map((row) => (
              <li
                key={row.id}
                className="grid grid-cols-[minmax(0,7.75rem)_minmax(0,1fr)_2.75rem] items-center gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2 text-fg">
                  <span
                    aria-hidden
                    className="size-3 shrink-0 rounded-[3px] ring-1 ring-white/20"
                    style={{ backgroundColor: row.fill }}
                  />
                  {row.label}
                </span>
                <span aria-hidden className="relative h-2 overflow-hidden rounded-full bg-white/8">
                  <span
                    className="absolute inset-0 origin-left transition-transform duration-200 ease-out"
                    style={{ transform: `scaleX(${row.rel})`, backgroundColor: row.color }}
                  />
                </span>
                <span className="num text-right text-fg">{row.pct}%</span>
              </li>
            ))}
          </ul>
        </figure>

        {/* Controls */}
        <div className="space-y-5 border-t border-white/8 pt-6">
          <div role="group" aria-labelledby={ids.presets}>
            <p id={ids.presets} className="text-sm font-medium text-fg">
              Presets
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {PRESETS.map((p) => {
                const active = tr === p.tr && te === p.te;
                return (
                  <button
                    key={p.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setParams({ tr: p.tr, te: p.te })}
                    className={cn(
                      "flex min-h-12 flex-col items-center justify-center rounded-xl border px-2 py-1.5 transition-colors duration-150",
                      active
                        ? "border-pink/60 bg-pink/10 text-fg"
                        : "border-white/10 bg-white/[0.02] text-muted hover:border-white/25 hover:text-fg",
                    )}
                  >
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      {active ? <Check className="size-3.5 text-blush" strokeWidth={2.25} aria-hidden /> : null}
                      {p.label}
                    </span>
                    <span aria-hidden className="num text-xs text-muted">
                      {p.tr}/{p.te}
                    </span>
                    <span className="sr-only">
                      , TR {p.tr} ms, TE {p.te} ms
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <RangeField
              id={ids.tr}
              abbr="TR"
              name="repetition time"
              value={tr}
              {...TR}
              onChange={setTr}
              describedBy={ids.pairing}
            />
            <RangeField
              id={ids.te}
              abbr="TE"
              name="echo time"
              value={te}
              {...TE}
              onChange={setTe}
              describedBy={ids.pairing}
            />
            <p id={ids.pairing} className="text-xs text-muted sm:col-span-2">
              TE stays shorter than TR, as in a real spin-echo sequence. Moving one past the other pushes it along.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <fieldset className="min-w-0">
              <legend className="text-sm font-medium text-fg">
                Field strength <span className="font-normal text-muted">(B0)</span>
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-ink-2 p-1">
                {FIELDS.map((f) => {
                  const checked = field === f.value;
                  return (
                    <label
                      key={f.label}
                      className={cn(
                        "flex min-h-11 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors duration-150",
                        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush",
                        checked ? "bg-pink-strong text-white" : "text-muted hover:bg-white/[0.05] hover:text-fg",
                      )}
                    >
                      <input
                        type="radio"
                        name={`${uid}-field`}
                        value={f.value}
                        checked={checked}
                        onChange={() => setField(f.value)}
                        className="sr-only"
                      />
                      {checked ? <Check className="size-4" strokeWidth={2.25} aria-hidden /> : null}
                      <span className="num">{f.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="rounded-xl border border-white/8 bg-ink-2 px-4 py-2.5">
              <p className="text-xs text-muted">Larmor frequency</p>
              <p aria-live="polite" aria-atomic="true" className="num text-lg font-medium text-fg">
                {larmor} MHz
              </p>
              <p className="num text-xs text-muted">
                {GAMMA_BAR_MHZ_PER_T.toFixed(2)} MHz/T &times; {fieldLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="flex items-start gap-2 border-t border-white/8 px-5 py-3.5 text-xs leading-relaxed text-muted sm:px-6">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        Teaching model. Representative relaxation times; real values vary by sequence, field and source.
      </p>
    </div>
  );
}

type RangeFieldProps = {
  id: string;
  abbr: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  describedBy?: string;
  onChange: (value: number) => void;
};

function RangeField({ id, abbr, name, value, min, max, step, describedBy, onChange }: RangeFieldProps) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {abbr} <span className="font-normal text-muted">{name}</span>
        </label>
        {/* The slider already exposes its value to assistive tech, so the visual readout stays silent. */}
        <output htmlFor={id} aria-live="off" className="num text-sm font-medium text-blush">
          {value} ms
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        aria-valuetext={`${value} milliseconds`}
        aria-describedby={describedBy}
        className={rangeClass}
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
      <div aria-hidden className="num -mt-1 flex justify-between text-xs text-muted">
        <span>{min}</span>
        <span>{max} ms</span>
      </div>
    </div>
  );
}
