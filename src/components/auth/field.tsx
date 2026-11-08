import type { ComponentProps } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/** Shared control look (surface, hairline, focus and invalid states) without sizing, so selects can share it. */
export const controlClasses =
  "rounded-xl border border-white/12 bg-ink-2 text-base text-fg transition-colors duration-150 " +
  "placeholder:text-subtle hover:border-white/20 focus:border-pink/70 aria-[invalid=true]:border-danger/70";

/** Shared input look: 48px tall, 16px text (no iOS zoom), pink border on focus, danger border when invalid. */
export const inputClasses = `block h-12 w-full px-4 ${controlClasses}`;

/** Date inputs: keep iOS Safari from centering the value and collapsing the height. */
export const dateInputClasses = "appearance-none [&::-webkit-date-and-time-value]:text-left";

/** ids for the hint and error lines, plus the aria-describedby value that links them to the control. */
export function describedBy(id: string, { hint, error }: { hint?: boolean; error?: boolean }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const value = [hintId, errorId].filter(Boolean).join(" ");
  return { hintId, errorId, describedBy: value || undefined };
}

/** Inline error under a field. Icon + text, never color alone. */
export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
      <CircleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id" | "className"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Wrapper classes. */
  className?: string;
  /** Extra classes for the input itself. */
  inputClassName?: string;
};

/** Labeled text input with optional hint and inline error, linked through aria-describedby. */
export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  className,
  inputClassName,
  ...inputProps
}: TextFieldProps) {
  const ids = describedBy(id, { hint: Boolean(hint), error: Boolean(error) });
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-medium text-fg">
        {label}
        {optional ? <span className="text-xs font-normal text-muted">Optional</span> : null}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={cn(inputClasses, "mt-2", inputClassName)}
        {...inputProps}
      />
      {hint ? (
        <p id={ids.hintId} className="mt-2 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError id={ids.errorId} message={error} />
    </div>
  );
}
