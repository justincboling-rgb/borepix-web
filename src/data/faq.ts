import { community } from "@/data/community";
import { nrtw } from "@/data/nrtw";
import { getProduct } from "@/data/products";
import type { Product } from "@/data/types";
import { formatPrice } from "@/lib/pricing";
import { commerceEnabled, release, site, trademarkNotice } from "@/lib/site";

export type FaqItem = {
  /** Stable slug, used for element ids (`faq-{id}`) and in-page links such as /faq#faq-nrtw. */
  id: string;
  question: string;
  /** Plain-text paragraphs. Rendered on the page and reused verbatim for the FAQPage JSON-LD. */
  answer: string[];
  /** Optional follow-up link rendered after the answer. */
  link?: { href: string; label: string };
};

/** Catalogue facts quoted below come from the products file so prices and credits can never drift. */
function requireProduct(slug: string): Product {
  const product = getProduct(slug);
  if (!product) throw new Error(`FAQ references a product that is not in the catalogue: ${slug}`);
  return product;
}

const mriKey = requireProduct("mri-physics-sequence-master-test-key");
const suite = requireProduct("advanced-cross-sectional-anatomy-complete-suite");
const cePass = requireProduct("ce-library-annual-pass");

const driveList = `${community.driveItems.slice(0, -1).join(", ").toLowerCase()} and ${community.driveItems[community.driveItems.length - 1].toLowerCase()}`;

/** Price sentences are only printed once commerce is live; the preview hides every dollar amount. */
const suitePricing = commerceEnabled
  ? ` It is ${formatPrice(suite.price)} against ${formatPrice(suite.compareAt ?? suite.price)} for the three keys bought separately.`
  : "";

const launchItem: FaqItem = {
  id: "beta",
  question: "Is Borepix live yet?",
  answer: [
    `Borepix is in its ${release.label}. The workbooks, review guides, interactive diagrams and self-quizzes are complete, open and free to use today, with no account required.`,
    `The store, test keys, CE Library passes and the mobile app license open with the official public launch in ${release.launch}. Until then prices are hidden and no purchase can be made. Everything you study now carries over.`,
  ],
  link: { href: "/anatomy", label: "Start with the workbooks" },
};

/**
 * Site FAQ. Every answer must stay true of the product as built: credits and attempt rules are read
 * from the catalogue, promo dates from the NRTW file, and nothing here promises a feature that is not live.
 */
