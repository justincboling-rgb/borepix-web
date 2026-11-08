import { BookOpen, KeyRound, MapPin, type LucideIcon } from "lucide-react";
import { MriDome } from "@/components/landing/dome/mri-dome";
import { HeroCopy } from "@/components/landing/hero-copy";
import { site } from "@/lib/site";

type Fact = { icon: LucideIcon; label: string };

/** Three true things about the product. No numbers that are not true of this codebase. */
const FACTS: Fact[] = [
  { icon: BookOpen, label: "Workbooks and self-quizzes, free" },
  { icon: KeyRound, label: "Official CE test keys" },
  { icon: MapPin, label: `Built in ${site.hq.city}, ${site.hq.state}` },
];

/**
 * Landing hero. Copy on the left, the borderless MRI dome on the right, a slim row of facts beneath.
 * The dome stage has no box of its own: the WebGL canvas is transparent and sits on the hero's radial
 * lighting, and it explodes and turns with the page scroll.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-x-clip bg-ink">
      {/* Background: pink haze at the top edge, a faint grid that fades out toward the fold, and the dome's light pool. */}
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[52rem] opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 hidden h-[56rem] w-[56rem] rounded-full bg-radial-[circle_at_center] from-pink/14 via-pink/[0.04] to-transparent blur-2xl lg:block"
        style={{ right: "-8rem", top: "-6rem" }}
      />

      <div className="container-x pt-14 pb-16 sm:pt-20 lg:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          <HeroCopy />

          {/* Borderless stage: the dome renders on transparent canvas and overlays its own readouts and controls. */}
          <div className="relative -mx-4 h-[460px] sm:mx-0 sm:h-[540px] lg:h-[640px]">
            <MriDome />
          </div>
        </div>

        <ul
          aria-label="About Borepix"
          className="mt-14 flex flex-col gap-4 border-t border-white/8 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3"
        >
          {FACTS.map(({ icon: Icon, label }, i) => (
            <li key={label} className="flex items-center gap-3">
              {i > 0 ? <span aria-hidden className="hidden h-4 w-px bg-white/10 sm:block" /> : null}
              <Icon className="size-4 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
              <span className="font-mono text-xs font-medium tracking-[0.16em] text-muted uppercase">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
