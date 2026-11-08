import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { plans, type Plan } from "@/lib/site";
import { cn } from "@/lib/cn";

const wholeUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const centsUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="relative isolate py-24 sm:py-32">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]" />

      <div className="container-x">
        <SectionHeading
          id="pricing-heading"
          eyebrow="Pricing"
          align="center"
          title="Full access. Two ways to pay."
          lede="Both plans unlock every question bank, mock exam, flashcard deck and MRI Mastery lesson. Choose month-to-month flexibility or a full year at a lower price."
        />

        <div className="reveal mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2 md:items-stretch">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-2 text-center text-sm text-muted sm:flex-row sm:justify-center sm:gap-8">
          <p>
            Not ready?{" "}
            <Link
              href="/#try"
              className="font-medium text-blush underline decoration-blush/40 underline-offset-4 transition-colors duration-150 hover:decoration-blush"
            >
              Try sample questions free
            </Link>
            , no account needed.
          </p>
          <Link
            href="/legal/refunds"
            className="inline-flex min-h-11 items-center gap-1.5 font-medium text-fg underline decoration-white/25 underline-offset-4 transition-colors duration-150 hover:decoration-fg"
          >
            Refund policy
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const nameId = `plan-${plan.id}-name`;
  const highlight = Boolean(plan.highlight);
  const monthlyEquivalent = plan.cadence === "year" ? centsUsd.format(plan.price / 12) : null;

  return (
    <article
      aria-labelledby={nameId}
      className={cn(
        "panel relative flex flex-col rounded-2xl p-6 sm:p-8",
        highlight && "glow-pink border-pink/45 bg-linear-to-b from-pink/[0.07] to-transparent",
      )}
    >
      {plan.badge ? (
        <p className="absolute -top-3.5 left-6 inline-flex items-center rounded-full bg-pink-strong px-3 py-1 text-xs font-semibold tracking-wide text-white sm:left-8">
          {plan.badge}
        </p>
      ) : null}

      <h3 id={nameId} className="text-xl font-semibold text-fg">
        {plan.name}
      </h3>

      <p className="mt-5 flex items-baseline gap-2 text-fg">
        <span className="sr-only">
          {wholeUsd.format(plan.price)} per {plan.cadence}
        </span>
        <span aria-hidden className="num flex items-start text-5xl font-semibold tracking-tight sm:text-6xl">
          <span className="mr-0.5 mt-1.5 text-2xl font-medium text-muted sm:text-3xl">$</span>
          {plan.price}
        </span>
        <span aria-hidden className="text-base text-muted">
          / {plan.cadence}
        </span>
      </p>

      <p className="mt-3 text-sm text-muted">
        {plan.note}
        {monthlyEquivalent ? (
          <>
            {" "}
            Works out to <span className="num text-fg">{monthlyEquivalent}</span> a month.
          </>
        ) : null}
      </p>

      <ul className="mt-8 flex-1 space-y-3.5 border-t border-white/8 pt-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-3 text-[0.95rem] leading-relaxed text-fg">
            <span
              aria-hidden
              className={cn(
                "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                highlight ? "bg-pink/15 text-blush" : "bg-white/[0.06] text-silver",
              )}
            >
              <Check className="size-3.5" strokeWidth={2.25} />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <ButtonLink
        href={`/signup?plan=${plan.id}`}
        variant={highlight ? "primary" : "secondary"}
        size="lg"
        className="mt-8 w-full"
      >
        Choose {plan.name}
      </ButtonLink>

      <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted">{plan.renewal}</p>
    </article>
  );
}
