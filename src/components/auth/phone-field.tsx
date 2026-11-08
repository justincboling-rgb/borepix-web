import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { DEFAULT_PHONE_COUNTRY, flagEmoji, PHONE_COUNTRIES } from "./countries";
import { controlClasses, describedBy, FieldError, inputClasses } from "./field";

type Props = {
  /** id of the number input; the visible label points at it. */
  id: string;
  /** Form field name of the national number, read with FormData. */
  name: string;
  /** Form field name of the country-code select (ISO 3166-1 alpha-2 value). */
  countryName: string;
  label: string;
  hint?: string;
  error?: string;
  defaultCountry?: string;
};

/**
 * Phone number as a country-code select (flag + dial code) beside a national-number input. Both are
 * uncontrolled: the form reads them once at submit and stores the E.164 result (see `toE164`).
 */
export function PhoneField({ id, name, countryName, label, hint, error, defaultCountry = DEFAULT_PHONE_COUNTRY }: Props) {
  const ids = describedBy(id, { hint: Boolean(hint), error: Boolean(error) });
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative shrink-0">
          <select
            name={countryName}
            aria-label="Country code"
            autoComplete="tel-country-code"
            defaultValue={defaultCountry}
            className={cn(controlClasses, "h-12 w-[7.5rem] appearance-none pr-9 pl-3 font-medium")}
          >
            {PHONE_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {flagEmoji(c.code)} {c.dial}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          />
        </div>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          className={cn(inputClasses, "min-w-0 flex-1")}
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
