import { Check } from "lucide-react";
import { DOME_PARTS } from "@/components/landing/dome/parts";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { larmorMHz } from "@/lib/mri-physics";

/**
 * Hardware blueprint: the five layers of the bore as numbered specification cards. Reads the same
 * data the 3D dome uses, so the two never disagree.
 */
export function DomeBlueprint() {
  return (
    <section id="dome" aria-labelledby="dome-heading" className="relative border-t border-white/8 bg-ink py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            id="dome-heading"
            eyebrow="Hardware blueprint"
            title="Inside the MRI dome."
            lede={`Outer cover to patient couch, the engineering behind every sequence you run. The static field at 3.0 T precesses hydrogen at ${larmorMHz(3).toFixed(1)} MHz; everything else in the bore exists to shape, encode and read that signal.`}
          />
        </Reveal>

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DOME_PARTS.map((part, i) => (
            <RevealItem key={part.id}>
              <article className="panel card-lift flex h-full flex-col rounded-2xl p-7">
                <div className="flex items-center justify-between">
                  <span className="num inline-flex size-10 items-center justify-center rounded-xl border border-pink/40 bg-pink/10 text-sm font-semibold text-blush">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted uppercase">{part.short}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-fg">{part.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{part.detail}</p>
                <ul className="mt-6 space-y-2 border-t border-white/8 pt-5 text-sm text-fg/85">
                  {part.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-blush" strokeWidth={2} aria-hidden />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </RevealItem>
          ))}
          <RevealItem>
            <aside className="flex h-full flex-col justify-between rounded-2xl border border-pink/30 bg-pink/5 p-7">
              <div>
                <p className="eyebrow">Interactive</p>
                <h3 className="mt-4 text-xl font-semibold text-fg">Pull the bore apart.</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  The dome in the hero explodes on hover or scroll. Pick a layer to isolate it, slide the couch, or run
                  a scan and watch the RF coil pulse while the patient reaches isocenter.
                </p>
              </div>
              <a
                href="#hero-title"
                className="mt-6 inline-flex min-h-11 items-center font-medium text-blush underline decoration-blush/40 underline-offset-4 transition-colors duration-150 hover:decoration-blush"
              >
                Back to the dome
              </a>
            </aside>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
