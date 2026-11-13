"use client";

import { useId, useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, Hourglass, Link2, LogOut, Wallet } from "lucide-react";
import { LaunchBadge } from "@/components/commerce/launch-notice";
import { CopyButton } from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYOUT_METHOD_LABEL, type PayoutMethod } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/pricing";
import { affiliateJoinSchema, fieldErrors } from "@/lib/schemas";
import { affiliateProgram, commerceEnabled, release, site } from "@/lib/site";
import { affiliateStats, referralLink, useAffiliates, useCurrentAffiliate } from "@/lib/store/affiliates";
import { useHydrated } from "@/lib/store/cart";
import { useOrders } from "@/lib/store/orders";

const inputClass =
  "w-full min-h-11 rounded-xl border border-line bg-ink px-3.5 text-sm text-fg placeholder:text-subtle transition-colors duration-150 hover:border-white/20 focus:border-pink focus:outline-none aria-[invalid=true]:border-danger";
const labelClass = "block text-sm font-medium text-fg";
const hintClass = "mt-1.5 text-xs text-muted";

const PAYOUT_METHODS = Object.keys(PAYOUT_METHOD_LABEL) as PayoutMethod[];

type Field = "firstName" | "lastName" | "email" | "payoutHandle";
type Errors = Partial<Record<Field, string>>;

/** Per-field messages from the shared join schema, keyed in form order so the first key is the one to focus. */
function validate(values: Record<Field, string>, method: PayoutMethod): Errors {
  return fieldErrors<Field>(affiliateJoinSchema.safeParse({ ...values, payoutMethod: method }));
}

/** Inline field error: icon + text, announced as an alert, linked to its field through aria-describedby. */
function FieldAlert({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs text-danger">
      <CircleAlert className="mt-px size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span>{message}</span>
    </p>
  );
}

/** The affiliate sign-up form, or the partner portal once this device has joined. */
export function AffiliateProgram() {
  const hydrated = useHydrated();
  const affiliate = useCurrentAffiliate();
  if (!hydrated) {
    return (
      <div role="status" aria-busy="true" aria-label="Loading affiliate program" className="panel min-h-[28rem] rounded-2xl" />
    );
  }
  return affiliate ? <Portal /> : <JoinForm />;
}

