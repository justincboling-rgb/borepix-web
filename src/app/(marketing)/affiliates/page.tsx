import type { Metadata } from "next";
import { BadgeDollarSign, Link2, Share2, type LucideIcon } from "lucide-react";
import { AffiliateProgram } from "@/components/affiliates/affiliate-program";
import { LaunchBadge } from "@/components/commerce/launch-notice";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/pricing";
import { affiliateProgram, commerceEnabled, release, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description: `Earn ${affiliateProgram.commissionPercent}% commission sharing Borepix CE test keys, Complete Suites and CE Library passes with Radiologic Technologists. ${affiliateProgram.payoutCadence}.`,
  alternates: { canonical: "/affiliates" },
};

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Link2,
    title: "Get your link",
    body: "Join in a minute. You get a referral code and a link that works on every page of the site.",
  },
  {
    icon: Share2,
    title: "Share it with the suite",
    body: "Post it in your department group, your program's cohort chat or your profile. Anyone who buys within 30 days of clicking is yours.",
  },
  {
    icon: BadgeDollarSign,
    title: "Get paid monthly",
    body: commerceEnabled
      ? `${affiliateProgram.commissionPercent}% of every attributed order, paid by Stripe or PayPal once your balance reaches ${formatPrice(affiliateProgram.minimumPayout)}.`
      : `${affiliateProgram.commissionPercent}% of every attributed order, paid by Stripe or PayPal once your balance clears the program's minimum threshold.`,
  },
];

/** Plain-language terms. No dollar amount is printed here; the threshold is stated, not priced. */
const terms = [
  `${affiliateProgram.commissionPercent}% commission on the order total of ${affiliateProgram.eligibleProducts}. Mobile app licenses are excluded.`,
  `A click on your link credits you for ${affiliateProgram.cookieDays} days. If a buyer follows another partner's link later, the most recent link wins.`,
  "Payouts run monthly once your balance clears the program's minimum threshold, by Stripe Connect or PayPal.",
  "Refunded orders are deducted from the next payout.",
  "Self-referrals, paid search on the Borepix name, and coupon-site listings are not paid.",
  `Questions go to ${site.supportEmail}.`,
];

export default function AffiliatesPage() {
  return (
    <main id="main" className="relative isolate">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] opacity-60" />

      <section className="container-x pt-16 pb-12 sm:pt-20">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="eyebrow">Affiliate partner program</p>
          {commerceEnabled ? null : <LaunchBadge full />}
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold text-fg sm:text-5xl lg:text-6xl">
          Earn <span className="text-gradient">{affiliateProgram.commissionPercent}%</span> sharing Borepix with your
          department.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Technologists trust technologists. Send your colleagues to the workbooks they can read for free, and earn a
          commission on every test key, suite or pass they buy.
          {commerceEnabled
            ? ""
            : ` Partners can pre-register today; commission tracking begins at the public launch in ${release.launch}.`}
        </p>
      </section>

      <section aria-labelledby="how-heading" className="container-x pb-16">
        <h2 id="how-heading" className="sr-only">
          How the program works
        </h2>
        <ol className="grid gap-5 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="panel rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-xl border border-pink/40 bg-pink/10 text-blush">
                  <s.icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="num text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-fg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x grid gap-8 pb-24 sm:pb-32 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-fg">Program terms</h2>
            <Badge tone="neutral">Plain language</Badge>
          </div>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted">
            {terms.map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-pink" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <AffiliateProgram />
      </section>
    </main>
  );
}
