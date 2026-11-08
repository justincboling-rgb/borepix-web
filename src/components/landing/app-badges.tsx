"use client";

import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { Bell, CircleAlert, CircleCheck, Play, Smartphone, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

const STORAGE_KEY = "borepix:app-waitlist";
const MAX_EMAIL_LENGTH = 254;
/** Deliberately permissive: one "@", no spaces, a dot in the domain. The launch backend validates again. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Platform = "ios" | "android";

type StoreBadge = {
  platform: Platform;
  icon: LucideIcon;
  small: string;
  large: string;
  href: string | null;
  /** Accessible name when the badge is a link. */
  linkLabel: string;
  /** Short name used in the notify form's copy. */
  appName: string;
};

const BADGES: StoreBadge[] = [
  {
    platform: "ios",
    icon: Smartphone,
    small: "Download on the",
    large: "App Store",
    href: site.appLinks.ios,
    linkLabel: "Download Borepix on the App Store",
    appName: "the iOS app",
  },
  {
    platform: "android",
    icon: Play,
    small: "Get it on",
    large: "Google Play",
    href: site.appLinks.android,
    linkLabel: "Get Borepix on Google Play",
    appName: "the Android app",
  },
];

type FormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; email: string };

const badgeClasses =
  "group inline-flex min-h-14 w-full items-center gap-3 rounded-xl hairline bg-ink px-4 text-left " +
  "transition-[border-color,background-color,transform] duration-150 ease-out hover:bg-white/[0.03] " +
  "active:scale-[0.99] sm:w-auto sm:min-w-44";

function BadgeFace({ icon: Icon, small, large }: Pick<StoreBadge, "icon" | "small" | "large">) {
  return (
    <>
      <Icon className="size-6 shrink-0 text-silver transition-colors duration-150 group-hover:text-fg" strokeWidth={1.75} aria-hidden />
      <span className="flex flex-col leading-none">
        <span className="text-[0.625rem] font-medium tracking-[0.14em] text-muted uppercase">{small}</span>
        <span className="mt-1 font-display text-base font-semibold text-fg">{large}</span>
      </span>
    </>
  );
}

/**
 * App Store and Google Play badges. When `site.appLinks` has a URL the badge is a link; while it is null
 * the badge opens an inline "Get notified at launch" form instead of a dead link. The address is saved to
 * localStorage under "borepix:app-waitlist" until the launch mailing list exists.
 */
export function AppBadges({ className }: { className?: string }) {
  const uid = useId();
  const formId = `${uid}-notify`;
  const headingId = `${uid}-heading`;
  const inputId = `${uid}-email`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  const [openFor, setOpenFor] = useState<Platform | null>(null);
  const [value, setValue] = useState("");
  const [form, setForm] = useState<FormState>({ status: "idle" });

  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRefs = useRef<Partial<Record<Platform, HTMLButtonElement | null>>>({});

  const current = openFor ? BADGES.find((b) => b.platform === openFor) : undefined;
  const hasError = form.status === "error";

  function open(platform: Platform) {
    // Render synchronously so focus can move into the form in the same event.
    flushSync(() => {
      setOpenFor(platform);
      if (form.status === "error") setForm({ status: "idle" });
    });
    inputRef.current?.focus();
  }

  function close() {
    const platform = openFor;
    flushSync(() => {
      setOpenFor(null);
      setForm({ status: "idle" });
    });
    if (platform) triggerRefs.current[platform]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = value.trim();

    if (!email) {
      setForm({ status: "error", message: "Enter your email address." });
      inputRef.current?.focus();
      return;
    }
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
      setForm({ status: "error", message: "Enter a valid email address, like name@example.com." });
      inputRef.current?.focus();
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ email, platform: openFor, savedAt: Date.now() }),
      );
    } catch {
      setForm({
        status: "error",
        message: "This browser is blocking site storage, so your address could not be saved.",
      });
      inputRef.current?.focus();
      return;
    }

    setValue("");
    setForm({ status: "success", email });
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {BADGES.map((badge) => {
          const { platform, href, linkLabel } = badge;

          if (href) {
            return (
              <a
                key={platform}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${linkLabel} (opens in a new tab)`}
                className={cn(badgeClasses, "hover:border-white/25")}
              >
                <BadgeFace {...badge} />
              </a>
            );
          }

          const isOpen = openFor === platform;
          return (
            <button
              key={platform}
              ref={(el) => {
                triggerRefs.current[platform] = el;
              }}
              type="button"
              aria-expanded={isOpen}
              aria-controls={isOpen ? formId : undefined}
              onClick={() => (isOpen ? close() : open(platform))}
              className={cn(badgeClasses, isOpen ? "border-pink/60 bg-white/[0.03]" : "hover:border-white/25")}
            >
              <BadgeFace {...badge} />
            </button>
          );
        })}
      </div>

      {openFor && current ? (
        <form
          id={formId}
          noValidate
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          aria-labelledby={headingId}
          className="hairline mt-4 rounded-2xl bg-card p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">
                <Bell className="size-3.5" strokeWidth={1.75} aria-hidden />
                Coming to {current.platform === "ios" ? "the App Store" : "Google Play"}
              </p>
              <h3 id={headingId} className="mt-2 font-sans text-base font-semibold text-fg">
                Get notified at launch
              </h3>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close the launch notification form"
              className="-mt-1.5 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg"
            >
              <X className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>

          <label htmlFor={inputId} className="mt-4 block text-sm font-medium text-fg">
            Email address
          </label>
          <p id={hintId} className="mt-1 text-sm text-muted">
            We will email you once when {current.appName} is live. Until then your address is saved only in this browser.
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
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
              maxLength={MAX_EMAIL_LENGTH}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (form.status !== "idle") setForm({ status: "idle" });
              }}
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
              <span>{form.message}</span>
            </p>
          ) : null}

          <div role="status" aria-live="polite" aria-atomic="true">
            {form.status === "success" ? (
              <p className="mt-3 flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 px-3.5 py-3 text-sm text-fg">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
                <span>
                  <span className="font-semibold text-success">Saved.</span> We will notify{" "}
                  <span className="break-all font-medium">{form.email}</span> when {current.appName} launches.
                </span>
              </p>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
