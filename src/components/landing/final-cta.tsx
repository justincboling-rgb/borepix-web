import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/** Faint concentric rings that read as the scanner bore seen head-on. Sizes in rem, largest first. */
const BORE_RINGS = [72, 56, 42, 30] as const;

export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative isolate overflow-hidden border-t border-white/8 bg-ink"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-radial-[ellipse_70%_60%_at_50%_100%] from-pink/30 via-rose/10 to-transparent" />
        <div className="haze-top absolute inset-0" />
        <div className="bg-grid absolute inset-0 opacity-50" />
        {BORE_RINGS.map((size) => (
          <div
            key={size}
            className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
            style={{ width: `${size}rem`, height: `${size}rem` }}
          />
        ))}
        {/* Innermost ring carries the neon accent */}
        <div className="absolute top-full left-1/2 size-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink/25" />
      </div>

      <div className="container-x reveal py-24 text-center sm:py-32 lg:py-40">
        <p className="eyebrow justify-center">Ready when you are</p>
        <h2
          id="final-cta-heading"
          className="mx-auto mt-5 max-w-4xl text-4xl font-semibold text-fg sm:text-5xl lg:text-6xl"
        >
          Stop guessing. <span className="text-gradient">Start leading.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Free workbooks and self-quizzes for MRI, Interventional Radiology and CT. Official test keys when you are
          ready to record the credit.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/store" size="lg">
            Access CE Library &amp; Store
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </ButtonLink>
          <ButtonLink href="/anatomy" variant="secondary" size="lg">
            Open the workbooks
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
