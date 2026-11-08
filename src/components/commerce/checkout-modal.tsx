"use client";

import Link from "next/link";
import { CreditCard, LoaderCircle, Lock, ShoppingBag } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { flushSync } from "react-dom";
import { InputField, SelectField } from "@/components/account/field";
import { CartTotals, PromoControl } from "@/components/commerce/cart-drawer";
import { OrderReceipt } from "@/components/commerce/order-receipt";
import { ProductArt } from "@/components/store/product-art";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { CardBrand, Order } from "@/data/types";
import {
  CARD_BRAND_LABEL,
  cvcValid,
  detectCardBrand,
  digitsOnly,
  expiryValid,
  formatCardNumber,
  formatExpiry,
  luhnValid,
} from "@/lib/keys";
import { formatPrice, type Totals } from "@/lib/pricing";
import { commerceEnabled } from "@/lib/site";
import { totalsFor, useCart, useCheckoutLines, usePricingClock, type ResolvedLine } from "@/lib/store/cart";
import { useOrders } from "@/lib/store/orders";

/** How long the simulated payment takes to clear. */
const PROCESSING_MS = 1400;

type Phase = "form" | "processing" | "receipt";

type PaymentDetails = { email: string; name: string; payment: { brand: CardBrand; last4: string } };

/**
 * Simulated Stripe checkout. Order summary and promo on the left, the card form on the right (stacked on
 * phones). A valid submission shows a processing state, writes the order to the orders store and replaces
 * the form with the receipt. The dialog cannot be dismissed while the payment is processing, and closing
 * it from the receipt completes the checkout (purchased lines are cleared). During the Alpha/Beta preview
 * nothing renders: the cart store never opens the checkout, and no payment UI reaches the page.
 */
export function CheckoutModal() {
  if (!commerceEnabled) return null;
  return <CheckoutModalLive />;
}

function CheckoutModalLive() {
  const open = useCart((s) => s.checkoutOpen);
  const closeCheckout = useCart((s) => s.closeCheckout);
  const completeCheckout = useCart((s) => s.completeCheckout);
  const promoCode = useCart((s) => s.promoCode);
  const placeOrder = useOrders((s) => s.placeOrder);
  const lines = useCheckoutLines();
  // Priced only while open: totalsFor reads the clock for the promo window, and the prerender must not.
  const now = usePricingClock();
  const totals = open ? totalsFor(lines, promoCode, now) : null;

  const [phase, setPhase] = useState<Phase>("form");
  const [order, setOrder] = useState<Order | null>(null);
  const timer = useRef<number | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Every opening starts a fresh checkout (state adjusted during render, not in an effect). The form's own
  // field state resets by itself because the dialog unmounts its children while closed.
  const [seenOpen, setSeenOpen] = useState(open);
  if (open !== seenOpen) {
    setSeenOpen(open);
    if (open) {
      setPhase("form");
      setOrder(null);
    }
  }

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  function onClose() {
    if (phase === "processing") return;
    if (phase === "receipt") completeCheckout();
    else closeCheckout();
  }

  function pay(details: PaymentDetails) {
    if (totals === null) return;
    const priced = { lines, totals };
    setPhase("processing");
    timer.current = window.setTimeout(() => {
      timer.current = null;
      const placed = placeOrder({ ...priced, ...details });
      setOrder(placed);
      setPhase("receipt");
    }, PROCESSING_MS);
  }

  const receipt = phase === "receipt" && order !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={receipt ? "Order confirmed" : "Checkout"}
      size={receipt ? "lg" : "xl"}
      dismissible={phase !== "processing"}
      initialFocusRef={emailRef}
    >
      {receipt ? (
        <OrderReceipt order={order} onDone={completeCheckout} />
      ) : totals === null || lines.length === 0 ? (
        <EmptyCheckout onBrowse={closeCheckout} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <OrderSummary lines={lines} totals={totals} />
          <CheckoutForm emailRef={emailRef} total={totals.total} processing={phase === "processing"} onPay={pay} />
        </div>
      )}
    </Dialog>
  );
}

