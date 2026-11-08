"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useLayoutEffect, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { ArrowRight, CircleAlert, Info, UserRound } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { release, site } from "@/lib/site";
import { signInLocal, useHydrated, useProgress } from "@/lib/store/progress";
import { TextField } from "./field";
import { PasswordField } from "./password-field";
import { focusFirstInvalid, validateEmail } from "./validation";

type FieldName = "email" | "password";
type Errors = Partial<Record<FieldName, string>>;
const FIELD_ORDER: readonly FieldName[] = ["email", "password"];

/** Why sign-in failed: no profile on this device at all, or one for a different email. */
type SignInProblem = "no-profile" | "other-email" | null;

/**
 * Local sign-in for the preview build. There is no account server yet, so "signing in" means finding the
 * profile stored in this browser by email. The password is required in the form but never stored or
 * compared.
 */
export function LoginForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { profile, lastProfile } = useProgress();
  const [errors, setErrors] = useState<Errors>({});
  const [problem, setProblem] = useState<SignInProblem>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;

  // A stale "no account" message or an open help note should not greet the learner when they come back.
  useLayoutEffect(
    () => () => {
      setProblem(null);
      setHelpOpen(false);
    },
    [],
  );

  function onFieldChange(e: FormEvent<HTMLFormElement>) {
    const target: EventTarget = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    const field = target.name as FieldName;
    if (problem) setProblem(null);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const hasPassword = String(data.get("password") ?? "").length > 0;

    const next: Errors = {};
    const emailError = validateEmail(email);
    if (emailError) next.email = emailError;
    if (!hasPassword) next.password = "Enter your password.";

    if (Object.keys(next).length > 0) {
      setProblem(null);
      flushSync(() => setErrors(next));
      focusFirstInvalid(form, FIELD_ORDER, next);
      return;
    }

    setErrors({});
    if (!signInLocal(email)) {
      setProblem(profile || lastProfile ? "other-email" : "no-profile");
      return;
    }

    setProblem(null);
    form.reset();
    router.push("/app");
  }

  return (
    <form noValidate onSubmit={onSubmit} onChange={onFieldChange}>
      {hydrated && profile ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-muted">
            <UserRound aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-blush" />
            <span>
              Already signed in on this device as <span className="font-medium text-fg">{profile.name}</span>.
            </span>
          </p>
          <ButtonLink href="/app" variant="secondary" size="sm" className="shrink-0">
            Go to dashboard
          </ButtonLink>
        </div>
      ) : null}

      <div className="space-y-5">
        <TextField
          id={id("email")}
          name="email"
          type="email"
          label="Email Address"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          error={errors.email}
        />
        <div>
          <PasswordField
            id={id("password")}
            name="password"
            label="Password"
            autoComplete="current-password"
            error={errors.password}
          />
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              aria-expanded={helpOpen}
              aria-controls={id("help")}
              onClick={() => setHelpOpen((open) => !open)}
              className="inline-flex min-h-11 items-center text-sm font-medium text-blush underline-offset-4 hover:underline"
            >
              Need help with your password?
            </button>
          </div>
          <div
            id={id("help")}
            hidden={!helpOpen}
            className="hairline mt-1 flex items-start gap-3 rounded-xl bg-ink-2 p-4 text-sm leading-relaxed text-muted"
          >
            <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-blush" />
            <p>
              Hosted accounts and password reset arrive with the public launch in {release.launch}. Until then,
              sign in on the device where your profile was created, or email{" "}
              <a href={`mailto:${site.supportEmail}`} className="font-medium text-fg underline underline-offset-4">
                {site.supportEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {problem ? (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm">
          <CircleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-danger" />
          <p className="leading-relaxed text-fg">
            {problem === "no-profile"
              ? "No Borepix profile on this device yet."
              : "No Borepix profile for that email on this device yet."}{" "}
            <Link href="/signup" className="font-semibold text-blush underline underline-offset-4">
              Create your account
            </Link>
          </p>
        </div>
      ) : null}

      <Button type="submit" size="lg" className="mt-7 w-full" disabled={!hydrated}>
        Log in
        <ArrowRight aria-hidden strokeWidth={1.75} className="size-5" />
      </Button>
    </form>
  );
}
