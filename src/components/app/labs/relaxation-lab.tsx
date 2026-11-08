"use client";

import { useId, useMemo, useState } from "react";
import {
  TISSUES,
  classifyWeighting,
  spinEchoSignal,
  t1Recovery,
  t2Decay,
  type FieldStrength,
  type Tissue,
  type Weighting,
} from "@/lib/mri-physics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { RangeField, Segmented } from "./controls";
import { LabFrame, type LabProps } from "./lab-frame";

type TissueId = Tissue["id"];

/** Dash patterns so curves stay distinguishable without relying on color. */
const DASH: Record<TissueId, string | undefined> = {
  fat: undefined,
  "white-matter": "7 4",
  "gray-matter": "2 4",
  muscle: "12 4 2 4",
  csf: undefined,
};

const DEFAULT_TISSUES: TissueId[] = ["fat", "white-matter", "gray-matter", "csf"];

const PRESETS = [
  { label: "T1W", tr: 500, te: 15 },
  { label: "PDW", tr: 3000, te: 20 },
  { label: "T2W", tr: 4000, te: 100 },
] as const;

const WEIGHTING_NOTE: Record<Weighting, string> = {
  "T1-weighted":
    "Short TR stops recovery early, so short-T1 tissue such as fat has regained the most magnetization and appears bright; CSF stays dark.",
  "T2-weighted":
    "Long TR lets every tissue recover, and long TE lets short-T2 tissue decay away, so long-T2 tissue such as CSF stays bright.",
  "PD-weighted":
    "Long TR minimizes T1 differences and short TE minimizes T2 differences, so signal mostly reflects proton density.",
  "Mixed weighting":
    "TR and TE sit between the classic ranges, so contrast mixes T1, T2 and proton-density effects.",
};

/* ───────────────────────── Chart ───────────────────────── */

const W = 360;
const H = 232;
const PAD = { l: 42, r: 14, t: 22, b: 40 };
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;
const SAMPLES = 160;
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

type Curve = { id: TissueId; label: string; color: string; fn: (t: number) => number };

type CurveChartProps = {
  xMax: number;
  xTicks: number[];
  xLabel: string;
  curves: Curve[];
  marker: { value: number; label: string };
  /** Horizontal reference line; the label sits below the line when `below` is set (clear of late curves). */
  reference: { y: number; label: string; below?: boolean };
  ariaLabel: string;
};

