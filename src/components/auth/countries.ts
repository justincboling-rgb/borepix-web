/**
 * Country codes offered by the phone field: ISO 3166-1 alpha-2 code, display name and ITU dial code.
 * The United States (the default) and Canada come first; the rest are alphabetical by name.
 */

export type PhoneCountry = { code: string; name: string; dial: string };

export const PHONE_COUNTRIES: readonly PhoneCountry[] = [
  { code: "US", name: "United States", dial: "+1" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "IE", name: "Ireland", dial: "+353" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "JM", name: "Jamaica", dial: "+1" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "PH", name: "Philippines", dial: "+63" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
];

export const DEFAULT_PHONE_COUNTRY = "US";

/** Regional-indicator flag for an ISO code, e.g. "US" → 🇺🇸. Pure arithmetic, identical on server and client. */
export function flagEmoji(code: string): string {
  return Array.from(code.toUpperCase(), (c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join("");
}

/** The country for an ISO code, falling back to the default when the value is unknown. */
export function phoneCountry(code: string | null | undefined): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.code === code) ?? PHONE_COUNTRIES[0];
}

/** E.164: the dial code followed by the national number's digits only, e.g. ("+1", "(201) 555-0123") → "+12015550123". */
export function toE164(dialCode: string, national: string): string {
  return `${dialCode}${national.replace(/\D/g, "")}`;
}
