import { site } from "@/lib/site";

const baseUrl = site.url.replace(/\/+$/, "");
const homeUrl = `${baseUrl}/`;
const organizationId = `${baseUrl}/#organization`;

/** Site-wide structured data. Facts only: no ratings, reviews, prices or counts. */
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: site.name,
      url: homeUrl,
      logo: `${baseUrl}/logo.png`,
      email: site.supportEmail,
      description: site.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: site.hq.city,
        addressRegion: site.hq.stateCode,
        addressCountry: "US",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: site.supportEmail,
        availableLanguage: "English",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      name: site.name,
      url: homeUrl,
      description: site.description,
      inLanguage: "en-US",
      publisher: { "@id": organizationId },
    },
  ],
};

// Escape "<" so no string in the payload can close the script element early.
const json = JSON.stringify(graph).replace(/</g, "\\u003c");

/** Renders the Organization + WebSite JSON-LD graph. Mount once, in the marketing layout. */
export function SiteJsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
