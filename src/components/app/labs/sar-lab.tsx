"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";
import { relativeSar } from "@/lib/mri-physics";
import { cn } from "@/lib/cn";
import { RangeField, Segmented } from "./controls";
import { LabFrame, type LabProps } from "./lab-frame";

type Field = 1.5 | 3;

function fmt(v: number): string {
  if (v >= 10) return v.toFixed(1);
  if (v >= 0.1) return v.toFixed(2);
  return v.toFixed(3);
}

/** Smallest "nice" axis maximum (1, 2, 2.5, 5 × 10^k) at or above x. */
function niceCeil(x: number): number {
  const exp = Math.floor(Math.log10(x));
  const base = 10 ** exp;
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * base >= x - 1e-9) return m * base;
  }
  return 10 * base;
}

type BarProps = { label: string; detail: string; value: number; axisMax: number; strong?: boolean };

function Bar({ label, detail, value, axisMax, strong = false }: BarProps) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm">
        <span className="text-fg">
          {label} <span className="num text-xs text-muted">{detail}</span>
        </span>
        <span className="num ml-auto font-medium text-fg">{fmt(value)}×</span>
      </div>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/8" aria-hidden>
        <div
          className={cn(
            "h-full origin-left rounded-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out-expo",
            strong ? "bg-pink" : "bg-silver/60",
          )}
          style={{ transform: `scaleX(${Math.min(1, value / axisMax)})` }}
        />
      </div>
    </div>
  );
}

export function SarLab({ headingLevel = "h2", className }: LabProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const Sub = headingLevel === "h2" ? "h3" : "h4";
  const [field, setField] = useState<Field>(1.5);
  const [flip, setFlip] = useState(90);
  const [pulses, setPulses] = useState(1);

  const sar = relativeSar(field, flip, pulses);
  const fieldFactor = (field / 1.5) ** 2;
  const flipFactor = (flip / 90) ** 2;
  const axisMax = niceCeil(Math.max(1, sar) * 1.1);
  const fieldText = field === 3 ? "3.0 T" : "1.5 T";

  return (
    <LabFrame
      id={`lab-sar-${uid}`}
      title="SAR lab"
      caption="RF heating (SAR) grows with the square of field strength and flip angle, and with how many RF pulses you deliver per unit time."
      headingLevel={headingLevel}
      className={className}
    >
      <div className="grid gap-8 @2xl:grid-cols-2">
        <div className="grid content-start gap-6">
          <Segmented<Field>
            legend="Field strength"
            value={field}
            onChange={setField}
            options={[
              { value: 1.5, label: "1.5 T" },
              { value: 3, label: "3.0 T" },
            ]}
          />
          <RangeField
            label="Flip angle"
            value={flip}
            min={10}
            max={180}
            step={5}
            onChange={setFlip}
            format={(v) => `${v}°`}
            valueText={(v) => `${v} degrees`}
            hint="For spin echo, think of the refocusing pulses: a 180° pulse carries four times the energy of a 90° pulse."
          />
          <RangeField
            label="RF pulses per unit time"
            value={pulses}
            min={1}
            max={4}
            step={0.5}
            onChange={setPulses}
            format={(v) => `${v.toFixed(1)}×`}
            valueText={(v) => `${v.toFixed(1)} times the reference`}
            hint="Relative to the reference sequence. More slices per TR, a longer echo train or a shorter TR all deliver more pulses."
          />
        </div>

        <div className="grid content-start gap-5">
          <div className="rounded-2xl border border-pink/30 bg-pink/[0.06] p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Relative SAR</p>
            <p className="num mt-1 text-4xl font-semibold text-fg @md:text-5xl" aria-live="polite">
              {fmt(sar)}
              <span className="ml-2 text-xl font-medium text-blush">× reference</span>
            </p>
            <p className="mt-2 text-sm text-muted">Reference: 1.5 T, 90° flip, 1× pulses per unit time.</p>

            <dl className="num mt-4 grid gap-1.5 border-t border-white/10 pt-4 text-sm">
              <div className="flex flex-wrap justify-between gap-x-3">
                <dt className="text-muted">Field (B0 / 1.5 T)²</dt>
                <dd className="ml-auto text-right text-fg">
                  ({fieldText.replace(" T", "")} / 1.5)² = {fieldFactor.toFixed(2)}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-3">
                <dt className="text-muted">Flip (α / 90°)²</dt>
                <dd className="ml-auto text-right text-fg">
                  ({flip} / 90)² = {flipFactor.toFixed(2)}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-3">
                <dt className="text-muted">Pulses per unit time</dt>
                <dd className="ml-auto text-right text-fg">× {pulses.toFixed(1)}</dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/8 bg-ink-2 p-5">
            <Bar label="Reference" detail="1.5 T · 90° · 1.0×" value={1} axisMax={axisMax} />
            <Bar label="Your settings" detail={`${fieldText} · ${flip}° · ${pulses.toFixed(1)}×`} value={sar} axisMax={axisMax} strong />
            <div className="num flex justify-between text-xs text-muted" aria-hidden>
              <span>0</span>
              <span>{fmt(axisMax / 2)}×</span>
              <span>{fmt(axisMax)}×</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 @xl:grid-cols-2">
        <div>
          <Sub className="font-sans text-base font-semibold text-fg">What drives SAR</Sub>
          <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-muted">
            <li>SAR scales with B0². Doubling the field from 1.5 T to 3.0 T quadruples SAR for the same sequence.</li>
            <li>SAR scales with flip angle². Halving the flip angle cuts its contribution to one quarter.</li>
            <li>SAR scales with the number of RF pulses delivered per unit time.</li>
          </ul>
        </div>
        <div>
          <Sub className="font-sans text-base font-semibold text-fg">Ways to lower SAR</Sub>
          <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-muted">
            <li>Lower the flip angle or the refocusing angle.</li>
            <li>Lengthen TR.</li>
            <li>Acquire fewer slices per TR.</li>
            <li>Shorten the echo train.</li>
            <li>Use parallel imaging to cut the number of echoes and RF pulses needed.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-muted">
        <Info className="mt-0.5 size-5 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
        <p>
          <span className="font-medium text-fg">This is a relative teaching model.</span> It does not calculate SAR in W/kg.
          The scanner computes actual SAR from the patient&apos;s weight, the coil and the sequence, and enforces the limits.
          In normal operating mode, IEC 60601-2-33 limits SAR to 2 W/kg whole-body and 3.2 W/kg for the head, averaged over 6
          minutes.
        </p>
      </div>
    </LabFrame>
  );
}