/* ───────────────────────── Empty state ───────────────────────── */

function EmptyCheckout({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full border border-line bg-white/[0.03] text-silver">
        <ShoppingBag className="size-7" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-6 font-display text-xl font-semibold text-fg">Nothing to check out.</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
        Your cart is empty. Add a test key, suite or pass and come back.
      </p>
      <ButtonLink href="/store" onClick={onBrowse} className="mt-8">
        Browse the store
      </ButtonLink>
    </div>
  );
}

/* ───────────────────────── Order summary ───────────────────────── */

function OrderSummary({ lines, totals }: { lines: ResolvedLine[]; totals: Totals }) {
  const headingId = useId();
  return (
    <aside
      aria-labelledby={headingId}
      className="min-w-0 border-b border-line bg-ink-2 px-5 py-5 sm:px-6 sm:py-6 md:border-r md:border-b-0"
    >
      <h3 id={headingId} className="eyebrow">
        Order summary
      </h3>
      <ul className="mt-2 divide-y divide-white/8">
        {lines.map(({ product, qty }) => (
          <li key={product.id} className="flex items-center gap-3 py-3.5">
            <div aria-hidden className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-line bg-ink">
              <ProductArt variant={product.art} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium leading-snug text-fg">{product.name}</p>
              <p className="num mt-0.5 text-xs text-muted">
                {qty} × {formatPrice(product.price)}
              </p>
            </div>
            <p className="num shrink-0 text-sm font-medium text-fg">{formatPrice(product.price * qty)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-1 border-t border-white/8 pt-5">
        <PromoControl totals={totals} />
      </div>
      <div className="mt-5 border-t border-white/8 pt-4">
        <CartTotals totals={totals} emphasis="md" />
      </div>
    </aside>
  );
}

/* ───────────────────────── Card form ───────────────────────── */

const COUNTRIES = [
  { code: "US", name: "United States", postal: "ZIP code" },
  { code: "CA", name: "Canada", postal: "Postal code" },
  { code: "GB", name: "United Kingdom", postal: "Postcode" },
  { code: "AU", name: "Australia", postal: "Postcode" },
  { code: "IE", name: "Ireland", postal: "Eircode" },
  { code: "NZ", name: "New Zealand", postal: "Postcode" },
] as const;

type CountryCode = (typeof COUNTRIES)[number]["code"];

function isCountryCode(value: string): value is CountryCode {
  return COUNTRIES.some((c) => c.code === value);
}

type Values = {
  email: string;
  name: string;
  card: string;
  expiry: string;
  cvc: string;
  country: CountryCode;
  postal: string;
};

type Field = keyof Values;

type Errors = Partial<Record<Field, string>>;

/** Tab order of the fields; the first invalid one in this order receives focus on a failed submit. */
const FIELD_ORDER: Field[] = ["email", "name", "card", "expiry", "cvc", "country", "postal"];

const INITIAL_VALUES: Values = { email: "", name: "", card: "", expiry: "", cvc: "", country: "US", postal: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const US_ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

function validateField(field: Field, values: Values, now: Date): string | undefined {
  switch (field) {
    case "email": {
      const email = values.email.trim();
      if (!email) return "Enter the email address your keys should go to.";
      return EMAIL_PATTERN.test(email) ? undefined : "Enter a valid email address.";
    }
    case "name":
      return values.name.trim().length >= 2 ? undefined : "Enter the name as it appears on the card.";
    case "card": {
      const digits = digitsOnly(values.card);
      if (!digits) return "Enter your card number.";
      const expected = detectCardBrand(digits) === "amex" ? 15 : 16;
      if (digits.length < expected) return "Enter the full card number.";
      return luhnValid(digits) ? undefined : "That card number is not valid. Check the digits and try again.";
    }
    case "expiry": {
      const digits = digitsOnly(values.expiry);
      if (digits.length !== 4) return "Enter the expiry date as MM/YY.";
      const month = Number(digits.slice(0, 2));
      if (month < 1 || month > 12) return "Enter a month from 01 to 12.";
      if (2000 + Number(digits.slice(2)) > now.getFullYear() + 20) return "Enter a valid expiry year.";
      return expiryValid(values.expiry, now) ? undefined : "This card has expired. Use a card that is still valid.";
    }
    case "cvc": {
      const brand = detectCardBrand(values.card);
      if (cvcValid(values.cvc, brand)) return undefined;
      return brand === "amex"
        ? "Enter the 4-digit code on the front of the card."
        : "Enter the 3-digit code on the back of the card.";
    }
    case "country":
      return undefined;
    case "postal": {
      if (values.country !== "US") return undefined;
      return US_ZIP_PATTERN.test(values.postal.trim()) ? undefined : "Enter a 5-digit ZIP code.";
    }
  }
}

/** True once every required field has something in it. Format checks happen on blur and submit. */
function isComplete(values: Values): boolean {
  const filled = (v: string) => v.trim().length > 0;
  return (
    filled(values.email) &&
    filled(values.name) &&
    filled(values.card) &&
    filled(values.expiry) &&
    filled(values.cvc) &&
    (values.country !== "US" || filled(values.postal))
  );
}

function omit(errors: Errors, field: Field): Errors {
  if (!(field in errors)) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

type FormProps = {
  /** The email input, so the dialog can focus it on open. */
  emailRef: RefObject<HTMLInputElement | null>;
  total: number;
  processing: boolean;
  onPay: (details: PaymentDetails) => void;
};

function CheckoutForm({ emailRef, total, processing, onPay }: FormProps) {
  const uid = useId();
  const fieldId = (field: Field) => `${uid}-${field}`;
  const headingId = `${uid}-heading`;
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const refs = useRef<Partial<Record<Field, HTMLInputElement | HTMLSelectElement | null>>>({});

  const brand = detectCardBrand(values.card);
  const country = COUNTRIES.find((c) => c.code === values.country) ?? COUNTRIES[0];
  const hasErrors = FIELD_ORDER.some((f) => errors[f]);
  const canSubmit = !processing && !hasErrors && isComplete(values);

  function set<K extends Field>(field: K, value: Values[K]) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => omit(e, field));
  }

  /** Validates a field the user has typed in. Empty fields wait for submit so tabbing through is quiet. */
  function onBlur(field: Field) {
    if (!values[field].trim()) return;
    const message = validateField(field, values, new Date());
    setErrors((e) => (message ? { ...e, [field]: message } : omit(e, field)));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (processing) return;
    const now = new Date();
    const next: Errors = {};
    for (const field of FIELD_ORDER) {
      const message = validateField(field, values, now);
      if (message) next[field] = message;
    }
    const first = FIELD_ORDER.find((field) => next[field]);
    if (first) {
      // Commit the errors before moving focus so the field's aria-describedby target exists when it is read.
      flushSync(() => setErrors(next));
      refs.current[first]?.focus();
      return;
    }
    const digits = digitsOnly(values.card);
    onPay({
      email: values.email.trim(),
      name: values.name.trim(),
      payment: { brand: detectCardBrand(digits), last4: digits.slice(-4) },
    });
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-labelledby={headingId}
      aria-busy={processing || undefined}
      className="min-w-0 px-5 py-5 sm:px-6 sm:py-6"
    >
      <h3 id={headingId} className="eyebrow">
        <CreditCard className="size-3.5" strokeWidth={1.75} aria-hidden />
        Payment details
      </h3>

      <fieldset disabled={processing} className="mt-5 min-w-0 space-y-5">
        <legend className="sr-only">Card and billing details</legend>

        <InputField
          id={fieldId("email")}
          ref={(el) => {
            refs.current.email = el;
            emailRef.current = el;
          }}
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={254}
          hint="Your license keys are sent here."
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => onBlur("email")}
          error={errors.email}
        />

        <InputField
          id={fieldId("name")}
          ref={(el) => {
            refs.current.name = el;
          }}
          label="Name on card"
          type="text"
          autoComplete="cc-name"
          maxLength={80}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          onBlur={() => onBlur("name")}
          error={errors.name}
        />

        <InputField
          id={fieldId("card")}
          ref={(el) => {
            refs.current.card = el;
          }}
          label="Card number"
          labelEnd={
            brand !== "unknown" ? (
              <span className="inline-flex items-center rounded-md border border-white/12 bg-white/[0.05] px-2 py-0.5 text-xs font-medium text-silver">
                {CARD_BRAND_LABEL[brand]}
              </span>
            ) : null
          }
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 1234 1234 1234"
          maxLength={19}
          value={values.card}
          onChange={(e) => set("card", formatCardNumber(e.target.value))}
          onBlur={() => onBlur("card")}
          error={errors.card}
          inputClassName="num"
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            id={fieldId("expiry")}
            ref={(el) => {
              refs.current.expiry = el;
            }}
            label="Expiry"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            maxLength={5}
            value={values.expiry}
            onChange={(e) => set("expiry", formatExpiry(e.target.value))}
            onBlur={() => onBlur("expiry")}
            error={errors.expiry}
            inputClassName="num"
          />
          <InputField
            id={fieldId("cvc")}
            ref={(el) => {
              refs.current.cvc = el;
            }}
            label="CVC"
            type="text"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder={brand === "amex" ? "1234" : "123"}
            maxLength={4}
            value={values.cvc}
            onChange={(e) => set("cvc", digitsOnly(e.target.value).slice(0, 4))}
            onBlur={() => onBlur("cvc")}
            error={errors.cvc}
            inputClassName="num"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id={fieldId("country")}
            ref={(el) => {
              refs.current.country = el;
            }}
            label="Country"
            autoComplete="country"
            value={values.country}
            onChange={(e) => {
              const next = e.target.value;
              if (!isCountryCode(next)) return;
              set("country", next);
              if (errors.postal) setErrors((prev) => omit(prev, "postal"));
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <InputField
            id={fieldId("postal")}
            ref={(el) => {
              refs.current.postal = el;
            }}
            label={country.postal}
            optional={country.code !== "US"}
            type="text"
            inputMode={country.code === "US" ? "numeric" : "text"}
            autoComplete="postal-code"
            autoCapitalize="characters"
            maxLength={10}
            value={values.postal}
            onChange={(e) => set("postal", e.target.value.toUpperCase())}
            onBlur={() => onBlur("postal")}
            error={errors.postal}
            inputClassName="num"
          />
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="mt-7 w-full" disabled={!canSubmit}>
        {processing ? (
          <>
            <LoaderCircle className="size-4 animate-spin" strokeWidth={2} aria-hidden />
            Processing payment
          </>
        ) : (
          `Pay ${formatPrice(total)}`
        )}
      </Button>
      <p className="sr-only" role="status" aria-live="polite">
        {processing ? "Processing your payment. This takes a moment." : ""}
      </p>

      <p className="mt-5 flex items-center justify-center gap-2 font-mono text-xs text-muted">
        <Lock className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        Payments are encrypted and processed by Stripe
      </p>
      <p className="mt-2 flex items-center justify-center gap-4 font-mono text-xs text-muted">
        <Link href="/legal/terms" className="transition-colors duration-150 hover:text-fg">
          Terms
        </Link>
        <Link href="/legal/privacy" className="transition-colors duration-150 hover:text-fg">
          Privacy
        </Link>
        <Link href="/legal/refunds" className="transition-colors duration-150 hover:text-fg">
          Refunds
        </Link>
      </p>
    </form>
  );
}