function CurveChart({ xMax, xTicks, xLabel, curves, marker, reference, ariaLabel }: CurveChartProps) {
  const x = (t: number) => PAD.l + (t / xMax) * PW;
  const y = (v: number) => PAD.t + (1 - v) * PH;

  const paths = useMemo(
    () =>
      curves.map((c) => {
        let d = "";
        for (let i = 0; i <= SAMPLES; i++) {
          const t = (i / SAMPLES) * xMax;
          d += `${i === 0 ? "M" : "L"}${(PAD.l + (t / xMax) * PW).toFixed(1)} ${(PAD.t + (1 - c.fn(t)) * PH).toFixed(1)}`;
        }
        return { ...c, d };
      }),
    [curves, xMax],
  );

  const mx = x(marker.value);
  const labelRight = mx > W - 96;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="mx-auto block h-auto w-full max-w-[36rem]">
      {/* Grid + y axis */}
      {Y_TICKS.map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="stroke-white/8" strokeWidth="1" />
          <text x={PAD.l - 6} y={y(v) + 3.5} textAnchor="end" className="fill-muted font-mono" fontSize="10.5">
            {Math.round(v * 100)}%
          </text>
        </g>
      ))}
      {/* x axis */}
      <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} className="stroke-white/25" strokeWidth="1" />
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={y(0)} y2={y(0) + 4} className="stroke-white/25" strokeWidth="1" />
          <text x={x(t)} y={y(0) + 16} textAnchor="middle" className="fill-muted font-mono" fontSize="10.5">
            {t}
          </text>
        </g>
      ))}
      <text x={PAD.l + PW / 2} y={H - 6} textAnchor="middle" className="fill-muted" fontSize="11">
        {xLabel}
      </text>

      {/* Reference line (63% / 37%) */}
      <line
        x1={PAD.l}
        x2={W - PAD.r}
        y1={y(reference.y)}
        y2={y(reference.y)}
        className="stroke-silver/50"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <text
        x={W - PAD.r}
        y={reference.below ? y(reference.y) + 13 : y(reference.y) - 5}
        textAnchor="end"
        className="fill-silver font-mono"
        fontSize="10.5"
      >
        {reference.label}
      </text>

      {/* Curves */}
      {paths.map((c) => (
        <path
          key={c.id}
          d={c.d}
          fill="none"
          stroke={c.color}
          strokeWidth={c.id === "csf" || c.id === "fat" ? 2.25 : 2}
          strokeDasharray={DASH[c.id]}
          strokeLinecap="round"
        />
      ))}

      {/* TR / TE marker */}
      <line x1={mx} x2={mx} y1={PAD.t - 6} y2={y(0)} className="stroke-pink" strokeWidth="1.5" />
      <text
        x={labelRight ? mx - 6 : mx + 6}
        y={PAD.t - 8}
        textAnchor={labelRight ? "end" : "start"}
        className="fill-blush font-mono"
        fontSize="11"
        fontWeight="600"
      >
        {marker.label}
      </text>
      {curves.map((c) => (
        <circle
          key={c.id}
          cx={mx}
          cy={y(c.fn(marker.value))}
          r="4"
          fill={c.color}
          className="stroke-ink"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

function SwatchLine({ id, color }: { id: TissueId; color: string }) {
  return (
    <svg viewBox="0 0 28 8" className="h-2 w-7 shrink-0" aria-hidden>
      <line x1="2" y1="4" x2="26" y2="4" stroke={color} strokeWidth="2.5" strokeDasharray={DASH[id]} strokeLinecap="round" />
    </svg>
  );
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/* ───────────────────────── Lab ───────────────────────── */

export function RelaxationLab({ headingLevel = "h2", className }: LabProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const Sub = headingLevel === "h2" ? "h3" : "h4";
  const [field, setField] = useState<FieldStrength>(1.5);
  const [selected, setSelected] = useState<TissueId[]>(DEFAULT_TISSUES);
  const [tr, setTr] = useState(500);
  const [te, setTe] = useState(15);

  const tissues = TISSUES[field];
  const shown = useMemo(() => tissues.filter((t) => selected.includes(t.id)), [tissues, selected]);

  const t1Curves = useMemo<Curve[]>(
    () => shown.map((t) => ({ id: t.id, label: t.label, color: t.color, fn: (ms: number) => t1Recovery(ms, t.t1) })),
    [shown],
  );
  const t2Curves = useMemo<Curve[]>(
    () => shown.map((t) => ({ id: t.id, label: t.label, color: t.color, fn: (ms: number) => t2Decay(ms, t.t2) })),
    [shown],
  );

  const rows = useMemo(() => {
    const signals = shown.map((t) => spinEchoSignal(tr, te, t));
    const max = Math.max(...signals, 1e-9);
    return shown.map((t, i) => ({
      tissue: t,
      recovered: t1Recovery(tr, t.t1),
      remaining: t2Decay(te, t.t2),
      relative: signals[i] / max,
    }));
  }, [shown, tr, te]);

  const brightest = rows.length > 1 ? rows.reduce((a, b) => (b.relative > a.relative ? b : a)).tissue.id : null;
  const weighting = classifyWeighting(tr, te, field);
  const names = shown.map((t) => t.label).join(", ") || "no tissues";
  const fieldText = field === 3 ? "3.0 T" : "1.5 T";

  function toggle(id: TissueId) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <LabFrame
      id={`lab-relaxation-${uid}`}
      title="T1 and T2 relaxation lab"
      caption="TR decides how far each tissue's longitudinal magnetization recovers; TE decides how much transverse signal is left. Together they set image weighting."
      headingLevel={headingLevel}
      className={className}
    >
      {/* Controls */}
      <div className="grid gap-6 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="grid content-start gap-6">
          <Segmented<FieldStrength>
            legend="Field strength"
            value={field}
            onChange={setField}
            options={[
              { value: 1.5, label: "1.5 T" },
              { value: 3, label: "3.0 T" },
            ]}
          />

          <fieldset className="min-w-0">
            <legend className="mb-2 text-sm font-medium text-fg">Tissues</legend>
            <div className="grid gap-1.5 @md:grid-cols-2 @2xl:grid-cols-1 @4xl:grid-cols-2">
              {tissues.map((t) => {
                const id = `${uid}-tissue-${t.id}`;
                const on = selected.includes(t.id);
                return (
                  <label
                    key={t.id}
                    htmlFor={id}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 transition-colors duration-150",
                      on ? "border-white/20 bg-white/[0.05]" : "border-white/8 hover:border-white/20",
                    )}
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(t.id)}
                      className="size-4 shrink-0 cursor-pointer accent-pink"
                    />
                    <SwatchLine id={t.id} color={t.color} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-fg">{t.label}</span>
                      <span className="num block text-xs text-muted">
                        T1 {t.t1} · T2 {t.t2} ms
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="grid content-start gap-5">
          <RangeField
            label="Repetition time (TR)"
            value={tr}
            min={300}
            max={5000}
            step={50}
            onChange={setTr}
            format={(v) => `${v} ms`}
            valueText={(v) => `${v} milliseconds`}
            hint="Time between successive 90° excitations. Marked on the T1 chart."
          />
          <RangeField
            label="Echo time (TE)"
            value={te}
            min={5}
            max={300}
            step={5}
            onChange={setTe}
            format={(v) => `${v} ms`}
            valueText={(v) => `${v} milliseconds`}
            hint="Time from excitation to the echo. Marked on the T2 chart."
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Presets</span>
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="secondary"
                size="sm"
                onClick={() => {
                  setTr(p.tr);
                  setTe(p.te);
                }}
                aria-label={`${p.label} preset: TR ${p.tr} ms, TE ${p.te} ms`}
              >
                {p.label}
                <span className="num text-xs font-normal text-muted">
                  {p.tr}/{p.te}
                </span>
              </Button>
            ))}
          </div>

          <div className="rounded-xl border border-pink/30 bg-pink/[0.06] p-4" aria-live="polite">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Weighting at {fieldText}</p>
            <p className="mt-1 font-display text-xl font-semibold text-fg">{weighting}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{WEIGHTING_NOTE[weighting]}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 @3xl:grid-cols-2">
        <figure className="min-w-0 rounded-2xl border border-white/8 bg-ink-2 p-4">
          <figcaption className="mb-3">
            <Sub className="font-sans text-base font-semibold text-fg">T1 recovery (Mz)</Sub>
            <p className="text-sm text-muted">Longitudinal magnetization regained after a 90° pulse. Each curve crosses 63% at t = T1.</p>
          </figcaption>
          <CurveChart
            xMax={5000}
            xTicks={[0, 1000, 2000, 3000, 4000, 5000]}
            xLabel="Time after 90° pulse (ms)"
            curves={t1Curves}
            marker={{ value: tr, label: `TR ${tr} ms` }}
            reference={{ y: 1 - Math.exp(-1), label: "63%", below: true }}
            ariaLabel={`T1 recovery curves, longitudinal magnetization from 0 to 100 percent over 0 to 5000 milliseconds at ${fieldText}, for ${names}. TR marker at ${tr} milliseconds. Values at TR are listed in the table below.`}
          />
        </figure>
        <figure className="min-w-0 rounded-2xl border border-white/8 bg-ink-2 p-4">
          <figcaption className="mb-3">
            <Sub className="font-sans text-base font-semibold text-fg">T2 decay (Mxy)</Sub>
            <p className="text-sm text-muted">Transverse magnetization left after a 90° pulse. Each curve falls to 37% at t = T2.</p>
          </figcaption>
          <CurveChart
            xMax={300}
            xTicks={[0, 50, 100, 150, 200, 250, 300]}
            xLabel="Time after 90° pulse (ms)"
            curves={t2Curves}
            marker={{ value: te, label: `TE ${te} ms` }}
            reference={{ y: Math.exp(-1), label: "37%" }}
            ariaLabel={`T2 decay curves, transverse magnetization from 100 down toward 0 percent over 0 to 300 milliseconds at ${fieldText}, for ${names}. TE marker at ${te} milliseconds. Values at TE are listed in the table below.`}
          />
        </figure>
      </div>

      {/* Values table */}
      <div className="mt-8">
        <Sub className="font-sans text-base font-semibold text-fg">Values at TR {tr} ms and TE {te} ms</Sub>
        {rows.length ? (
          <div
            className="mt-3 overflow-x-auto rounded-xl border border-white/8"
            role="region"
            aria-label="Tissue values table"
            tabIndex={0}
          >
            <table className="w-full whitespace-nowrap text-left text-sm">
              <caption className="sr-only">
                Recovered longitudinal magnetization at TR, remaining transverse magnetization at TE, and relative spin-echo
                signal for each selected tissue at {fieldText}.
              </caption>
              <thead className="bg-white/[0.03] text-xs text-muted">
                <tr>
                  <th scope="col" className="px-3 py-3 font-medium">Tissue</th>
                  <th scope="col" className="px-3 py-3 font-medium">T1 / T2</th>
                  <th scope="col" className="px-3 py-3 font-medium">At TR (Mz)</th>
                  <th scope="col" className="px-3 py-3 font-medium">At TE (Mxy)</th>
                  <th scope="col" className="px-3 py-3 font-medium">Signal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.tissue.id} className="border-t border-white/8">
                    <th scope="row" className="px-3 py-3 font-medium text-fg">
                      <span className="flex items-center gap-2.5">
                        <SwatchLine id={r.tissue.id} color={r.tissue.color} />
                        {r.tissue.label}
                      </span>
                    </th>
                    <td className="num px-3 py-3 text-muted">
                      {r.tissue.t1} / {r.tissue.t2} ms
                    </td>
                    <td className="num px-3 py-3 text-fg">{pct(r.recovered)}</td>
                    <td className="num px-3 py-3 text-fg">{pct(r.remaining)}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2.5">
                        <span
                          aria-hidden
                          className="size-5 shrink-0 rounded-md border border-white/15"
                          style={{ backgroundColor: `rgb(${Math.round(r.relative * 235 + 10)} ${Math.round(r.relative * 235 + 10)} ${Math.round(r.relative * 235 + 10)})` }}
                        />
                        <span className="num text-fg">{Math.round(r.relative * 100)}</span>
                        {brightest === r.tissue.id ? (
                          <span className="rounded-full border border-pink/30 bg-pink/10 px-2 py-0.5 text-xs text-blush">Brightest</span>
                        ) : null}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-white/8 p-4 text-sm text-muted">Select at least one tissue to compare.</p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Relative signal uses the simplified spin-echo model S = PD × (1 − e<sup>−TR/T1</sup>) × e<sup>−TE/T2</sup>, scaled
          so the brightest selected tissue is 100; the swatch shows it as a gray level. Relaxation times are representative
          values; published measurements vary with method and field.
        </p>
      </div>
    </LabFrame>
  );
}
