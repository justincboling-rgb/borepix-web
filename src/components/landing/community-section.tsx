import {
  BedDouble,
  CalendarDays,
  Check,
  Droplets,
  Package,
  Shirt,
  Snowflake,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { PartnerShelter } from "@/components/community/partner-shelter";
import { PledgeWidget } from "@/components/community/pledge-widget";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { community } from "@/data/community";

/** One icon per drive item, in the priority order of `community.driveItems`. */
const DRIVE_ICONS: LucideIcon[] = [BedDouble, Shirt, Droplets, UtensilsCrossed, Snowflake];

/**
 * Community band. The statement is printed verbatim as a pull quote, the pledge widget on the right
 * records pledges to the supporter's device and account without collecting money, and the partner
 * shelter card beneath carries The Hoboken Shelter's own mission, numbers, giving links and contact.
 */
export function CommunitySection() {
  return (
    <section id="community" aria-labelledby="community-heading" className="relative isolate py-24 sm:py-32">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]" />

      <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-20">
        <Reveal>
          <SectionHeading id="community-heading" eyebrow={community.eyebrow} title={community.title} />

          <blockquote className="mt-10 border-l border-blush pl-6 sm:pl-8">
            <p className="font-display text-xl font-medium leading-snug text-fg sm:text-2xl lg:text-[1.75rem]">
              {community.statement}
            </p>
          </blockquote>

          <div className="mt-8 max-w-[62ch] space-y-4 text-base leading-relaxed text-muted sm:text-lg">
            {community.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <h3 className="mt-10 font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">
            What the drives purchase
          </h3>
          <ul role="list" className="hairline mt-4 divide-y divide-line rounded-2xl bg-card">
            {community.driveItems.map((item, i) => {
              const Icon = DRIVE_ICONS[i] ?? Package;
              return (
                <li key={item} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-ink text-silver">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="flex-1 text-fg">{item}</span>
                  <span className="num text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <Check className="size-4 shrink-0 text-blush" strokeWidth={2} aria-hidden />
                </li>
              );
            })}
          </ul>

          <p className="mt-6 flex items-center gap-2 text-sm text-muted">
            <CalendarDays className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
            Next drive: <span className="font-medium text-fg">{community.nextDrive}</span>
          </p>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-28">
          <PledgeWidget />
        </Reveal>
      </div>

      <div className="container-x mt-14 sm:mt-20">
        <Reveal>
          <PartnerShelter />
        </Reveal>
      </div>
    </section>
  );
}
