"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SegmentedOption<T extends string | number> = { value: T; label: ReactNode };

type SegmentedProps<T extends string | number> = {
  legend: ReactNode;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  /** Visually hide the legend (it stays available to assistive tech). */
  hideLegend?: boolean;
  className?: string;
};

/**
 * Single-choice segmented control built on native radio inputs, so arrow keys move the selection
 * and screen readers announce "radio button, n of m". Each option is at least 44px tall.
 */
export function Segmented<T extends string | number>({
  legend,
  value,
  options,
  onChange,
  hideLegend = false,
  className,
}: SegmentedProps<T>) {
  const uid = useId();
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className={cn("mb-2 text-sm font-medium text-fg", hideLegend && "sr-only")}>{legend}</legend>
      <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-ink-2 p-1">
        {options.map((o) => {
          const id = `${uid}-${String(o.value)}`;
          const checked = o.value === value;
          return (
            <label
              key={String(o.value)}
              htmlFor={id}
              className={cn(
                "inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg px-3.5 text-sm font-medium",
                "transition-colors duration-150",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush",
                checked ? "bg-pink-strong text-white" : "text-muted hover:bg-white/[0.06] hover:text-fg",
              )}
            >
              <input
                id={id}
                type="radio"
                name={uid}
                value={String(o.value)}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

type RangeFieldProps = {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Visible readout, e.g. "500 ms". */
  format: (value: number) => string;
  /** Spoken value, e.g. "500 milliseconds". Defaults to the visible readout. */
  valueText?: (value: number) => string;
  hint?: ReactNode;
  className?: string;
};

/** Labelled range input with a mono readout. The input box is 44px tall for touch. */
export function RangeField({ label, value, min, max, step, onChange, format, valueText, hint, className }: RangeFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        <output htmlFor={id} className="num text-sm font-medium text-blush">
          {format(value)}
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
        aria-valuetext={valueText ? valueText(value) : format(value)}
        aria-describedby={hint ? hintId : undefined}
        className="mt-1 block h-11 w-full cursor-pointer accent-pink"
      />
      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Small mono readout tile: label above, value below. */
export function Readout({
  label,
  value,
  unit,
  className,
  emphasis = false,
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  className?: string;
  emphasis?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-white/8 bg-ink-2 px-4 py-3", className)}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("num mt-1 font-semibold text-fg", emphasis ? "text-3xl sm:text-4xl" : "text-xl")}>
        {value}
        {unit ? <span className="ml-1 text-base font-medium text-muted">{unit}</span> : null}
      </p>
    </div>
  );
}
