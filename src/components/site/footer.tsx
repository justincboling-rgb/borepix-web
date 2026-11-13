import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { featuredProducts } from "@/data/products";
import { MODALITY_SHORT } from "@/data/types";
import { educationalNotice, footerLegalLinks, legalPages, release, site, trademarkNotice, type NavLink } from "@/lib/site";

const explore: NavLink[] = [
  { label: "Anatomy", href: "/anatomy" },
  { label: "Self Quizzes", href: "/quizzes" },
  { label: "Store", href: "/store" },
  { label: "FAQ", href: "/faq" },
  { label: "About Us", href: "/about" },
  { label: "My Account", href: "/account" },
];

const library: NavLink[] = [
  ...featuredProducts.map((p) => ({ label: p.name, href: `/store/${p.slug}` })),
  { label: "All test keys", href: "/store" },
];

/** Program links. The founder dashboard is deliberately not linked here; it is reached by URL and must be gated before launch. */
const program: NavLink[] = [
  { label: "Become an Affiliate", href: "/affiliates" },
  { label: "Hoboken Shelter drive", href: "/#community" },
  { label: "Mobile app", href: "/#app" },
  { label: "Rad Tech Week", href: "/#rad-tech-week" },
];

/** The three contractual legal links first, then every other legal page not already listed (refunds, disclaimer, trademarks, DMCA). */
const legal: NavLink[] = [
  ...footerLegalLinks,
  ...legalPages.filter((p) => !footerLegalLinks.some((l) => l.href === p.href)).map((p) => ({ label: p.title, href: p.href })),
];

const columns = [
  { title: "Explore", links: explore },
  { title: "CE Library", links: library },
  { title: "Program", links: program },
  { title: "Legal", links: legal },
];

/** Social profiles with a URL set in site.ts. Empty until the accounts exist. */
const social = [
  { label: "X", href: site.social.x },
  { label: "Instagram", href: site.social.instagram },
  { label: "LinkedIn", href: site.social.linkedin },
].filter((s): s is { label: string; href: string } => typeof s.href === "string");

const linkClass = "inline-flex min-h-9 items-center text-sm text-muted transition-colors duration-150 hover:text-fg";

function FooterLink({ link }: { link: NavLink }) {
  if (link.href.startsWith("mailto:")) {
    return (
      <a href={link.href} className={linkClass}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={linkClass}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-ink">
      <div className="container-x py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-8">
          <div className="max-w-sm sm:col-span-2 lg:col-span-1">
            <Logo tagline={site.motto} />
            <p className="mt-5 text-sm leading-relaxed text-muted">{site.tagline}</p>
            {!release.commerceEnabled ? (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-pink/30 bg-pink/[0.06] px-3 py-1 font-mono text-[0.6875rem] font-medium tracking-[0.14em] text-blush uppercase">
                {release.short}
              </p>
            ) : null}
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li className="flex min-h-9 items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
                <span>
                  Built in {site.hq.city}, {site.hq.state}
                </span>
              </li>
              <li className="flex min-h-9 items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
                <a
                  href={`mailto:${site.supportEmail}`}
                  className="font-medium text-blush underline decoration-blush/40 underline-offset-4 transition-colors duration-150 hover:decoration-blush"
                >
                  {site.supportEmail}
                </a>
              </li>
            </ul>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="eyebrow">{col.title}</h2>
              <ul className="mt-4 space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 border-t border-white/8 pt-8">
          <div className="max-w-4xl space-y-3 text-[0.8125rem] leading-relaxed text-muted">
            <p>{trademarkNotice}</p>
            <p>{educationalNotice}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 text-[0.8125rem] text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              Copyright © {site.copyrightYear} {site.name}. {site.copyrightTag}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center text-muted transition-colors duration-150 hover:text-fg"
                >
                  {s.label}
                </a>
              ))}
              <p className="num text-xs tracking-[0.14em] text-muted uppercase">{MODALITY_SHORT.all}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
