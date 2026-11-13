"use client";

import { Bell, CalendarClock, Check, CircleAlert, CircleCheck, X } from "lucide-react";
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { EMAIL_MAX_LENGTH, firstIssueMessage, waitlistEmailSchema } from "@/lib/schemas";
import { release } from "@/lib/site";

/**
 * Launch-notification entries saved on this device. Shape: { email, productSlug?, savedAt }. The launch
 * mailing list does not exist yet, so nothing leaves the browser; flush this key when the backend ships.
 */
const STORAGE_KEY = "borepix:launch-waitlist";

/* ───────────────────────── Badge ───────────────────────── */

type BadgeProps = {
  /** `true` prints "Launch March 2027"; the default prints the short "Opens March". */
  full?: boolean;
  className?: string;
};

/** Small neon pill marking a product or panel that opens with the public launch. */
export function LaunchBadge({ full = false, className }: BadgeProps) {
  return (
    <Badge tone="neon" className={className}>
      <CalendarClock className="size-3 shrink-0" strokeWidth={2} aria-hidden />
      {full ? `Launch ${release.launch}` : `Opens ${release.launchShort}`}
    </Badge>
  );
}

/* ───────────────────────── Notify form ───────────────────────── */

type FormState = { status: "idle" } | { status: "error"; message: string } | { status: "success"; email: string };

type NotifyProps = {
  /** Slug of the product the visitor was looking at, saved with the address. */
  productSlug?: string;
  /** Card-sized: a secondary 44px button and a stacked form. The default is the primary buy-box size. */
  compact?: boolean;
  className?: string;
};

/**
 * "Notify me at launch" disclosure. The button reveals an inline email form with a visible label; a valid
 * address is saved to localStorage under "borepix:launch-waitlist" and confirmed through a polite live
 * region. Escape closes the form and returns focus to the button. The success state survives closing, so
 * the button reads "Saved for launch" until the page is left.
 */
export function LaunchNotify({ productSlug, compact = false, className }: NotifyProps) {
  const uid = useId();
  const formId = `${uid}-form`;
  const titleId = `${uid}-title`;
  const inputId = `${uid}-email`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [form, setForm] = useState<FormState>({ status: "idle" });

  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const hasError = form.status === "error";
  const saved = form.status === "success";

  function show() {
    // Render synchronously so focus can move into the form in the same event.
    flushSync(() => {
      setOpen(true);
      if (form.status === "error") setForm({ status: "idle" });
    });
    inputRef.current?.focus();
  }

  function hide() {
    flushSync(() => {
      setOpen(false);
      if (form.status === "error") setForm({ status: "idle" });
    });
    triggerRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key !== "Escape") return;
    // The form is the innermost layer: it closes alone, and an enclosing drawer stays open.
    e.preventDefault();
    e.stopPropagation();
    hide();
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = waitlistEmailSchema.safeParse(value);
    if (!parsed.success) {
      setForm({ status: "error", message: firstIssueMessage(parsed) });
      inputRef.current?.focus();
      return;
    }
    const email = parsed.data;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ email, ...(productSlug ? { productSlug } : {}), savedAt: Date.now() }),
      );
    } catch {
      setForm({ status: "error", message: "This browser is blocking site storage, so your address could not be saved." });
      inputRef.current?.focus();
      return;
    }

    setValue("");
    setForm({ status: "success", email });
  }

  return (
    <div className={className}>
      <Button
        ref={triggerRef}
        type="button"
        variant={compact ? "secondary" : "primary"}
        size={compact ? "sm" : "lg"}
        aria-expanded={open}
        aria-controls={open ? formId : undefined}
        onClick={() => (open ? hide() : show())}
        data-saved={saved ? "true" : "false"}
        className={cn(
          "w-full",
          compact && "h-11",
          "data-[saved=true]:border-success/50 data-[saved=true]:bg-success/10 data-[saved=true]:text-success data-[saved=true]:shadow-none",
          "data-[saved=true]:hover:border-success/60 data-[saved=true]:hover:bg-success/15 data-[saved=true]:hover:text-success",
        )}
      >
        {saved ? (
          <Check className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
        ) : (
          <Bell className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        )}
        {saved ? "Saved for launch" : "Notify me at launch"}
      </Button>

      {open ? (
        <form
          id={formId}
          noValidate
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          aria-labelledby={titleId}
          className={cn("hairline mt-3 rounded-2xl bg-ink p-4", !compact && "sm:p-5")}
        >
          <div className="flex items-start justify-between gap-3">
            <p id={titleId} className="pt-2 text-sm font-semibold leading-snug text-fg">
              One email when the store opens in {release.launch}.
            </p>
            <button
              type="button"
              onClick={hide}
              aria-label="Close the launch notification form"
              className="-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg"
            >
              <X className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>

          {saved ? null : (
            <>
              <label htmlFor={inputId} className="mt-3 block text-sm font-medium text-fg">
                Email address
              </label>
              <p id={hintId} className="mt-1 text-xs leading-relaxed text-muted">
                Launch emails are not switched on yet. Until then your address is saved only in this browser.
              </p>
              <div className={cn("mt-2.5 flex flex-col gap-2", !compact && "sm:flex-row")}>
                <input
                  ref={inputRef}
                  id={inputId}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="name@example.com"
                  maxLength={EMAIL_MAX_LENGTH}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (form.status === "error") setForm({ status: "idle" });
                  }}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? `${errorId} ${hintId}` : hintId}
                  className={cn(
                    "min-h-11 w-full min-w-0 flex-1 rounded-xl border bg-ink-2 px-3.5 text-base text-fg placeholder:text-subtle",
                    "transition-colors duration-150",
                    hasError ? "border-danger/70" : "border-white/12 hover:border-white/25 focus:border-pink/70",
                  )}
                />
                <Button type="submit" size="sm" className={cn("h-11 shrink-0", compact && "w-full")}>
                  Notify me
                </Button>
              </div>
            </>
          )}

          {hasError ? (
            <p id={errorId} role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
              <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              <span>{form.message}</span>
            </p>
          ) : null}

          <div role="status" aria-live="polite" aria-atomic="true">
            {saved ? (
              <p className="mt-3 flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 px-3.5 py-3 text-sm text-fg">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
                <span>
                  <span className="font-semibold text-success">Saved.</span>{" "}
                  <span className="break-all font-medium">{form.email}</span> is stored in this browser. Nothing has been
                  sent yet.
                </span>
              </p>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
