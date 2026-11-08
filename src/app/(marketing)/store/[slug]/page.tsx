import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetail } from "@/components/store/product-detail";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { getProduct, products } from "@/data/products";
import { PRODUCT_CATEGORY_LABEL, type Product } from "@/data/types";
import { commerceEnabled, release, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

const baseUrl = site.url.replace(/\/+$/, "");

// cacheComponents is on, so `dynamicParams` is unavailable: unknown slugs fall through to notFound() below.
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

/** One sentence for search results and link previews: the tagline plus the facts a buyer scans for. */
function describe(product: Product): string {
  const facts =
    product.ceCredits !== null
      ? `${product.ceCredits.toFixed(1)} CE credits on a passing submission. ${product.attempts}.`
      : product.attempts === "Not applicable"
        ? ""
        : `${product.attempts}.`;
  const availability = commerceEnabled
    ? "Instant digital delivery from Borepix."
    : `Opens with the Borepix public launch in ${release.launch}.`;
  return [product.tagline, facts, availability].filter(Boolean).join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  const path = `/store/${product.slug}`;
  const description = describe(product);
  const socialTitle = `${product.name} | ${site.name}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, title: socialTitle, description, url: path },
    twitter: { card: "summary", title: socialTitle, description },
  };
}

/**
 * schema.org Product for rich results. Every value comes from the catalogue entry. Ratings are left out
 * until they come from a live review system. All products are digital keys, so availability is InStock.
 */
function productJsonLd(product: Product) {
  const url = `${baseUrl}/store/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description.join(" "),
    sku: product.sku,
    url,
    category: PRODUCT_CATEGORY_LABEL[product.category],
    brand: { "@type": "Brand", name: site.name },
    // Offers are published only once the store is live; the preview carries no price anywhere.
    ...(commerceEnabled
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: product.price.toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": `${baseUrl}/#organization` },
          },
        }
      : {}),
  };
}

/**
 * The page is a static shell; everything that depends on the slug renders inside <Suspense>, so the
 * route stays instant under cacheComponents (see the instant-navigation guide).
 */
export default function ProductPage({ params }: Props) {
  return (
    <main id="main" className="relative isolate">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]" />

      <Suspense fallback={<PageSkeleton className="pb-24" />}>
        <ProductBody params={params} />
      </Suspense>
    </main>
  );
}

async function ProductBody({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  // Escape "<" so no string in the payload can close the script element early.
  const json = JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <ProductDetail product={product} />
    </>
  );
}
