import { ArrowRight, Smartphone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/**
 * Hero headline, sub and the two calls to action. The staggered entrance is pure CSS (`.enter`), so the
 * copy is the first thing painted and never waits for JavaScript; under prefers-reduced-motion the global
 * rule collapses the animation. The copy is fixed by the client and must not be paraphrased.
 */
export function HeroCopy() {
  return (
    <div className="relative z-10 max-w-2xl">
      <p className="eyebrow enter">Advanced modalities · XR · IR · CT · MR</p>

      <h1
        id="hero-title"
        className="enter enter-1 mt-5 font-display text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.03em] text-fg sm:text-6xl lg:text-[4.25rem] xl:text-7xl"
      >
        Your pathway to <span className="text-gradient">mastery of modalities</span>
      </h1>

      <p className="enter enter-2 mt-6 max-w-xl text-lg leading-relaxed text-muted">
        The definitive intelligence and advanced modality ecosystem for Radiologic Technologists in X-Ray, IR, CT and
        mastering MRI. Stop guessing. Start leading.
      </p>

      <div className="enter enter-3 mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <ButtonLink href="/store" size="lg" className="w-full sm:w-auto">
          Access CE Library &amp; Store
          <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
        </ButtonLink>
        <ButtonLink href="/#app" size="lg" variant="secondary" className="w-full sm:w-auto">
          <Smartphone className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
          Download iOS / Android App
        </ButtonLink>
      </div>
    </div>
  );
}
