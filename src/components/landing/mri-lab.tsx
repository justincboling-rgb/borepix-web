import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContrastExplorer } from "@/components/landing/interactive/contrast-explorer";

const TOPICS = [
  "Precession and the Larmor equation",
  "T1 recovery and T2 decay",
  "TR, TE and image contrast",
  "k-space and spatial encoding",
  "RF safety and SAR",
  "MR safety zones and screening",
] as const;

/** Landing spotlight on MRI Mastery, with the interactive spin-echo contrast explorer. */
export function MriLab() {
  return (
    <section id="mri-lab" aria-labelledby="mri-lab-title" className="relative isolate py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="haze-top absolute inset-0" />
        <div className="bg-grid absolute inset-0 opacity-70" />
      </div>

      <div className="container-x grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="min-w-0">
          <SectionHeading
            id="mri-lab-title"
            eyebrow="MRI Mastery"
            title={
              <>
                See the physics, <span className="text-gradient">not just the formulas.</span>
              </>
            }
            lede="Registry MRI questions reward understanding, not memorized tables. MRI Mastery builds the intuition first. Change a parameter, watch contrast respond, then learn the math behind it."
          />

          <p id="mri-lab-topics" className="mt-10 text-sm font-medium text-fg">
            Lesson topics
          </p>
          <ol aria-labelledby="mri-lab-topics" className="mt-3 grid gap-2 sm:grid-cols-2">
            {TOPICS.map((topic, i) => (
              <li
                key={topic}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-2.5 text-sm leading-snug text-fg"
              >
                <span aria-hidden className="num text-xs font-medium text-blush">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {topic}
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <ButtonLink href="/app/mri" size="lg">
              Open MRI Mastery
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
        </div>

        <div className="reveal min-w-0">
          <ContrastExplorer />
        </div>
      </div>
    </section>
  );
}
