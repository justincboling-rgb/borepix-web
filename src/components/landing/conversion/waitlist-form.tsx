"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "borepix:waitlist";
const MAX_EMAIL_LENGTH = 254;
/** Deliberately permissive: one "@", no spaces, a dot in the domain. The server must validate again. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistState =
  | { status: "idle"; value: string; attempt: number }
  | { status: "error"; value: string; attempt: number; message: string }
  | { status: "success"; value: string; attempt: number; email: string };

const INITIAL: WaitlistState = { status: "idle", value: "", attempt: 0 };

function submitWaitlist(prev: WaitlistState, formData: FormData): WaitlistState {
  const raw = formData.get("email");
  const value = typeof raw === "string" ? raw : "";
  const email = value.trim();
  const attempt = prev.attempt + 1;

  if (!email) {
    return { status: "error", value, attempt, message: "Enter your email address." };
  }
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { status: "error", value, attempt, message: "Enter a valid email address, like name@example.com." };
  }

  // TODO(launch): there is no waitlist backend yet. Before the apps launch, replace this with a POST to the
  // real waitlist endpoint (server-side validation, double opt-in, unsubscribe link) and flush any address
  // already saved under STORAGE_KEY on the visitor's next page load. Until then nothing leaves this browser.
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, savedAt: Date.now() }));
  } catch {
    return {
      status: "error",
      value,
      attempt,
      message: "This browser is blocking site storage, so your address could not be saved.",
    };
  }

  return { status: "success", value: "", attempt, email };
}

/**
 * "Get notified at launch" form for the mobile apps. Uses a React form action, so a submit before hydration
 * does nothing instead of putting the address in the URL. Validates on submit, keeps the typed value on error,
 * moves focus to the field with the inline error, and announces success through a polite live region.
 */
export function WaitlistForm({ className }: { className?: string }) {
  const [state, formAction] = useActionState(submitWaitlist, INITIAL);
  const inputRef = useRef<HTMLInputElement>(null);
  // Tracks which failed attempt already received focus, so re-showing a hidden route (React Activity
  // re-runs effects) never steals focus.
  const focusedAttempt = useRef(0);

  const uid = useId();
  const headingId = `${uid}-heading`;
  const inputId = `${uid}-email`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;
  const hasError = state.status === "error";

  useEffect(() => {
    if (state.status === "error" && state.attempt !== focusedAttempt.current) {
      focusedAttempt.current = state.attempt;
      inputRef.current?.focus();
    }
  }, [state]);

  return (
    <form action={formAction} noValidate aria-labelledby={headingId} className={className}>
      <h3 id={headingId} className="font-sans text-base font-semibold text-fg">
        Get notified at launch
      </h3>

      <label htmlFor={inputId} className="mt-4 block text-sm font-medium text-fg">
        Email address
      </label>
      <p id={hintId} className="mt-1 text-sm text-muted">
        Launch emails are not switched on yet. For now, your address is saved only in this browser.
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="name@example.com"
          maxLength={MAX_EMAIL_LENGTH}
          defaultValue={state.value}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${errorId} ${hintId}` : hintId}
          className={cn(
            "min-h-13 w-full min-w-0 flex-1 rounded-xl border bg-ink px-4 text-base text-fg placeholder:text-subtle",
            "transition-colors duration-150",
            hasError ? "border-danger/70" : "border-white/12 hover:border-white/25",
          )}
        />
        <Button type="submit" size="lg" className="shrink-0">
          Notify me
        </Button>
      </div>

      {hasError ? (
        <p id={errorId} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{state.message}</span>
        </p>
      ) : null}

      <div role="status" aria-live="polite" aria-atomic="true">
        {state.status === "success" ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 px-3.5 py-3 text-sm text-fg">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
            <span>
              <span className="font-semibold text-success">Saved.</span> <span className="break-all">{state.email}</span>{" "}
              is stored in this browser only. Nothing has been sent yet.
            </span>
          </p>
        ) : null}
      </div>
    </form>
  );
}
