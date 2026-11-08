import { ChevronDown, CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared input look: 48px tall, 16px text (no iOS zoom), pink border on focus, danger border when invalid. */
export const inputClasses =
  "block h-12 w-full rounded-xl border border-white/12 bg-ink-2 px-4 text-base text-fg " +
  "transition-colors duration-150 placeholder:text-subtle hover:border-white/20 " +
  "focus:border-pink/70 aria-[invalid=true]:border-danger/70 disabled:cursor-not-allowed disabled:opacity-60";

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

type FieldLabelProps = {
  htmlFor: string;
  children: ReactNode;
  optional?: boolean;
  /** Rendered at the right end of the label row, e.g. the detected card brand. */
  end?: ReactNode;
};

function FieldLabel({ htmlFor, children, optional, end }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="flex min-h-5 items-center justify-between gap-3 text-sm font-medium text-fg">
      <span>{children}</span>
      {optional || end ? (
        <span className="flex items-center gap-2">
          {optional ? <span className="text-xs font-normal text-muted">Optional</span> : null}
          {end}
        </span>
      ) : null}
    </label>
  );
}

type InputFieldProps = Omit<ComponentProps<"input">, "id" | "className"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Rendered at the right end of the label row, e.g. the detected card brand. Part of the label text. */
  labelEnd?: ReactNode;
  /** Rendered inside the field on the right, e.g. a unit. Decorative only; keep it under 7rem wide. */
  trailing?: ReactNode;
  /** Wrapper classes. */
  className?: string;
  /** Extra classes for the input itself. */
  inputClassName?: string;
};

/** Labeled text input with optional hint, trailing chip and inline error, linked through aria-describedby. */
export function InputField({
  id,
  label,
  hint,
  error,
  optional,
  labelEnd,
  trailing,
  className,
  inputClassName,
  ...inputProps
}: InputFieldProps) {
  const ids = describedBy(id, { hint: Boolean(hint), error: Boolean(error) });
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional} end={labelEnd}>
        {label}
      </FieldLabel>
      <div className="relative mt-2">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          className={cn(inputClasses, trailing && "pr-32", inputClassName)}
          {...inputProps}
        />
        {trailing ? (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {trailing}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p id={ids.hintId} className="mt-2 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError id={ids.errorId} message={error} />
    </div>
  );
}

type SelectFieldProps = Omit<ComponentProps<"select">, "id" | "className"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

/** Labeled native select styled to match the inputs, with a chevron affordance. */
export function SelectField({ id, label, hint, error, className, children, ...selectProps }: SelectFieldProps) {
  const ids = describedBy(id, { hint: Boolean(hint), error: Boolean(error) });
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative mt-2">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          className={cn(inputClasses, "appearance-none pr-11")}
          {...selectProps}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-silver"
        />
      </div>
      {hint ? (
        <p id={ids.hintId} className="mt-2 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError id={ids.errorId} message={error} />
    </div>
  );
}
