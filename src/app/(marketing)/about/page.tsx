import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Crosshair,
  HeartHandshake,
  KeyRound,
  Library,
  ListChecks,
  LockOpen,
  MapPin,
  Scale,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { about } from "@/data/about";
import { community } from "@/data/community";
import { MODALITY_SHORT } from "@/data/types";
import { site } from "@/lib/site";

const title = "About Us";
const description =
  "Borepix is built in Kearny, New Jersey by co-founders who are Radiologic Technologists working across MR, IR and CT. Free workbooks and self-quizzes, official CE test keys, a CE Library and a mobile app.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { type: "website", siteName: site.name, title: `${title} | ${site.name}`, description, url: "/about" },
  twitter: { card: "summary", title: `${title} | ${site.name}`, description },
};

const VALUE_ICONS: Record<(typeof about.values)[number]["id"], LucideIcon> = {
  precision: Crosshair,
  "free-first": LockOpen,
  judgement: Scale,
  neighbours: HeartHandshake,
};

const BUILD_ICONS: Record<(typeof about.builds)[number]["id"], LucideIcon> = {
  workbooks: BookOpen,
  quizzes: ListChecks,
  "test-keys": KeyRound,
  "ce-library": Library,
  "mobile-app": Smartphone,
};

const sectionClass = "border-t border-white/8 py-20 sm:py-24";

export default function AboutPage() {
  return (
    <main id="main" className="relative isolate">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]" />

      {/* Header */}
      <header className="container-x pt-16 pb-20 sm:pt-20 sm:pb-24">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{about.eyebrow}</p>
          <h1 className="mt-5 text-4xl font-semibold text-fg sm:text-5xl lg:text-6xl">{about.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{about.mission}</p>
          <p className="mt-8 flex flex-wrap items-center gap-2 text-sm text-muted">
            <MapPin className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
            {site.hq.city}, {site.hq.state}
            <span aria-hidden className="text-subtle">
              ·
            </span>
            <span className="num text-fg">{MODALITY_SHORT.all}</span>
          </p>
        </Reveal>
      </header>

      {/* Story */}
      <section aria-labelledby="about-story-heading" className={sectionClass}>
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">The story</p>
            <h2 id="about-story-heading" className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">
              Written in the suite, not about it.
            </h2>
          </div>
          <Reveal className="max-w-[68ch] space-y-5 text-base leading-7 text-fg/80 sm:text-[1.0625rem] sm:leading-8">
            {about.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="about-values-heading" className={sectionClass}>
        <div className="container-x">
          <p className="eyebrow">Values</p>
          <h2 id="about-values-heading" className="mt-4 max-w-3xl text-3xl font-semibold text-fg sm:text-4xl">
            Four things we hold to.
          </h2>
          <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.values.map((value) => {
              const Icon = VALUE_ICONS[value.id];
              return (
                <RevealItem key={value.id} className="h-full">
                  <article className="hairline flex h-full flex-col rounded-2xl bg-card p-6 transition-colors duration-250 ease-out-expo hover:border-white/20">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-ink text-blush">
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-fg">{value.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{value.body}</p>
                  </article>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* What we build */}
      <section aria-labelledby="about-build-heading" className={sectionClass}>
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">What we build</p>
            <h2 id="about-build-heading" className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">
              Five parts. One ecosystem.
            </h2>
            <p className="mt-5 max-w-md text-muted">
              Read and practise free. Pay only for the key, the pass or the app license.
            </p>
          </div>
          <ul role="list" className="hairline divide-y divide-line rounded-2xl bg-card">
            {about.builds.map((item) => {
              const Icon = BUILD_ICONS[item.id];
              return (
                <li key={item.id} className="reveal">
                  <Link
                    href={item.href}
                    className="group flex items-start gap-4 px-5 py-5 transition-colors duration-150 hover:bg-card-2 sm:px-6"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-ink text-silver transition-colors duration-150 group-hover:text-blush">
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-base font-semibold text-fg sm:text-lg">{item.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{item.description}</span>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blush">
                        {item.cta}
                        <ArrowRight
                          className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Kearny */}
      <section aria-labelledby="about-hoboken-heading" className={sectionClass}>
        <div className="container-x">
          <Reveal>
            <div className="panel haze-top relative overflow-hidden rounded-2xl p-6 sm:p-10 lg:p-12">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                  <p className="eyebrow">
                    <MapPin className="size-4" strokeWidth={1.75} aria-hidden />
                    {community.eyebrow}
                  </p>
                  <h2 id="about-hoboken-heading" className="mt-4 text-2xl font-semibold text-fg sm:text-3xl">
                    {community.title}
                  </h2>
                  <blockquote className="mt-6 max-w-3xl border-l border-blush pl-6">
                    <p className="font-display text-lg font-medium leading-snug text-fg sm:text-xl">{community.statement}</p>
                  </blockquote>
                  <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                    A portion of every test key sold funds a quarterly supply drive for {community.partner.name}. Pledges
                    made on the site are fulfilled by Borepix from the shelter&rsquo;s published wish lists. Next drive:{" "}
                    <span className="font-medium text-fg">{community.nextDrive}</span>.
                  </p>
                </div>
                <ButtonLink href="/#community" variant="secondary" size="lg" className="lg:mb-1">
                  See the community drive
                  <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing */}
      <section aria-labelledby="about-cta-heading" className="border-t border-white/8 py-24 text-center sm:py-32">
        <div className="container-x">
          <p className="eyebrow justify-center">Start here</p>
          <h2 id="about-cta-heading" className="mx-auto mt-5 max-w-3xl text-3xl font-semibold text-fg sm:text-4xl lg:text-5xl">
            Stop guessing. <span className="text-gradient">Start leading.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Official CE test keys, the Complete Suite and the CE Library pass are in the store.
          </p>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/store" size="lg">
              Access CE Library &amp; Store
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
