import { ArrowRight, Share2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { affiliateCta, affiliateProgram } from "@/lib/site";

/** Slim band inviting technologists into the affiliate program. */
export function AffiliateCta() {
  return (
    <section id="affiliate" aria-labelledby="affiliate-heading" className="border-t border-white/8 bg-ink-2 py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <div className="panel flex flex-col gap-8 rounded-2xl p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-pink/40 bg-pink/10 text-blush">
                <Share2 className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <p className="eyebrow">Affiliate program</p>
                <h2 id="affiliate-heading" className="mt-3 text-2xl font-semibold text-fg sm:text-3xl">
                  Share Borepix. Earn <span className="text-gradient">{affiliateProgram.commissionPercent}%</span>.
                </h2>
                <p className="mt-3 max-w-xl text-muted">
                  {affiliateProgram.commissionPercent}% on every purchase of {affiliateProgram.eligibleProducts} made
                  through your link. {affiliateProgram.payoutCadence}.
                </p>
              </div>
            </div>
            <ButtonLink href={affiliateCta.href} size="lg" variant="secondary" className="shrink-0">
              {affiliateCta.label}
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
