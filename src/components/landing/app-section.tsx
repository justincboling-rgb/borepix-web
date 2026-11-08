import Link from "next/link";
import { ArrowRight, CircleCheck, KeyRound, ListChecks, WifiOff, type LucideIcon } from "lucide-react";
import { AppBadges } from "@/components/landing/app-badges";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";
import { commerceEnabled, release } from "@/lib/site";

type Feature = { icon: LucideIcon; title: string; body: string };

const FEATURES: Feature[] = [
  {
    icon: WifiOff,
    title: "Offline workbooks",
    body: "Every module and diagram is on the device, so the floor's dead spots do not interrupt a review.",
  },
  {
    icon: ListChecks,
    title: "Self-quizzes between cases",
    body: "The same question banks as the site, with rationales, scored in the minutes between patients.",
  },
  {
    icon: KeyRound,
    title: "Your CE keys, synced",
    body: "Redeem a test key once and it follows your account across iOS and Android.",
  },
];

/* Illustrative screen. Portal venous enhancement of the liver peaks about 60–70 s after injection. */
const SCREEN = {
  eyebrow: "Advanced CT Protocols",
  counter: "7 / 12",
  progress: "w-[58%]",
  stem: "For a portal venous phase of the liver, the scan delay after the start of injection is approximately:",
  choices: ["20–25 s", "30–35 s", "60–70 s", "180 s"] as const,
  answer: 2,
  note: "Late arterial is 30–35 s. Portal venous peaks at 60–70 s.",
} as const;

const LETTERS = ["A", "B", "C", "D"] as const;

/** CSS-only phone showing a static Borepix quiz screen. Exposed to assistive tech as one image. */
function PhoneFrame() {
  return (
    <div
      role="img"
      aria-label="Illustration of the Borepix app showing a CT protocol quiz question answered correctly"
      className="animate-float relative isolate w-[17rem] select-none sm:w-[19rem]"
    >
      {/* The one neon glow in this view. */}
      <div aria-hidden className="absolute inset-x-8 top-1/3 bottom-1/4 -z-10 rounded-full bg-pink/20 blur-3xl" />

      <div className="hairline rounded-[2.5rem] bg-card p-2 shadow-panel">
        <div className="relative flex aspect-[9/19] flex-col overflow-hidden rounded-[2rem] bg-ink">
          {/* Notch */}
          <div className="absolute top-2.5 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-card" />

          {/* Status bar */}
          <div className="num flex items-center justify-between px-6 pt-3.5 text-[0.6875rem] font-semibold text-fg">
            <span>9:41</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-sans text-[0.5625rem] font-medium tracking-[0.1em] text-muted uppercase">
              <WifiOff className="size-2.5" strokeWidth={2} />
              Offline
            </span>
          </div>

          <div className="flex flex-1 flex-col px-4 pt-6 pb-4">
            {/* Header */}
            <div className="flex items-end justify-between gap-3">
              <p className="font-mono text-[0.5625rem] font-medium tracking-[0.16em] text-blush uppercase">
                {SCREEN.eyebrow}
              </p>
              <p className="num text-[0.625rem] text-muted">{SCREEN.counter}</p>
            </div>

            {/* Progress rail */}
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
              <div className={cn("h-full rounded-full bg-linear-to-r from-blush to-pink", SCREEN.progress)} />
            </div>

            {/* Stem */}
            <p className="mt-5 text-[0.8125rem] leading-snug font-medium text-fg">{SCREEN.stem}</p>

            {/* Options */}
            <div className="mt-4 space-y-2">
              {SCREEN.choices.map((choice, i) => {
                const correct = i === SCREEN.answer;
                return (
                  <div
                    key={choice}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-[0.75rem]",
                      correct ? "border-success/60 bg-success/10 text-fg" : "border-white/8 text-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "num inline-flex size-5 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-semibold",
                        correct ? "bg-success text-ink" : "border border-white/15",
                      )}
                    >
                      {LETTERS[i]}
                    </span>
                    <span className="num flex-1">{choice}</span>
                    {correct ? <CircleCheck className="size-4 text-success" strokeWidth={2} /> : null}
                  </div>
                );
              })}
            </div>

            {/* Result */}
            <div className="mt-4 rounded-lg border border-success/30 bg-success/10 px-2.5 py-2">
              <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold text-success">
                <CircleCheck className="size-3.5" strokeWidth={2} />
                Correct
              </p>
              <p className="mt-1 text-[0.6875rem] leading-snug text-muted">{SCREEN.note}</p>
            </div>

            {/* Next */}
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className="text-[0.6875rem] text-muted">
                <span className="num text-fg">6 of 7</span> correct
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-pink-strong px-3 py-1.5 text-[0.6875rem] font-semibold text-white">
                Next
                <ArrowRight className="size-3" strokeWidth={2} />
              </span>
            </div>
            <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile app section (anchor target of the hero's secondary CTA). Copy and store badges on the left,
 * a floating CSS phone on the right. The phone's float and the copy's scroll reveal are the only two
 * animated elements in this viewport.
 */
export function AppSection() {
  return (
    <section id="app" aria-labelledby="app-heading" className="relative scroll-mt-24 border-t border-white/8 bg-ink-2 py-24 sm:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="reveal">
          <SectionHeading
            id="app-heading"
            eyebrow="Mobile app"
            title="The suite, in your scrub pocket."
            lede="Offline workbooks, self-quizzes and your CE keys, synced between iOS and Android."
          />

          <ul className="mt-10 space-y-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blush">
                  <Icon className="size-4.5" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="font-medium text-fg">{title}</p>
                  <p className="mt-1 leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <AppBadges className="mt-10" />

          {commerceEnabled ? (
            <p className="mt-6 text-sm text-muted">
              The 12-month app license is sold in the store and unlocks the same account on up to three devices.{" "}
              <Link
                href="/store/borepix-mobile-app-12-month-license"
                className="inline-flex min-h-11 items-center gap-1 font-medium text-blush underline decoration-blush/40 underline-offset-4 transition-colors duration-150 hover:decoration-blush"
              >
                See the license
                <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden />
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-sm text-muted">
              The 12-month app license opens with the public launch in {release.launch}. Choose a badge above to be
              notified when the apps are live.
            </p>
          )}
        </div>

        <div className="flex justify-center lg:justify-end">
          <PhoneFrame />
        </div>
      </div>
    </section>
  );
}
