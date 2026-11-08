import type { Metadata } from "next";
import Link from "next/link";
import { Award, CalendarClock, ChevronRight, RotateCcw, Zap, type LucideIcon } from "lucide-react";
import { LaunchBadge } from "@/components/commerce/launch-notice";
import { StoreGrid } from "@/components/store/store-grid";
import { products } from "@/data/products";
import { commerceEnabled, release, site } from "@/lib/site";

const title = "CE Library & Store";
const description = commerceEnabled
  ? "Official Borepix CE test keys for MRI, Interventional Radiology and CT, the Complete Suite, the CE Library Annual Pass and the mobile app license. Instant digital delivery, three attempts per key, certificate on passing."
  : `Official Borepix CE test keys for MRI, Interventional Radiology and CT, the Complete Suite, the CE Library Annual Pass and the mobile app license. Catalogue open now; keys issue at the public launch in ${release.launch}. Three attempts per key, certificate on passing.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/store" },
  openGraph: { type: "website", siteName: site.name, title: `${title} | ${site.name}`, description, url: "/store" },
  twitter: { card: "summary", title: `${title} | ${site.name}`, description },
};

const LEDE_LIVE =
  "Official test keys for MRI, Interventional Radiology and CT, the Complete Suite, the CE Library Annual Pass and the mobile app license. Search, compare, add to cart or buy in one click. Every key is delivered to your account the moment the order clears.";

const LEDE_PREVIEW = `Official test keys for MRI, Interventional Radiology and CT, the Complete Suite, the CE Library Annual Pass and the mobile app license. Search and compare the catalogue today. Keys issue to your account at the public launch in ${release.launch}.`;

type TrustItem = { icon: LucideIcon; title: string; body: string };

/**
 * Three facts that hold for every key in the catalogue, restated from src/data/products.ts: the `digital`
 * stock status (or, in the preview, when keys issue), the attempt policy and the certificate line in every
 * key's `includes`.
 */
const TRUST: TrustItem[] = [
  commerceEnabled
    ? {
        icon: Zap,
        title: "Instant digital delivery",
        body: "Every product in the store is a digital key. It is in your account the moment the order clears.",
      }
    : {
        icon: CalendarClock,
        title: "Catalogue open now · keys issue at launch",
        body: `Every product in the store is a digital key. Browse and compare now; keys issue to your account when the store opens in ${release.launch}.`,
      },
  {
    icon: RotateCcw,
    title: "Three attempts per key",
    body: "Each test key allows three scored submissions and 180 days to complete them.",
  },
  {
    icon: Award,
    title: "Certificate on passing",
    body: "A passing submission records your CE credit and unlocks a downloadable certificate of completion.",
  },
];

export default function StorePage() {
  return (
    <main id="main" className="relative isolate">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]" />

      <nav aria-label="Breadcrumb" className="container-x pt-10 sm:pt-14">
        <ol className="flex items-center gap-2 text-sm text-muted">
          <li>
            <Link href="/" className="inline-flex min-h-9 items-center transition-colors duration-150 hover:text-fg">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-4 text-subtle" strokeWidth={1.75} />
          </li>
          <li aria-current="page" className="font-medium text-fg">
            Store
          </li>
        </ol>
      </nav>

      <div className="container-x pb-24 lg:pb-32">
        <header className="mt-8 max-w-3xl sm:mt-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="eyebrow">Store</p>
            {commerceEnabled ? null : <LaunchBadge full />}
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-fg sm:text-5xl">CE Library &amp; Store</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{commerceEnabled ? LEDE_LIVE : LEDE_PREVIEW}</p>
        </header>

        <StoreGrid products={products} />

        <section aria-labelledby="store-trust-heading" className="mt-20 border-t border-white/8 pt-12 sm:mt-24">
          <h2 id="store-trust-heading" className="sr-only">
            What every key includes
          </h2>
          <ul role="list" className="hairline grid divide-y divide-line rounded-2xl bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {TRUST.map(({ icon: Icon, title: itemTitle, body }) => (
              <li key={itemTitle} className="flex gap-4 p-5 sm:flex-col sm:gap-5 sm:p-6">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-ink text-blush">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-base font-semibold text-fg">{itemTitle}</span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