export const faqs: FaqItem[] = [
  ...(commerceEnabled ? [] : [launchItem]),
  {
    id: "what-is-borepix",
    question: "What is Borepix?",
    answer: [
      "Borepix is the advanced modality training and education ecosystem for Radiologic Technologists mastering MRI, Interventional Radiology and CT. It is built in Kearny, New Jersey by technologists who work in those suites.",
      "The ecosystem has five parts: free clinical workbooks, free self-quizzes, official CE test keys, the CE Library and a mobile app. You can read and practise without an account. You pay only when you want credit.",
    ],
    link: { href: "/about", label: "Read about Borepix" },
  },
  {
    id: "free-vs-paid",
    question: "What is free and what is paid?",
    answer: [
      "The workbooks and the self-quizzes are free. Every review guide, every interactive diagram and every quiz question with its rationale is open to read and retake, and nothing in the free material expires.",
      "Money changes hands for three things only: official CE test key submissions, CE Library passes and the mobile app license. There is no subscription behind the free material.",
    ],
    link: { href: "/store", label: commerceEnabled ? "See prices in the store" : "Browse the store catalogue" },
  },
  {
    id: "test-keys",
    question: "What is a test key, and how does a submission work?",
    answer: [
      `A test key is a license for one scored assessment. Each key covers one curriculum. The ${mriKey.name}, for example, is a ${mriKey.questionCount}-item assessment with a ${mriKey.passMark}% pass mark that awards ${(mriKey.ceCredits ?? 0).toFixed(1)} CE credits on a passing submission.`,
      "After purchase, redeem the key in My Account. You then have three attempts and 180 days to pass. Every submission returns an item-by-item breakdown with rationales, so a near miss becomes a review plan rather than a guess.",
      "A passing submission records your CE credit and unlocks a downloadable certificate of completion.",
    ],
    link: { href: "/account", label: "Redeem a key in My Account" },
  },
  {
    id: "ce-credit",
    question: "How is CE credit recorded?",
    answer: [
      "Credit posts to your Borepix account the moment an assessment is passed. The certificate of completion lists the course, the credits awarded and the date of the passing submission. Download it from My Account and keep it with your records.",
      "Credits are awarded per key. The Complete Suite posts credit three times, once for each of its assessments, as each is passed.",
      "Borepix issues the certificate, and Borepix courses are not yet reviewed by ASRT or any RCEEM. Whether a credit counts toward a specific registry or state renewal depends on that body's rules, so check its current requirements before you rely on it.",
    ],
  },
  {
    id: "affiliation",
    question: "Is Borepix affiliated with ARRT® or ASRT?",
    answer: [
      `No. ${trademarkNotice}`,
      "Workbooks, quizzes and test keys are written by Borepix to reflect current clinical practice. They are not registry exam items, and nothing on the site predicts a registry result.",
    ],
    link: { href: "/legal/trademarks", label: "Read the trademark notice" },
  },
  {
    id: "nrtw",
    question: `How does the ${nrtw.code} promo work?`,
    answer: [
      commerceEnabled
        ? `${nrtw.name} runs ${nrtw.dates}. To mark it, the code ${nrtw.code} takes ${nrtw.percent}% off ${nrtw.eligibility}. The code opens early, on November 1, 2026, and stays valid through the last day of the week.`
        : `${nrtw.name} runs ${nrtw.dates}, the anniversary of Röntgen's discovery of the x-ray. Borepix marks the week with an offer on test keys for technologists who celebrate it with us.`,
      commerceEnabled
        ? "Enter the code in the cart or at checkout. The discount applies to the test keys and suites in your order. CE Library passes and the app license are not discounted. One code per order."
        : `While Borepix is in its ${release.label} the store is closed, so no offer can be redeemed yet. Rad Tech Week offers return when the store opens at launch.`,
    ],
    link: { href: "/#rad-tech-week", label: "See the countdown" },
  },
  {
    id: "complete-suite",
    question: "What is in the Complete Suite?",
    answer: [
      `The ${suite.name} bundles the MRI, IR and CT test keys with every workbook PDF and reference atlas, plus a combined certificate of completion.${suitePricing}`,
      `Each key in the suite is submitted on its own, so credits post as each assessment is passed: ${(suite.ceCredits ?? 0).toFixed(1)} CE credits across the three.`,
      "The bundle is a single order, which keeps departmental reimbursement to one receipt.",
    ],
    link: { href: `/store/${suite.slug}`, label: "View the Complete Suite" },
  },
  {
    id: "refunds",
    question: "What is the refund policy for keys and passes?",
    answer: [
      "A test key or suite is refundable in full until its first submission. Once an attempt has been submitted against a key, the key is consumed and is no longer refundable.",
      `The ${cePass.name} can be cancelled from your account at any time to stop the next renewal. Billing errors and duplicate charges are always refunded in full.`,
      `Email ${site.supportEmail} with your order number. Refunds go back to the original payment method.`,
    ],
    link: { href: "/legal/refunds", label: "Read the full refund policy" },
  },
  {
    id: "keys",
    question: "Where do my keys live?",
    answer: [
      "In two places. Your keys print on the receipt the moment an order completes, and they are listed in My Account on the device you bought with, each with its redeem status.",
      "Keys look like BPX-MRI-XXXX-XXXX-XXXX. Redeem one in My Account to start its attempt window. If you have switched devices, sign in on the device you bought with, or contact support with your order number.",
    ],
    link: { href: "/account", label: "Open My Account" },
  },
  {
    id: "mobile-app",
    question: "Is there a mobile app?",
    answer: [
      "Yes. The Borepix mobile app brings every workbook, every self-quiz and your purchased test keys to iOS and Android, with offline reading between cases.",
      "A 12-month license works on up to three devices signed in to the same Borepix account. Redeem the license key inside the app.",
      "The store badges on the home page link to the listings as soon as the apps are published.",
    ],
    link: { href: "/#app", label: "About the mobile app" },
  },
  {
    id: "community",
    question: `What is the ${community.partner.shortName} drive?`,
    answer: [
      `Borepix is built in Kearny, New Jersey, a few miles from ${community.partner.name}, a ${community.partner.status} serving Hoboken since ${community.partner.since}. A portion of every test key sold funds a quarterly supply drive for the shelter.`,
      `Pledges made on the site are added to the next drive and fulfilled by Borepix from the shelter's published wish lists: ${driveList}. No money is collected on the site. Pledges are recorded in My Account.`,
      `The next drive is ${community.nextDrive}. You can also give directly through the shelter's Amazon wish list, linked in the community section.`,
    ],
    link: { href: "/#community", label: "Make a pledge" },
  },
  {
    id: "support",
    question: "How do I contact support?",
    answer: [
      `Email ${site.supportEmail}. Include the order number for billing questions and the key for submission questions. That lets us answer in one reply.`,
    ],
    link: { href: `mailto:${site.supportEmail}`, label: site.supportEmail },
  },
];

/** schema.org FAQPage built from the same items the page renders, so the two can never drift. */
export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer.join(" ") },
    })),
  };
}

/**
 * Serialize JSON-LD for a <script> tag. JSON.stringify does not escape "<", so a stray "</script>" in copy
 * could break out of the tag; escaping it (per the Next.js JSON-LD guide) keeps the payload inert.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
