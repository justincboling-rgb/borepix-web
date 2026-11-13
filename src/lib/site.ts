/**
 * Site-wide configuration. Copy, pricing and links that more than one component needs live here
 * so marketing pages, the store, the app and legal pages never drift apart.
 */

export const site = {
  name: "Borepix",
  /** Set NEXT_PUBLIC_SITE_URL in production. Used for canonical URLs, sitemap and OG tags. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.borepix.com",
  tagline:
    "The advanced modality ecosystem for Radiologic Technologists mastering MRI, Interventional Radiology and CT.",
  description:
    "Borepix is the advanced modalities training and education ecosystem for Radiologic Technologists: free clinical workbooks and self-quizzes for MRI cross-sectional anatomy, vascular IR pathways and advanced CT protocols, official CE test keys, a CE library, and a mobile app.",
  supportEmail: "info@borepix.com",
  copyrightYear: 2026,
  /** Printed in the footer beneath the copyright line. */
  copyrightTag: "Co-founded for Radiologic Technologists.",
  /** Brand motto printed under the wordmark in the header. */
  motto: "Enter the dome",
  hq: { city: "Kearny", state: "New Jersey", stateCode: "NJ" },
  /** Social profiles. Set a URL to show the link in the footer; null hides it. */
  social: {
    x: null as string | null,
    instagram: null as string | null,
    linkedin: null as string | null,
  },
  /**
   * Mobile app store listings. Set to the real App Store / Google Play URLs when the apps are published.
   * While null, the store badges open the launch-notification form instead of a dead link.
   */
  appLinks: {
    ios: null as string | null,
    android: null as string | null,
  },
} as const;

/**
 * Release phase. While `commerceEnabled` is false the platform runs in its Alpha/Beta preview: every
 * workbook and self-quiz is open and free, prices and checkout are hidden everywhere, and the store,
 * test keys and CE Library open with the public launch. Flip `commerceEnabled` to true at launch.
 */
export const release = {
  phase: "beta" as "beta" | "live",
  label: "Alpha/Beta preview",
  /** Month of the official public launch, as printed in notices. */
  launch: "March 2027",
  launchShort: "March",
  commerceEnabled: false,
  notice:
    "Borepix is in its Alpha/Beta preview. Every workbook and self-quiz is open and free; the store, test keys and CE Library open with the public launch in March 2027.",
  short: "Alpha/Beta preview · public launch March 2027",
} as const;

export const commerceEnabled: boolean = release.commerceEnabled;

export type NavLink = { label: string; href: string };

/** Primary marketing navigation, in the order it appears in the header. Account access lives behind the person icon. */
export const marketingNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Anatomy", href: "/anatomy" },
  { label: "Self Quizzes", href: "/quizzes" },
  { label: "Store", href: "/store" },
  { label: "FAQ", href: "/faq" },
  { label: "About Us", href: "/about" },
];

/** Header call to action. Links to the store, where CE test keys and library passes are sold. */
export const ceLibraryCta = { label: "Access CE Library", href: "/store" } as const;

/** Account menu entries behind the header's person icon. */
export const loginLink = { label: "Log in", href: "/login" } as const;
export const signupLink = { label: "Create account", href: "/signup" } as const;
export const accountLink = { label: "My Account", href: "/account" } as const;
export const affiliateCta = { label: "Become an Affiliate", href: "/affiliates" } as const;

/** Affiliate partner program terms. The portal, the landing strip and the founder dashboard all read these. */
export const affiliateProgram = {
  commissionPercent: 40,
  /** Days a referral stays attributed after the first visit. */
  cookieDays: 30,
  /** Balance required before a payout is issued, USD. */
  minimumPayout: 50,
  payoutCadence: "Paid monthly by Stripe or PayPal",
  eligibleProducts: "test keys, Complete Suites and CE Library passes",
} as const;

/** Web-app routes. Keep in sync with src/app/app/**. */
export const appNav = [
  { label: "Dashboard", href: "/app", icon: "LayoutDashboard" },
  { label: "Practice", href: "/app/practice", icon: "Target" },
  { label: "Mock exam", href: "/app/exam", icon: "Timer" },
  { label: "MRI Mastery", href: "/app/mri", icon: "Magnet" },
  { label: "Flashcards", href: "/app/flashcards", icon: "Layers" },
] as const;

export type PlanId = "monthly" | "annual";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  cadence: "month" | "year";
  /** Shown under the price. */
  note: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
  renewal: string;
};

/** Subscription plans for the registry-prep web app (used by the account area). */
export const plans: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 49,
    cadence: "month",
    note: "Billed monthly. Cancel anytime.",
    features: [
      "Full Radiography and MRI question banks",
      "Unlimited timed mock exams",
      "MRI Mastery lessons and physics lab",
      "Spaced-repetition flashcards",
      "Readiness analytics by content category",
      "Web app now, mobile apps at launch",
    ],
    renewal:
      "Renews every month at $49 plus applicable tax until you cancel. Cancel anytime from your account settings.",
  },
  {
    id: "annual",
    name: "Annual",
    price: 399,
    cadence: "year",
    note: "Billed yearly. Save $189 versus monthly.",
    highlight: true,
    badge: "Best value",
    features: [
      "Everything in Monthly",
      "12 months to prepare at your pace",
      "Save $189 versus paying monthly",
      "Priority email support",
      "14-day money-back guarantee",
    ],
    renewal:
      "Renews every 12 months at $399 plus applicable tax until you cancel. We email a reminder before each renewal.",
  },
];

/**
 * Legal documents and where each lives. The four core policies have clean root routes; the refund and
 * trademark pages stay under /legal. Old /legal/terms, /legal/privacy and /legal/disclaimer URLs redirect
 * (see next.config.ts).
 */
export const legalPages = [
  { slug: "terms", title: "Terms of Service", href: "/terms" },
  { slug: "privacy", title: "Privacy Policy", href: "/privacy" },
  { slug: "refunds", title: "Refund Policy", href: "/legal/refunds" },
  { slug: "disclaimer", title: "Educational Disclaimer", href: "/disclaimer" },
  { slug: "trademarks", title: "Trademark Notice", href: "/legal/trademarks" },
  { slug: "dmca", title: "DMCA Copyright Notice", href: "/dmca" },
] as const;

export type LegalSlug = (typeof legalPages)[number]["slug"];

/** Canonical path of a legal document. */
export function legalHref(slug: LegalSlug): string {
  const page = legalPages.find((p) => p.slug === slug);
  return page ? page.href : `/legal/${slug}`;
}

/** Legal entity named in the Terms and copyright notices. */
export const legalEntity = "Borepix LLC";

/** Copyright and DMCA correspondence. Separate from support so takedown notices reach the right inbox. */
export const legalEmail = "legal@borepix.com";

/** The three legal links the footer prints first, in order. */
export const footerLegalLinks: NavLink[] = [
  { label: "Privacy Policies", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: `mailto:${site.supportEmail}` },
];

export const trademarkNotice =
  "ARRT® is a registered trademark of The American Registry of Radiologic Technologists. Borepix is an independent educational provider and is not affiliated with, sponsored by, or endorsed by ARRT or ASRT.";

export const educationalNotice =
  "Borepix is a study aid. Workbooks, quizzes and test keys are written by Borepix to reflect current clinical practice; they are not actual registry exam items. Nothing on this site is medical advice or a substitute for your program's clinical training and your facility's policies.";
