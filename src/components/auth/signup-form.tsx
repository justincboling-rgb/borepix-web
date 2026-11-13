"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TERMS_MESSAGE } from "@/lib/schemas";
import { setProfile, useHydrated, useProgress } from "@/lib/store/progress";
import { phoneCountry, toE164 } from "./countries";
import { FieldError, TextField } from "./field";
import { PasswordField } from "./password-field";
import { PhoneField } from "./phone-field";
import {
  focusFirstInvalid,
  NAME_MAX,
  PASSWORD_MIN,
  POSTAL_MAX,
  validateEmail,
  validateName,
  validateNewPassword,
  validatePhone,
  validatePostalCode,
} from "./validation";

type FieldName = "email" | "firstName" | "lastName" | "phone" | "postalCode" | "password" | "terms";
type Errors = Partial<Record<FieldName, string>>;
const FIELD_ORDER: readonly FieldName[] = ["email", "firstName", "lastName", "phone", "postalCode", "password", "terms"];

/** Form field name of the country-code select; changing it clears the phone error. */
const PHONE_COUNTRY_FIELD = "phoneCountry";

function fieldFor(name: string): FieldName | null {
  if (name === PHONE_COUNTRY_FIELD) return "phone";
  return (FIELD_ORDER as readonly string[]).includes(name) ? (name as FieldName) : null;
}

/**
 * Creates the local learner profile. The password is validated for length and then discarded: it is never
 * put in state, storage or the URL (the submit button stays disabled until hydration, so the browser
 * cannot fall back to a native GET submission). The exam track defaults to Radiography and can be
 * changed in the app's settings.
 */
export function SignupForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { profile } = useProgress();
  const [errors, setErrors] = useState<Errors>({});
  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;

  function onFieldChange(e: FormEvent<HTMLFormElement>) {
    const target: EventTarget = e.target;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return;
    const field = fieldFor(target.name);
    if (field && errors[field]) {
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
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const country = phoneCountry(String(data.get(PHONE_COUNTRY_FIELD) ?? ""));
    const phoneNational = String(data.get("phone") ?? "");
    const postalCode = String(data.get("postalCode") ?? "").trim();

    const checks: Errors = {
      email: validateEmail(email),
      firstName: validateName(firstName, "first name"),
      lastName: validateName(lastName, "last name"),
      phone: validatePhone(phoneNational, country.dial),
      postalCode: validatePostalCode(postalCode),
      password: validateNewPassword(String(data.get("password") ?? "")),
      terms: data.get("terms") ? undefined : TERMS_MESSAGE,
    };
    const next: Errors = {};
    for (const field of FIELD_ORDER) {
      if (checks[field]) next[field] = checks[field];
    }

    if (Object.keys(next).length > 0) {
      // Commit the messages first so aria-describedby points at them when focus lands.
      flushSync(() => setErrors(next));
      focusFirstInvalid(form, FIELD_ORDER, next);
      return;
    }

    setErrors({});
    setProfile({
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      phone: toE164(country.dial, phoneNational),
      postalCode,
      track: "radiography",
      plan: "trial",
      createdAt: Date.now(),
    });
    // Clear every field (password included) so a revisited, Activity-preserved page starts fresh.
    form.reset();
    router.push("/app");
  }

  return (
    <form noValidate onSubmit={onSubmit} onChange={onFieldChange}>
      {hydrated && profile ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-blush" />
          <p className="leading-relaxed text-muted">
            This browser already has a profile for <span className="font-medium text-fg">{profile.email}</span>.
            Creating a new one replaces it; your study history stays.{" "}
            <Link href="/app" className="font-medium text-blush underline-offset-4 hover:underline">
              Go to your dashboard
            </Link>
          </p>
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
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id={id("firstName")}
            name="firstName"
            label="First Name"
            autoComplete="given-name"
            required
            maxLength={NAME_MAX}
            error={errors.firstName}
          />
          <TextField
            id={id("lastName")}
            name="lastName"
            label="Last Name"
            autoComplete="family-name"
            required
            maxLength={NAME_MAX}
            error={errors.lastName}
          />
        </div>
        <PhoneField id={id("phone")} name="phone" countryName={PHONE_COUNTRY_FIELD} label="Phone Number" error={errors.phone} />
        <TextField
          id={id("postalCode")}
          name="postalCode"
          label="Postal Code"
          autoComplete="postal-code"
          autoCapitalize="characters"
          spellCheck={false}
          required
          maxLength={POSTAL_MAX}
          error={errors.postalCode}
        />
        <PasswordField
          id={id("password")}
          name="password"
          label="Password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN}
          hint={`At least ${PASSWORD_MIN} characters.`}
          error={errors.password}
        />

        <div>
          <div className="flex min-h-11 items-start gap-3">
            <input
              id={id("terms")}
              name="terms"
              type="checkbox"
              required
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? `${id("terms")}-error` : undefined}
              className="mt-0.5 size-5 shrink-0 accent-pink-strong"
            />
            <label htmlFor={id("terms")} className="text-sm leading-relaxed text-muted">
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-blush underline underline-offset-4">
                Terms of Service
              </Link>
              ,{" "}
              <Link href="/privacy" className="font-medium text-blush underline underline-offset-4">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/disclaimer" className="font-medium text-blush underline underline-offset-4">
                Educational Disclaimer
              </Link>
              .
            </label>
          </div>
          <FieldError id={`${id("terms")}-error`} message={errors.terms} />
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-7 w-full" disabled={!hydrated}>
        Sign Up
        <ArrowRight aria-hidden strokeWidth={1.75} className="size-5" />
      </Button>
    </form>
  );
}
