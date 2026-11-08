"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChoiceOption<V extends string> = {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

type Props<V extends string> = {
  legend: ReactNode;
  /** Helper text under the legend, linked with aria-describedby. */
  hint?: ReactNode;
  value: V;
  options: ChoiceOption<V>[];
  onChange: (value: V) => void;
  /** Tailwind grid-cols classes for the option grid. */
  columnsClassName?: string;
  /** Compact single-line options (e.g. 10 / 20 / All). */
  compact?: boolean;
  className?: string;
};

/**
 * Radio group rendered as selectable cards. Native radios keep arrow-key and screen reader behavior;
 * the selected state is shown with a filled indicator and border, not color alone.
 */
export function ChoiceGroup<V extends string>({
  legend,
  hint,
  value,
  options,
  onChange,
  columnsClassName = "sm:grid-cols-2",
  compact = false,
  className,
}: Props<V>) {
  const uid = useId();
  const name = `choice-${uid}`;
  const hintId = hint ? `${name}-hint` : undefined;

  return (
    <fieldset className={cn("min-w-0", className)} aria-describedby={hintId}>
      <legend className="text-sm font-medium text-fg">{legend}</legend>
      {hint ? (
        <p id={hintId} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <div className={cn("mt-3 grid gap-3", columnsClassName)}>
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          const checked = opt.value === value;
          return (
            <label
              key={opt.value}
              htmlFor={id}
              className={cn(
                "relative flex min-h-11 items-start gap-3 rounded-xl border px-4 transition-colors duration-150",
                compact ? "items-center py-2.5" : "py-3.5",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush",
                checked
                  ? "border-pink/60 bg-pink/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]",
                opt.disabled && "pointer-events-none opacity-45",
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                disabled={opt.disabled}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border",
                  compact ? "" : "mt-0.5",
                  checked ? "border-pink" : "border-white/30",
                )}
              >
                <span className={cn("size-2 rounded-full bg-pink transition-transform duration-150", checked ? "scale-100" : "scale-0")} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-fg">{opt.label}</span>
                {opt.description ? <span className="mt-0.5 block text-sm text-muted">{opt.description}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
