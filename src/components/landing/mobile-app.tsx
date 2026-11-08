import { ArrowRight, Clock, Layers, Magnet, Target, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { PhoneMockup } from "@/components/landing/conversion/phone-mockup";
import { WaitlistForm } from "@/components/landing/conversion/waitlist-form";

const HIGHLIGHTS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Target, title: "Practice questions", body: "Short sets with the full rationale after every answer." },
  { icon: Layers, title: "Flashcards", body: "Spaced repetition brings each card back when it is due." },
  { icon: Magnet, title: "MRI lessons", body: "Physics and safety, one focused screen at a time." },
];

/** Neither store listing exists yet, so these are status labels, not links. */
const STORES = ["App Store", "Google Play"] as const;

export function MobileApp() {
  return (
    <section
      id="app"
      aria-labelledby="app-heading"
      className="relative isolate overflow-hidden border-y border-white/8 bg-ink-2 py-24 sm:py-32"
    >
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />

      <div className="container-x grid items-center gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
        <div>
          <SectionHeading
            id="app-heading"
            eyebrow="Mobile app"
            title={
              <>
                Borepix in your <span className="text-gradient">pocket</span>.
              </>
            }
            lede="Practice questions, flashcards and MRI lessons on your phone. Native iOS and Android apps are coming soon. The web app already runs in any modern mobile browser."
          />

          <ul className="mt-10 grid gap-5 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <span className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blush">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-3 font-sans text-base font-semibold text-fg">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>

          <ul aria-label="App store availability" className="mt-10 flex flex-wrap gap-3">
            {STORES.map((store) => (
              <li
                key={store}
                className="flex min-h-14 items-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-2"
              >
                <Clock className="size-5 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
                <span className="sr-only">{store}: coming soon</span>
                <span aria-hidden className="flex flex-col leading-tight">
                  <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted uppercase">Coming soon</span>
                  <span className="font-display text-base font-semibold text-fg/85">{store}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="panel mt-6 max-w-xl rounded-2xl p-5 sm:p-6">
            <WaitlistForm />
          </div>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <ButtonLink href="/signup" variant="secondary" size="lg">
              Start on the web today
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </ButtonLink>
            <p className="text-sm text-muted">Works in your phone&apos;s browser. No download needed.</p>
          </div>
        </div>

        <div className="reveal">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
