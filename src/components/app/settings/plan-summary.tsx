import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import type { Profile } from "@/lib/store/progress";
import { plans } from "@/lib/site";

/** Read-only plan display. Billing is not connected, so this never implies a charge or a renewal. */
export function PlanSummary({ plan }: { plan: Profile["plan"] | undefined }) {
  const selected = plan === "monthly" || plan === "annual" ? plans.find((p) => p.id === plan) : undefined;

  return (
    <section aria-labelledby="plan-heading" className="panel rounded-2xl p-5 sm:p-7">
      <h2 id="plan-heading" className="text-xl font-semibold text-fg">
        Plan
      </h2>
      <div className="mt-4 flex items-start gap-4">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-silver">
          <CreditCard aria-hidden strokeWidth={1.75} className="size-5" />
        </span>
        <div className="min-w-0">
          {selected ? (
            <>
              <p className="font-semibold text-fg">
                {selected.name} plan{" "}
                <span className="num font-normal text-muted">
                  · ${selected.price}/{selected.cadence}
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Selected when you signed up. Billing is not connected in this preview build, so you have not been
                charged and nothing will renew.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-fg">Preview access</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                No paid plan is selected. Payments are not connected in this preview build, so there is nothing to
                manage here yet.
              </p>
            </>
          )}
          <Link
            href="/#pricing"
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-blush underline-offset-4 hover:underline"
          >
            Compare plans
            <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
