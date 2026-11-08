import { ArrowUpRight, FileText, Gift, Globe, MapPin, Phone, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { community } from "@/data/community";
import { cn } from "@/lib/cn";

const { partner } = community;

type ActionLink = { label: string; href: string; icon: typeof Globe; primary?: boolean };

const ACTIONS: ActionLink[] = [
  { label: partner.wishlist.label, href: partner.wishlist.href, icon: Gift, primary: true },
  { label: partner.website.label, href: partner.website.href, icon: Globe },
  { label: partner.impactReport.label, href: partner.impactReport.href, icon: FileText },
];

/**
 * The partner shelter card: The Hoboken Shelter's own mission statement and headline numbers, the ways
 * to give, and how to reach them. Every outbound link opens in a new tab; the Amazon wish list is the
 * primary action because it ships supplies straight to the shelter.
 */
export function PartnerShelter({ className }: { className?: string }) {
  return (
    <article
      aria-labelledby="partner-shelter-heading"
      className={cn("hairline relative overflow-hidden rounded-2xl bg-card shadow-panel", className)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-radial-[ellipse_60%_100%_at_50%_0%] from-pink/12 to-transparent" />

      <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14 lg:p-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neon">Partner shelter</Badge>
            <Badge tone="neutral">Since {partner.since}</Badge>
            <Badge tone="neutral">{partner.status}</Badge>
          </div>

          <h3 id="partner-shelter-heading" className="mt-5 text-2xl font-semibold text-fg sm:text-3xl">
            {partner.name}
          </h3>

          <blockquote className="mt-5 border-l border-blush pl-5 sm:pl-6">
            <p className="text-base leading-relaxed text-fg/90 sm:text-lg">{partner.mission}</p>
            <footer className="mt-3 font-mono text-[0.6875rem] tracking-[0.16em] text-muted uppercase">
              Mission statement · {partner.name}
            </footer>
          </blockquote>

          <dl className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {partner.stats.map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-xl border border-line bg-ink px-2.5 py-4 sm:px-4 sm:py-5">
                <dd className="num text-xl font-semibold text-fg sm:text-2xl lg:text-3xl">{stat.value}</dd>
                <dt className="mt-1 text-xs leading-snug text-muted sm:text-sm">{stat.label}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">
            Serving the community since {partner.since} as a {partner.status}. Figures are the shelter&rsquo;s own.
          </p>

          <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Ways to support the shelter">
            {ACTIONS.map(({ label, href, icon: Icon, primary }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-150 ease-out active:scale-[0.98]",
                    primary
                      ? "border-pink-strong bg-pink-strong text-white shadow-[var(--shadow-glow-sm)] hover:bg-pink-deep"
                      : "border-white/12 bg-white/[0.04] text-fg hover:border-white/25 hover:bg-white/[0.08]",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  {label}
                  <ArrowUpRight className="size-3.5 opacity-70" strokeWidth={1.75} aria-hidden />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Target and Walmart lists are on the shelter&rsquo;s{" "}
            <a
              href={partner.wishlistHub.href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blush underline decoration-blush/40 underline-offset-4 hover:decoration-blush"
            >
              wish-list page
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </div>

        <aside aria-label={`Contact ${partner.name}`} className="rounded-2xl border border-line bg-ink p-5 sm:p-6 lg:self-start">
          <p className="eyebrow">Contact and location</p>
          <ul className="mt-5 space-y-5 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
              <address className="not-italic leading-relaxed text-fg">
                {partner.address.street}
                <br />
                {partner.address.locality}
              </address>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
              <a
                href={partner.phone.href}
                className="num inline-flex min-h-6 items-center font-medium text-fg underline decoration-white/20 underline-offset-4 hover:decoration-blush"
              >
                {partner.phone.display}
              </a>
            </li>
            <li className="flex gap-3">
              <UserRound className="mt-0.5 size-4 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
              <div className="leading-relaxed">
                <p className="font-medium text-fg">{partner.contact.name}</p>
                <p className="text-muted">{partner.contact.role}</p>
              </div>
            </li>
          </ul>
          <p className="mt-6 border-t border-white/8 pt-4 text-xs leading-relaxed text-muted">
            Borepix is independent of {partner.name}. Supply drives are funded by Borepix; gifts made through the
            shelter&rsquo;s links go directly to the shelter.
          </p>
        </aside>
      </div>
    </article>
  );
}
