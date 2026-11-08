import type { CardBrand } from "@/data/types";

/** Unambiguous alphabet: no 0/O, 1/I/L. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomChars(n: number): string {
  const out: string[] = [];
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(n);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < n; i++) out.push(ALPHABET[bytes[i] % ALPHABET.length]);
  } else {
    for (let i = 0; i < n; i++) out.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
  }
  return out.join("");
}

/** A license key such as BPX-MRI-7K2Q-M9XD-4RTV. */
export function generateLicenseKey(prefix: string): string {
  return `BPX-${prefix.toUpperCase()}-${randomChars(4)}-${randomChars(4)}-${randomChars(4)}`;
}

const KEY_PATTERN = /^BPX-[A-Z]{2,4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

/**
 * Uppercases and normalises separators so a pasted key validates. A key typed with no separators at all
 * (BPXMRI7K2QM9XD4RTV) is re-chunked: the three 4-character groups are fixed, so whatever sits between
 * "BPX" and them is the prefix.
 */
export function normalizeLicenseKey(raw: string): string {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]+/g, "");
  const m = /^BPX([A-Z]{2,4})([A-Z2-9]{4})([A-Z2-9]{4})([A-Z2-9]{4})$/.exec(compact);
  if (m) return `BPX-${m[1]}-${m[2]}-${m[3]}-${m[4]}`;
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isLicenseKeyFormat(key: string): boolean {
  return KEY_PATTERN.test(key);
}

/** Order number such as BPX-20261108-4K2Q. */
export function generateOrderNumber(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `BPX-${y}${m}${d}-${randomChars(4)}`;
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${randomChars(8).toLowerCase()}`;
}

/* ───────────────────────── Card helpers (simulated checkout) ───────────────────────── */

export function digitsOnly(s: string): string {
  return s.replace(/\D+/g, "");
}

export function detectCardBrand(number: string): CardBrand {
  const n = digitsOnly(number);
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(6011|65|64[4-9])/.test(n)) return "discover";
  return "unknown";
}

export const CARD_BRAND_LABEL: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  unknown: "Card",
};

/** Luhn checksum. */
export function luhnValid(number: string): boolean {
  const n = digitsOnly(number);
  if (n.length < 12 || n.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Groups digits for display: 4-4-4-4 (or 4-6-5 for American Express). */
export function formatCardNumber(raw: string): string {
  const n = digitsOnly(raw).slice(0, detectCardBrand(raw) === "amex" ? 15 : 16);
  if (detectCardBrand(n) === "amex") {
    return [n.slice(0, 4), n.slice(4, 10), n.slice(10, 15)].filter(Boolean).join(" ");
  }
  return n.match(/.{1,4}/g)?.join(" ") ?? "";
}

/** "MM/YY" from any typed digits. */
export function formatExpiry(raw: string): string {
  const n = digitsOnly(raw).slice(0, 4);
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)}/${n.slice(2)}`;
}

/** True when MM/YY is a real month in the current month or later. */
export function expiryValid(mmyy: string, now: Date): boolean {
  const n = digitsOnly(mmyy);
  if (n.length !== 4) return false;
  const month = Number(n.slice(0, 2));
  const year = 2000 + Number(n.slice(2));
  if (month < 1 || month > 12) return false;
  const nowY = now.getFullYear();
  const nowM = now.getMonth() + 1;
  if (year < nowY) return false;
  if (year === nowY && month < nowM) return false;
  return year <= nowY + 20;
}

export function cvcValid(cvc: string, brand: CardBrand): boolean {
  const n = digitsOnly(cvc);
  return brand === "amex" ? n.length === 4 : n.length === 3;
}