function JoinForm() {
  const uid = useId();
  const join = useAffiliates((s) => s.join);
  const signIn = useAffiliates((s) => s.signIn);
  const [method, setMethod] = useState<PayoutMethod>("stripe");
  const [values, setValues] = useState<Record<Field, string>>({ firstName: "", lastName: "", email: "", payoutHandle: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [returning, setReturning] = useState(false);
  const [returnEmail, setReturnEmail] = useState("");
  const [returnError, setReturnError] = useState<string | null>(null);

  const id = (f: string) => `${uid}-${f}`;
  const set = (f: Field) => (e: { currentTarget: { value: string } }) => {
    const value = e.currentTarget.value;
    setValues((v) => ({ ...v, [f]: value }));
    if (errors[f]) setErrors((er) => ({ ...er, [f]: undefined }));
  };

  function chooseMethod(next: PayoutMethod) {
    setMethod(next);
    if (errors.payoutHandle) setErrors((er) => ({ ...er, payoutHandle: undefined }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate(values, method);
    setErrors(next);
    const first = (Object.keys(next) as Field[])[0];
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }
    join({ ...values, payoutMethod: method });
  }

  function onReturn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signIn(returnEmail)) setReturnError("No partner with that email has joined on this device.");
  }

  return (
    <div className="panel rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Join the program</p>
          <h2 className="mt-3 text-2xl font-semibold text-fg">Get your referral link in a minute.</h2>
          {commerceEnabled ? null : (
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">
              Partners can pre-register now. Commission tracking begins at the public launch in {release.launch}.
            </p>
          )}
        </div>
        <Badge tone="neon">{affiliateProgram.commissionPercent}% commission</Badge>
      </div>

      {!returning ? (
        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={id("firstName")} className={labelClass}>
                First name
              </label>
              <input
                id={id("firstName")}
                name="given-name"
                autoComplete="given-name"
                value={values.firstName}
                onChange={set("firstName")}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={errors.firstName ? id("firstName-error") : undefined}
                className={cn(inputClass, "mt-2")}
              />
              {errors.firstName ? <FieldAlert id={id("firstName-error")} message={errors.firstName} /> : null}
            </div>
            <div>
              <label htmlFor={id("lastName")} className={labelClass}>
                Last name
              </label>
              <input
                id={id("lastName")}
                name="family-name"
                autoComplete="family-name"
                value={values.lastName}
                onChange={set("lastName")}
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={errors.lastName ? id("lastName-error") : undefined}
                className={cn(inputClass, "mt-2")}
              />
              {errors.lastName ? <FieldAlert id={id("lastName-error")} message={errors.lastName} /> : null}
            </div>
          </div>

          <div>
            <label htmlFor={id("email")} className={labelClass}>
              Email address
            </label>
            <input
              id={id("email")}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={set("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? id("email-error") : id("email-hint")}
              className={cn(inputClass, "mt-2")}
            />
            {errors.email ? (
              <FieldAlert id={id("email-error")} message={errors.email} />
            ) : (
              <p id={id("email-hint")} className={hintClass}>
                Payout statements and program updates go here.
              </p>
            )}
          </div>

          <fieldset>
            <legend className={labelClass}>Payout method</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PAYOUT_METHODS.map((m) => {
                const checked = method === m;
                return (
                  <label
                    key={m}
                    className={cn(
                      "flex min-h-11 cursor-pointer select-none items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors duration-150",
                      "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush",
                      checked ? "border-pink/60 bg-pink/10 text-fg" : "border-line text-muted hover:border-white/20 hover:text-fg",
                    )}
                  >
                    <input
                      type="radio"
                      name={id("payout-method")}
                      value={m}
                      checked={checked}
                      onChange={() => chooseMethod(m)}
                      className="sr-only"
                    />
                    {PAYOUT_METHOD_LABEL[m]}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor={id("payoutHandle")} className={labelClass}>
              {method === "stripe" ? "Stripe Connect account id" : "PayPal email"}
            </label>
            <input
              id={id("payoutHandle")}
              name={method === "stripe" ? "stripe-account" : "paypal-email"}
              type={method === "stripe" ? "text" : "email"}
              autoComplete={method === "stripe" ? "off" : "email"}
              spellCheck={false}
              value={values.payoutHandle}
              onChange={set("payoutHandle")}
              aria-invalid={Boolean(errors.payoutHandle)}
              aria-describedby={errors.payoutHandle ? id("payoutHandle-error") : id("payoutHandle-hint")}
              className={cn(inputClass, "mt-2 font-mono")}
            />
            {errors.payoutHandle ? (
              <FieldAlert id={id("payoutHandle-error")} message={errors.payoutHandle} />
            ) : (
              <p id={id("payoutHandle-hint")} className={hintClass}>
                {method === "stripe"
                  ? "Found in your Stripe dashboard under Settings. Looks like acct_ followed by letters and digits."
                  : "Payouts are sent to this PayPal account at the end of each month."}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" size="lg">
              Generate my referral link
            </Button>
            <button
              type="button"
              onClick={() => setReturning(true)}
              className="inline-flex min-h-11 items-center text-sm font-medium text-blush underline decoration-blush/40 underline-offset-4 hover:decoration-blush"
            >
              Already a partner? Open your portal
            </button>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            By joining you agree to the program terms above and to the Terms of Service. Self-referrals are not paid.
          </p>
        </form>
      ) : (
        <form onSubmit={onReturn} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor={id("return-email")} className={labelClass}>
              Partner email
            </label>
            <input
              id={id("return-email")}
              type="email"
              autoComplete="email"
              inputMode="email"
              value={returnEmail}
              onChange={(e) => {
                setReturnEmail(e.currentTarget.value);
                setReturnError(null);
              }}
              aria-invalid={Boolean(returnError)}
              aria-describedby={returnError ? id("return-error") : undefined}
              className={cn(inputClass, "mt-2")}
            />
            {returnError ? <FieldAlert id={id("return-error")} message={returnError} /> : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" size="lg">
              Open portal
            </Button>
            <button
              type="button"
              onClick={() => setReturning(false)}
              className="inline-flex min-h-11 items-center text-sm font-medium text-blush underline decoration-blush/40 underline-offset-4 hover:decoration-blush"
            >
              New partner? Join instead
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Portal() {
  const affiliate = useCurrentAffiliate();
  const signOut = useAffiliates((s) => s.signOut);
  const payouts = useAffiliates((s) => s.payouts);
  const orders = useOrders((s) => s.orders);
  if (!affiliate) return null;

  const stats = affiliateStats(affiliate, orders, payouts);
  const link = referralLink(site.url, affiliate.code);
  const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

  const tiles = [
    { label: "Attributed orders", value: String(stats.attributed.length) },
    { label: "Commission earned", value: formatPrice(stats.earned) },
    { label: "Paid out", value: formatPrice(stats.paid) },
    { label: "Balance due", value: formatPrice(stats.due) },
  ];

  return (
    <div className="space-y-6">
      <div className="panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-success/40 bg-success/10 text-success">
              <CircleCheck className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="eyebrow">Partner portal</p>
              <h2 className="mt-2 text-2xl font-semibold text-fg">
                Welcome, {affiliate.firstName}.
              </h2>
              <p className="mt-1 text-sm text-muted">
                Partner since {dateFmt.format(affiliate.createdAt)} · paid by {PAYOUT_METHOD_LABEL[affiliate.payoutMethod]}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
            Switch partner
          </Button>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-ink p-4">
            <dt className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted uppercase">Referral code</dt>
            <dd className="mt-2 flex items-center justify-between gap-3">
              <span className="num text-xl font-semibold text-blush">{affiliate.code}</span>
              <CopyButton value={affiliate.code} label="Copy referral code" />
            </dd>
          </div>
          <div className="rounded-xl border border-line bg-ink p-4">
            <dt className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted uppercase">Referral link</dt>
            <dd className="mt-2 flex items-center justify-between gap-3">
              <span className="num min-w-0 truncate text-sm text-fg">
                <Link2 className="mr-1.5 inline size-4 text-silver" strokeWidth={1.75} aria-hidden />
                {link}
              </span>
              <CopyButton value={link} label="Copy referral link" />
            </dd>
          </div>
        </dl>
      </div>

      {commerceEnabled ? (
        <>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="panel rounded-2xl p-5">
                <dt className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted uppercase">{t.label}</dt>
                <dd className="num mt-2 text-2xl font-semibold text-fg">{t.value}</dd>
              </div>
            ))}
          </dl>

          <div className="panel rounded-2xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-fg">Attributed orders</h3>
              <p className="flex items-center gap-2 text-xs text-muted">
                <Wallet className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
                {affiliateProgram.payoutCadence} once your balance reaches {formatPrice(affiliateProgram.minimumPayout)}.
              </p>
            </div>
            {stats.attributed.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
                No orders yet. Share your link; every purchase that starts from it within {affiliateProgram.cookieDays} days
                is credited to you.
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted uppercase">
                    <tr className="border-b border-white/8">
                      <th scope="col" className="py-3 pr-4 font-medium">Order</th>
                      <th scope="col" className="py-3 pr-4 font-medium">Date</th>
                      <th scope="col" className="py-3 pr-4 font-medium">Order total</th>
                      <th scope="col" className="py-3 text-right font-medium">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {stats.attributed.map((o) => (
                      <tr key={o.id}>
                        <td className="num py-3 pr-4 text-fg">{o.number}</td>
                        <td className="py-3 pr-4 text-muted">{dateFmt.format(o.createdAt)}</td>
                        <td className="num py-3 pr-4 text-fg">{formatPrice(o.total)}</td>
                        <td className="num py-3 text-right text-success">
                          {formatPrice((o.total * affiliateProgram.commissionPercent) / 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="panel rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-pink/30 bg-pink/10 text-blush">
              <Hourglass className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <LaunchBadge full />
              <h3 className="mt-3 text-lg font-semibold text-fg">Commission tracking begins at launch.</h3>
              <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted">
                Your referral code and link are ready to share. Commission tracking begins at the public launch in{" "}
                {release.launch}, when the store opens; attributed orders, earnings and payouts appear here from then on.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
