/*
 * Template legal copy. Must be reviewed by qualified counsel before launch.
 *
 * Structured content for /legal/[slug]. Prices, renewal wording and notices are pulled from
 * src/lib/site.ts so the legal pages can never drift from the pricing section or the footer.
 *
 * Inline conventions understood by the legal page renderer:
 * - Another legal document's exact title (e.g. "Refund Policy") becomes a link to that page.
 * - Email addresses become mailto links; https:// URLs become links.
 * - `backticks` render as inline code.
 */

import { getProduct } from "@/data/products";
import { educationalNotice, legalEmail, legalEntity, legalPages, site, trademarkNotice, type LegalSlug } from "@/lib/site";

export const LEGAL_LAST_UPDATED = "November 13, 2026";
export const LEGAL_LAST_UPDATED_ISO = "2026-11-13";

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  /** Highlighted paragraph for the one point a reader must not miss. */
  | { kind: "note"; text: string };

export type LegalSection = {
  /** Anchor id, unique within the document. */
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  slug: LegalSlug;
  title: string;
  /** Meta description and the lede under the page title. */
  description: string;
  /** Plain-language key points shown in the "In short" box. */
  summary: string[];
  sections: LegalSection[];
};

/* ───────────── helpers ───────────── */

const p = (text: string): LegalBlock => ({ kind: "p", text });
const list = (...items: string[]): LegalBlock => ({ kind: "list", items });
const note = (text: string): LegalBlock => ({ kind: "note", text });

const TITLE = Object.fromEntries(legalPages.map((page) => [page.slug, page.title])) as Record<LegalSlug, string>;

const cePass = getProduct("ce-library-annual-pass");
if (!cePass) throw new Error('legal.ts: missing product "ce-library-annual-pass" in src/data/products.ts');
const cePassPrice = `$${Number.isInteger(cePass.price) ? cePass.price : cePass.price.toFixed(2)}`;

const email = site.supportEmail;
const siteHost = site.url.replace(/^https?:\/\//, "").replace(/\/+$/, "");

/* ───────────── Terms of Service ───────────── */

const terms: LegalDoc = {
  slug: "terms",
  title: TITLE.terms,
  description:
    "The agreement between you and Borepix for using the Borepix website, store, web app and mobile app, including test keys, CE Library passes, automatic renewal and acceptable use.",
  summary: [
    "Borepix is an educational provider for Radiologic Technologists. It is independent and not affiliated with ARRT® or ASRT.",
    "Workbooks and self-quizzes are free. Test keys, suites, CE Library passes and app licenses are sold in the store and delivered as license keys.",
    `Test keys and app licenses are one-time purchases. The ${cePass.name} renews at ${cePassPrice} per year until you cancel. You can cancel anytime.`,
    "Use Borepix for your own study. Do not share your account or keys, copy the question banks, or post real exam content.",
    `Everything on the Service belongs to ${legalEntity}. Disputes are resolved by binding individual arbitration, and class actions are waived; you can opt out of arbitration within 30 days of first accepting these Terms.`,
  ],
  sections: [
    {
      id: "agreement",
      heading: "Agreement to these terms",
      blocks: [
        p(
          `These Terms of Service ("Terms") are an agreement between you and ${legalEntity} ("Borepix", "we", "us"). They cover the website at ${siteHost}, the Borepix web app, the Borepix mobile app once it is released, and related emails and support (together, the "Service").`,
        ),
        p("By using the Service, you agree to these Terms. If you do not agree, do not use the Service."),
        p(
          "The Privacy Policy, Refund Policy, Educational Disclaimer and Trademark Notice are part of these Terms.",
        ),
      ],
    },
    {
      id: "free-and-paid",
      heading: "What is free and what is paid",
      blocks: [
        p(
          "The anatomy workbooks, review guides and self-quizzes are free to read and use without an account. Official test key submissions, Complete Suites, CE Library passes and mobile app licenses are paid products sold in the store and delivered as license keys to your account and by email.",
        ),
        note(
          "Your study progress in the web app, and any profile details you enter, are saved in your browser's local storage on your device. Clearing your browser data, using a private window, or switching devices or browsers can remove or hide that progress. Keep your license keys from your order confirmation email so they are never lost with it.",
        ),
      ],
    },
    {
      id: "accounts",
      heading: "Eligibility and accounts",
      blocks: [
        p("These rules apply to your account:"),
        list(
          "You must be at least 18 years old, or the age of majority where you live, to make a purchase. If you are younger, a parent or guardian must agree to these Terms for you.",
          "Give accurate information when you create an account, and keep it up to date.",
          "An account is for one person. Do not share your login, your license keys or your pass with anyone else.",
          `Keep your password secure. Tell us promptly at ${email} if you think someone else has used your account.`,
          "You are responsible for activity on your account.",
        ),
      ],
    },
    {
      id: "purchases",
      heading: "Store purchases, test keys and automatic renewal",
      blocks: [
        p("The store sells four kinds of product. Prices are in U.S. dollars and do not include tax unless shown at checkout."),
        list(
          "Test keys: a one-time purchase. Each key unlocks one scored assessment with the number of attempts and the completion window printed on its product page. A key is consumed by its first submission.",
          "Complete Suites: a bundle of test keys and workbook materials, delivered as one key per included assessment.",
          `${cePass.name}: ${cePassPrice} per year. It renews every 12 months until you cancel. We email a reminder at least 30 days before each renewal, and the confirmation email repeats these terms and explains how to cancel.`,
          "Mobile app licenses: a one-time purchase that unlocks the app for 12 months. Licenses do not renew automatically.",
        ),
        p(
          `When you buy a renewing pass, you authorize Borepix and its payment processor to charge your payment method at the start of each term until you cancel. You can cancel anytime from your account, as easily as you signed up, or by emailing ${email}. Cancelling stops future renewals; your access continues until the end of the term you have already paid for.`,
        ),
        p(
          "If we change a pass price, we will email you at least 30 days before the new price applies to you. It takes effect at your first renewal after that notice, and you can cancel before then.",
        ),
        p(
          "License keys are issued to the account that bought them and are for that person's use. Do not sell, share or publish a key. We may void keys that are shared or obtained through a fraudulent payment.",
        ),
        p("If a payment fails or is reversed, we may suspend the related keys until the balance is paid."),
      ],
    },
    {
      id: "refunds",
      heading: "Refunds",
      blocks: [
        p(
          `Test keys and suites are refundable in full until a key's first submission. The ${cePass.name} can be cancelled anytime to stop the next renewal. Billing errors are always refunded. The Refund Policy explains the details and how to ask for a refund.`,
        ),
      ],
    },
    {
      id: "acceptable-use",
      heading: "Acceptable use",
      blocks: [
        p("Use the Service only for your own study. You agree not to:"),
        list(
          "Share, sell or transfer your account or your access.",
          "Copy, bulk-download, scrape or redistribute questions, rationales, flashcards, lessons or other content.",
          "Post, share or ask for recalled items or other confidential content from actual ARRT examinations.",
          "Use Borepix content to build or train another product, including an AI model.",
          "Enter protected health information, patient identifiers or identifiable patient images anywhere in the Service.",
          "Probe, disrupt or bypass the Service's security, or access it with bots or other automated tools.",
          "Use the Service in a way that breaks the law or infringes anyone's rights.",
        ),
      ],
    },
    {
      id: "content",
      heading: "Intellectual property and your license",
      blocks: [
        p(
          `Borepix writes its own workbooks, practice questions, rationales, flashcards, lessons, diagrams and interactive labs. That content, the question and test-key banks, the Borepix name and logo, and the software and design of the Service are the property of ${legalEntity} and are protected by United States and international copyright, trademark and other intellectual-property laws. Copyright © ${site.copyrightYear} ${legalEntity}. All rights reserved.`,
        ),
        p(
          "While you follow these Terms, we give you a limited, personal, non-exclusive, non-transferable, revocable license to access the Service and use its content for your own study and continuing education. The license ends when your access ends or when these Terms are terminated. Instructors and programs that want to use Borepix with a class should contact us first.",
        ),
        p("Under this license you may not:"),
        list(
          "Copy, download, scrape, record, screenshot in bulk, or otherwise reproduce question banks, test-key assessments, rationales, workbooks or diagrams, in whole or in part.",
          "Sell, rent, sublicense, share, publish or distribute Service content, license keys or account access, including on study-sharing or question-dump sites.",
          "Modify, translate, reverse engineer, decompile or create derivative works from the Service or its content, or remove copyright and trademark notices.",
          "Use automated tools, bots, crawlers or AI training pipelines to access, extract or train on Service content without our written permission.",
          "Use the Service to build a competing product or to assist anyone else in doing so.",
        ),
        p(
          `All rights not expressly granted in these Terms are reserved by ${legalEntity}. Copyright complaints are handled under the DMCA Copyright Notice.`,
        ),
        p("If you send us feedback or report an error, we may use it to improve the Service without owing you anything for it."),
      ],
    },
    {
      id: "study-aid",
      heading: "A study aid, not a guarantee",
      blocks: [
        p(
          "Borepix helps you prepare. It does not guarantee that you will pass any exam or earn any credential. Readiness scores and analytics reflect only your answers inside Borepix. They are estimates, not official scores or predictions from ARRT.",
        ),
        p("Nothing in the Service is medical advice. The Educational Disclaimer explains the limits of what Borepix teaches."),
      ],
    },
    {
      id: "third-party-names",
      heading: "Third-party names",
      blocks: [
        p(
          "Names such as ARRT are used only to describe the exams Borepix helps you prepare for. That use does not mean their owners sponsor or endorse Borepix. See the Trademark Notice.",
        ),
      ],
    },
    {
      id: "mobile-app",
      heading: "Mobile app",
      blocks: [
        p(
          "The Borepix mobile app is in development and is not yet available in the Apple App Store or Google Play. When it launches, the app store's terms also apply to your download and to any purchase made through the store. Where those terms conflict with these Terms on a store-specific point, the store's terms control that point.",
        ),
      ],
    },
    {
      id: "changes-and-termination",
      heading: "Changes, suspension and termination",
      blocks: [
        p(
          "We are actively building Borepix and may add, change or remove features and content. If a change materially reduces what a purchased key or pass includes, we will tell you, and you may ask for a refund of the unused part under the Refund Policy.",
        ),
        p(
          "You can stop using the Service at any time. We may suspend or end your access if you break these Terms, for example by sharing keys or copying content. If we void keys or end a pass because you broke these Terms, no refund is due. If we end them for any other reason, we will refund the unused keys or the unused part of your current term.",
        ),
      ],
    },
    {
      id: "disclaimers",
      heading: "Disclaimers",
      blocks: [
        p(
          'The Service is provided "as is" and "as available." To the fullest extent the law allows, Borepix disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy and non-infringement.',
        ),
        p(
          "We work to keep content accurate and current, but we do not promise that the Service will be error-free or uninterrupted, or that it will match the current content of any exam.",
        ),
      ],
    },
    {
      id: "liability",
      heading: "Limitation of liability",
      blocks: [
        p(
          "To the fullest extent the law allows, Borepix is not liable for indirect, incidental, special, consequential or punitive damages, or for lost data, lost profits or exam outcomes, arising from your use of the Service.",
        ),
        p(
          "Our total liability for any claim about the Service is limited to the amount you paid Borepix in the 12 months before the claim arose, or $100 if you have not paid anything.",
        ),
        p(
          "You agree to cover Borepix's reasonable costs, including legal fees, for claims that arise because you broke these Terms or the law.",
        ),
        p("Some places do not allow these limits, so they may not apply to you in full."),
      ],
    },
    {
      id: "arbitration",
      heading: "Binding arbitration and class-action waiver",
      blocks: [
        note(
          "Please read this section carefully. It requires you and Borepix to resolve most disputes through binding individual arbitration instead of a court trial, and it waives the right to bring or join a class action. You can opt out within 30 days.",
        ),
        p(
          `Informal resolution first. If you have a dispute with Borepix, email ${email} with your name, contact details and a description of the problem. We will do the same if we have a dispute with you. Both sides agree to try in good faith to resolve the dispute informally for 30 days before starting arbitration or any other proceeding.`,
        ),
        p(
          `Agreement to arbitrate. Except for the matters listed below, any dispute, claim or controversy between you and ${legalEntity} arising out of or relating to these Terms or the Service, whether based in contract, tort, statute or any other legal theory, and including disputes about the scope or enforceability of this section, will be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules, as modified by this section. The Federal Arbitration Act governs the interpretation and enforcement of this section.`,
        ),
        p(
          "How arbitration works. One neutral arbitrator decides the dispute. The arbitrator can award the same individual relief a court could, must follow these Terms, and will issue a written decision. Hearings take place by video, by telephone, by written submission, or in the county where you live, at your choice. Borepix will pay the AAA filing, administrative and arbitrator fees for claims under $10,000 unless the arbitrator finds the claim frivolous. Judgment on the award may be entered in any court with jurisdiction.",
        ),
        p(
          "Class-action and jury waiver. To the fullest extent the law allows, you and Borepix agree that each may bring claims against the other only in an individual capacity, and not as a plaintiff or class member in any purported class, collective, consolidated or representative proceeding. The arbitrator may not consolidate more than one person's claims or preside over any form of class or representative proceeding. You and Borepix each waive the right to a jury trial. If this class-action waiver is found unenforceable for a particular claim, that claim will proceed in court, not in arbitration, and the rest of this section still applies to every other claim.",
        ),
        p(
          "Exceptions. Either side may bring an individual claim in small-claims court if it qualifies there, may seek a court order to stop unauthorized use or infringement of intellectual property, and may report a concern to a government agency. Nothing in this section waives rights that the law does not allow to be waived.",
        ),
        p(
          `Thirty-day opt-out. You may reject this arbitration agreement by emailing ${email} within 30 days of the date you first accept these Terms, with the subject line "Arbitration opt-out", your name and the email address on your account. Opting out does not affect any other part of these Terms. If you opt out, disputes will be resolved in the courts described in the next section.`,
        ),
        p(
          "Changes. If we change this arbitration section after you accept these Terms, you may reject the change by emailing us within 30 days of the change, in which case the version you last accepted applies to disputes that arose before the change.",
        ),
      ],
    },
    {
      id: "disputes",
      heading: "Governing law and venue",
      blocks: [
        p(
          `These Terms are governed by the laws of the State of New Jersey and the federal laws of the United States, without regard to conflict-of-law rules. For any dispute that is not subject to arbitration, you and ${legalEntity} agree to the exclusive jurisdiction of the state and federal courts located in Hudson County, New Jersey, and waive any objection to venue there. Nothing in these Terms limits consumer rights that the law does not allow to be waived, including the right to bring claims in your home jurisdiction where the law requires it.`,
        ),
        p(
          "If any part of these Terms is found unenforceable, the rest stays in effect. Our failure to enforce a provision is not a waiver of it. These Terms, together with the Privacy Policy, Refund Policy, Educational Disclaimer, Trademark Notice and DMCA Copyright Notice, are the entire agreement between you and Borepix about the Service.",
        ),
      ],
    },
    {
      id: "changes-to-terms",
      heading: "Changes to these terms",
      blocks: [
        p(
          "We will update these Terms as Borepix grows, for example when accounts and payments launch. We will change the date at the top of this page. For material changes, we will notify members by email or in the app before the changes take effect. If you keep using the Service after that, the updated Terms apply.",
        ),
      ],
    },
  ],
};

/* ───────────── Privacy Policy ───────────── */

const privacy: LegalDoc = {
  slug: "privacy",
  title: TITLE.privacy,
  description:
    "What Borepix collects, where it is stored, how the site is secured on Vercel, which cookies are used, and the choices you have. The current preview keeps your study data in your browser, not on our servers.",
  summary: [
    "The current preview has no hosted accounts. Your study progress is saved in your browser's local storage on your device, and it is not sent to Borepix.",
    "We never sell your personal information, and we never will. We do not use advertising cookies, tracking pixels or third-party analytics.",
    "The site is served over HTTPS from Vercel's secure infrastructure with strict transport security and content-security headers.",
    "Never enter patient information in Borepix. It is a study tool, not a clinical system.",
    "When hosted accounts launch, we will update this policy before we collect anything new.",
  ],
  sections: [
    {
      id: "scope",
      heading: "What this policy covers",
      blocks: [
        p(
          `This Privacy Policy explains how Borepix handles information when you use the Borepix website and web app, and the mobile app once it launches. It applies together with the Terms of Service. Questions go to ${email}.`,
        ),
      ],
    },
    {
      id: "browser-storage",
      heading: "What the preview stores in your browser",
      blocks: [
        p(
          "The web app works without an account. To remember your progress, your cart and your orders, it saves data in your browser's local storage, in entries named `borepix:progress:v1`, `borepix:cart:v1`, `borepix:orders:v1` and `borepix:app-waitlist`. That data stays on your device. It is not sent to Borepix or to anyone else.",
        ),
        p("Depending on what you use, it can include:"),
        list(
          "Profile details you type in, such as a name, email address, exam track and exam date.",
          "Your answers to practice questions, lesson checks and mock exams, including whether each was correct and how long it took.",
          "Mock exam results by content category.",
          "Flashcard review history and scheduling.",
          "Lessons you have completed and the days you studied.",
          "The products in your cart and any promo code you applied.",
          "Your orders, including the license keys issued to you, which keys you have redeemed, and community pledges you made.",
          "If you join the affiliate program: the name, email address, referral code and payout account you entered (stored under `borepix:affiliates:v1`), and the referral code captured from a partner link you followed.",
          "An email address you entered to be notified when the mobile app launches.",
        ),
        p(
          "Anyone who can use your browser profile can see this data. On a shared or public computer, clear this site's data when you finish.",
        ),
      ],
    },
    {
      id: "what-we-receive",
      heading: "What Borepix receives",
      blocks: [
        p(
          "In the preview, Borepix does not run an account server and does not receive the data stored in your browser. We receive information only in these cases:",
        ),
        list(
          "Technical request data. Borepix is hosted on Vercel. Like any website, Vercel's edge network receives standard information with each request, such as your IP address, browser type, the page requested and the time, and keeps short-lived request logs. That data is used only to deliver the site, keep it secure, prevent abuse and fix errors; it is not used to build a profile of you.",
          "Store orders. When you check out, your card details go directly to our payment processor over an encrypted connection. Borepix receives the order itself: the products, the amount, your name and email address, and the card brand and last four digits, so we can deliver your keys, send your receipt and support you. Borepix never stores your full card number.",
          "Messages you send us. If you email us, we receive your email address and whatever your message contains.",
        ),
        p(
          "We do not buy personal information, and we do not combine your information with other sources to build a profile of you.",
        ),
      ],
    },
    {
      id: "cookies",
      heading: "Cookies, analytics and third parties",
      blocks: [
        p(
          "Borepix does not use advertising cookies, tracking pixels or third-party analytics, and we do not sell or share data for advertising. Fonts, images and video are served from the Borepix site itself, so loading a page does not send your information to font or video providers.",
        ),
        p("The only browser storage and cookies the site sets are strictly necessary ones:"),
        list(
          "Local storage entries (listed above) that hold your study progress, cart, orders, pledges and affiliate details on your own device.",
          "Session storage flags that remember you dismissed the release or Rad Tech Week banner for the current browsing session.",
          "One HTTP-only, secure cookie named `borepix_admin`, set only on the founder dashboard for the Borepix team and never for visitors. It carries no personal data and cannot be read by scripts.",
        ),
        p(
          "Because none of these are used for tracking, no cookie banner is shown. If we add analytics or other cookies later, we will update this policy first and ask for your consent where the law requires it.",
        ),
      ],
    },
    {
      id: "use",
      heading: "How we use information",
      blocks: [
        list(
          "To deliver, secure and improve the Service.",
          "To answer your questions and support requests.",
          "To prevent abuse, such as account sharing or scraping, once accounts exist.",
          "To meet legal obligations.",
        ),
        p("We do not use your information to sell ads or to build advertising profiles."),
      ],
    },
    {
      id: "sharing",
      heading: "Sharing and selling",
      blocks: [
        p(
          "We do not sell your personal information, and we do not share it for cross-context behavioral advertising.",
        ),
        p(
          "We share information only with service providers that help us run Borepix, such as hosting and email providers, under terms that limit how they use it; when the law requires it; or to protect the rights, safety and security of our users and of Borepix. If Borepix is ever part of a merger or sale, information may transfer as part of that deal, and this policy will continue to apply to it.",
        ),
      ],
    },
    {
      id: "patient-information",
      heading: "No patient information",
      blocks: [
        p(
          "Borepix is an educational tool. It is not a HIPAA covered entity or business associate, and it is not designed to hold protected health information (PHI).",
        ),
        note(
          "Do not type, paste or upload patient names, identifiers, accession numbers or identifiable images, including DICOM files, anywhere in Borepix. That includes support emails.",
        ),
        p("Borepix practice content is original and is not drawn from patient records."),
      ],
    },
    {
      id: "choices",
      heading: "Your choices",
      blocks: [
        list(
          "Delete preview data by clearing this site's data in your browser settings, usually under privacy or site data. This permanently removes your saved progress.",
          "Use a private window if you do not want progress kept after you close it.",
          `Email ${email} with any privacy request or question.`,
        ),
      ],
    },
    {
      id: "accounts-launch",
      heading: "When accounts launch",
      blocks: [
        p(
          "We plan to add server-side accounts, so your progress, orders and license keys can sync between the web app and the mobile app. We will update this policy before that happens. In general terms, it will change in these ways:",
        ),
        list(
          "We will store account details, such as your name, email address and sign-in credentials, and your study progress on our servers so you can use them on any device.",
          "Payments will be handled by a payment processor. Borepix will not store your full card number.",
          "We will send account and billing emails, such as receipts and renewal reminders. Any marketing emails will be optional and include an unsubscribe link.",
          "You will be able to view, export and delete your account data.",
          "Progress saved in your browser will stay on your device unless you choose to move it into your account.",
        ),
      ],
    },
    {
      id: "retention",
      heading: "How long information is kept",
      blocks: [
        list(
          "Browser storage: until you clear it. Borepix cannot see it or delete it for you.",
          "Emails: as long as needed to help you and keep reasonable records.",
          "Request logs: for the limited period our hosting provider keeps them for security and troubleshooting.",
        ),
      ],
    },
    {
      id: "security",
      heading: "Security",
      blocks: [
        p(
          "Borepix is hosted on Vercel's secure infrastructure and served only over HTTPS, with HTTP Strict Transport Security, a content-security policy, frame-embedding protection and content-type and referrer controls enforced on every response. Private keys and credentials live only in server-side environment variables and are never shipped to the browser.",
        ),
        p(
          "Browser local storage is not encrypted on your device, so protect your device with a passcode and clear site data on shared computers.",
        ),
        p(
          "No system is perfectly secure. When hosted accounts launch, we will protect account data with industry-standard safeguards, keep sessions in secure HTTP-only cookies, and notify you of a breach as the law requires.",
        ),
      ],
    },
    {
      id: "children",
      heading: "Children",
      blocks: [
        p(
          "Borepix is built for radiologic technology students and working technologists. It is not directed to children under 13, and we do not knowingly collect personal information from them. If you believe a child has sent us personal information, email us and we will delete it.",
        ),
      ],
    },
    {
      id: "rights",
      heading: "Your privacy rights",
      blocks: [
        p(
          "Depending on where you live, including California and other U.S. states, the European Economic Area and the United Kingdom, you may have the right to know what personal information we hold about you, to get a copy, to correct or delete it, and to opt out of its sale or sharing. We do not sell or share personal information, and during the preview we usually hold nothing about you beyond emails you have sent us.",
        ),
        p(
          `To make a request, email ${email}. We will verify the request and respond within the time the law requires. We will not treat you differently for using your privacy rights.`,
        ),
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: [
        p(
          "We will update this policy when our practices change, and always before accounts or payments launch. The date at the top of this page shows the current version. For material changes, we will post a notice on the site, and email you once you have an account.",
        ),
      ],
    },
  ],
};

/* ───────────── Refund Policy ───────────── */

const refunds: LegalDoc = {
  slug: "refunds",
  title: TITLE.refunds,
  description: `How refunds work for Borepix store purchases: test keys and suites are refundable until their first submission, the ${cePass.name} can be cancelled anytime, and billing errors are always refunded.`,
  summary: [
    "Test keys and Complete Suites: a full refund until the key's first submission. A submitted key is consumed and is not refundable.",
    `${cePass.name} (${cePassPrice} per year): cancel anytime to stop the next renewal. A renewal charge is refundable if you ask within 14 days and have not submitted an assessment in the new term.`,
    "Mobile app licenses: refundable within 14 days of purchase if the key has not been redeemed in the app.",
    "Billing errors and duplicate charges are always refunded.",
  ],
  sections: [
    {
      id: "keys",
      heading: "Test keys and Complete Suites",
      blocks: [
        p(
          "A test key is a one-time purchase that unlocks one scored assessment. Until the first attempt is submitted against it, the key is unused and we will refund it in full on request, for any reason. Once an attempt has been submitted, the key is consumed and the purchase is final, whether or not the attempt passed.",
        ),
        p(
          "A Complete Suite is delivered as one key per included assessment. The suite is refundable in full until any of its keys has a submission. After that, the suite is final.",
        ),
        p("Refunds are not given for unused attempts, for an expired completion window, or because a different key would have been a better fit."),
      ],
    },
    {
      id: "pass",
      heading: cePass.name,
      blocks: [
        p(
          `The ${cePass.name} (${cePassPrice} per year) can be cancelled at any time from your account or by emailing ${email}. Cancelling stops the next renewal, and your access continues until the end of the term you paid for.`,
        ),
        p(
          "If a renewal charge takes you by surprise, email us within 14 days of the charge. If no assessment has been submitted in the new term, we will refund the renewal in full and end the pass. After 14 days, or once an assessment has been submitted in the term, the renewal is final except where the law requires otherwise.",
        ),
      ],
    },
    {
      id: "app-license",
      heading: "Mobile app licenses",
      blocks: [
        p(
          "A mobile app license bought in the Borepix store is refundable within 14 days of purchase if the key has not been redeemed in the app. Once redeemed, the license is final.",
        ),
      ],
    },
    {
      id: "cancel",
      heading: "How to cancel a pass",
      blocks: [
        p(
          `Open My Account and cancel from the pass, without calling anyone. You can also email ${email} from the address on your account and ask us to cancel. To avoid the next charge, cancel before your renewal date.`,
        ),
      ],
    },
    {
      id: "request",
      heading: "How to request a refund",
      blocks: [
        list(
          `Email ${email} from the address on your account.`,
          "Include the order number from your confirmation email or My Account, and the product.",
          "We send the refund to the original payment method and confirm by email. Your bank or card issuer controls how long the credit takes to appear.",
          "A refunded key is voided. Do not submit it after asking for a refund.",
        ),
      ],
    },
    {
      id: "exceptions",
      heading: "Billing errors and exceptions",
      blocks: [
        list(
          "If we charged you twice, charged the wrong amount, or charged you after you cancelled, we will refund the error in full.",
          "If we withdraw an assessment or end a pass for any reason other than a breach of the Terms of Service, we will refund the unused keys or the unused part of the current term.",
          "If we void keys or end a pass because the Terms of Service were broken, for example because keys were shared or resold, no refund is due.",
          "Where consumer law gives you a right to a refund, that right applies in addition to this policy.",
        ),
      ],
    },
    {
      id: "app-stores",
      heading: "Purchases through app stores",
      blocks: [
        p(
          "The mobile app is not available yet. If it offers in-app purchases when it launches, those purchases will be billed by Apple or Google, and refunds must be requested through them under their policies. Borepix cannot issue refunds for app store purchases directly.",
        ),
      ],
    },
    {
      id: "disputes",
      heading: "Before you dispute a charge",
      blocks: [
        p(
          "If something looks wrong on your statement, please email us before you file a dispute with your bank. We can usually fix billing problems faster, and a disputed charge may pause your account while it is reviewed.",
        ),
      ],
    },
  ],
};

/* ───────────── Educational Disclaimer ───────────── */

const disclaimer: LegalDoc = {
  slug: "disclaimer",
  title: TITLE.disclaimer,
  description:
    "Borepix is an independent educational tool for Radiologic Technologists and registry exam preparation only. It is not affiliated with ARRT®, does not use real exam items, is not clinical or diagnostic advice, and does not guarantee that anyone will pass a board exam.",
  summary: [
    "Borepix is an independent educational tool for Radiologic Technologists, built for registry exam preparation and continuing education only. It is not affiliated with, sponsored by, or endorsed by ARRT®.",
    "Every practice question is written by Borepix. None are actual exam items.",
    "Nothing here is clinical or diagnostic advice, and nothing replaces your clinical training, your supervising physician or physicist, or your facility's policies.",
    "Borepix does not guarantee that you will pass any board or registry exam, and no pass rate is promised or implied. Continuing education credit is recorded only for a passing test-key submission.",
  ],
  sections: [
    {
      id: "study-aid",
      heading: "A study aid",
      blocks: [p(educationalNotice)],
    },
    {
      id: "independence",
      heading: "Independent from ARRT",
      blocks: [
        p(
          "Borepix is not affiliated with, sponsored by, or endorsed by The American Registry of Radiologic Technologists (ARRT). ARRT does not review or approve Borepix content. Only ARRT determines eligibility, administers its registry examinations and awards its credentials. The Trademark Notice lists the trademarks involved.",
        ),
      ],
    },
    {
      id: "practice-questions",
      heading: "Original practice questions",
      blocks: [
        p(
          "Borepix questions, rationales and mock exams are written by Borepix to reflect the published content areas and question style of the registry exams. They are not actual exam items, they are not recalled from anyone's exam, and you should not expect to see them on test day. Mock exam scores show how you did on Borepix questions only.",
        ),
        p(
          "Do not share or seek real exam content. Sharing confidential exam material can violate ARRT's rules and put your credential at risk.",
        ),
      ],
    },
    {
      id: "exam-information",
      heading: "Exam details can change",
      blocks: [
        p(
          "Where Borepix describes exam structure, such as content categories, item counts or time limits, it relies on ARRT's published materials as of the date we checked them. ARRT can change its content specifications and exam format at any time. Confirm current details at https://www.arrt.org before you test.",
        ),
      ],
    },
    {
      id: "no-guarantee",
      heading: "No guarantee of results",
      blocks: [
        p(
          "Your result depends on your preparation, your program and the exam itself. Borepix does not guarantee that you will pass any board or registry exam or reach any score, and we do not advertise or imply a pass rate. Readiness indicators, quiz scores and analytics are estimates based only on your answers in Borepix. They are not official scores and not predictions from ARRT.",
        ),
      ],
    },
    {
      id: "not-medical-advice",
      heading: "Not medical or clinical advice",
      blocks: [
        p(
          "Borepix teaches concepts for exam preparation and continuing education. It is not medical, clinical or diagnostic advice, it is not a clinical protocol, and it must never be used to make or support a decision about a real patient, image or procedure. In practice, follow your program's instruction, your supervising radiologist or physicist, your facility's policies and procedures, and the manufacturer's instructions for equipment and devices.",
        ),
        note(
          "This matters most for MRI safety. Screening, zoning and implant decisions must follow your facility's MR safety program and current device labeling, such as MR Conditional status. Never use Borepix content to clear a patient or a device for scanning.",
        ),
      ],
    },
    {
      id: "simulations",
      heading: "Interactive labs are simplified",
      blocks: [
        p(
          "The MRI physics lab uses simplified textbook models to show how field strength, TR, TE, flip angle and other parameters affect signal, contrast, SAR and scan time. Its values are teaching approximations. They are not scanner output, and they must not be used to set protocols or estimate patient exposure.",
        ),
      ],
    },
    {
      id: "continuing-education",
      heading: "Continuing education",
      blocks: [
        p(
          "Borepix records continuing education (CE) credit only for a passing submission of an official test key. The credit value, attempt policy and completion window for each assessment are stated on its product page before you buy. Free workbooks, review guides and self-quizzes carry no credit, and time spent studying does not itself count toward any requirement.",
        ),
        p(
          "Registries, state licensing boards and employers each decide which credit they accept. Check that an assessment meets your requirement before you rely on it, and keep the certificate of completion from your account for your records.",
        ),
      ],
    },
    {
      id: "accuracy",
      heading: "Accuracy and corrections",
      blocks: [
        p(
          `We write and review content carefully, but errors happen and practice standards change. If you find a mistake, email ${email} with the question or page, and we will review it.`,
        ),
      ],
    },
  ],
};

/* ───────────── Trademark Notice ───────────── */

const trademarks: LegalDoc = {
  slug: "trademarks",
  title: TITLE.trademarks,
  description:
    "Who owns the trademarks mentioned on Borepix, how Borepix refers to them, and how to report a trademark or copyright concern.",
  summary: [
    "ARRT® is a registered trademark of The American Registry of Radiologic Technologists.",
    "Borepix is independent and is not affiliated with, sponsored by, or endorsed by ARRT.",
    "Borepix and the bp monogram are trademarks of Borepix.",
    `To report a trademark or copyright concern, email ${email}.`,
  ],
  sections: [
    {
      id: "third-party",
      heading: "Third-party trademarks",
      blocks: [
        p(trademarkNotice),
        p("Other company and product names that appear on Borepix belong to their respective owners."),
      ],
    },
    {
      id: "how-we-refer",
      heading: "How Borepix uses these names",
      blocks: [
        p(
          "Borepix uses names such as ARRT, and exam names such as Radiography and Magnetic Resonance Imaging, only to describe the exams its study materials help you prepare for. This descriptive use does not mean that any owner sponsors, endorses or reviews Borepix.",
        ),
      ],
    },
    {
      id: "borepix-marks",
      heading: "Borepix trademarks",
      blocks: [
        p("Borepix, the Borepix name and the pink bp monogram logo are trademarks of Borepix."),
        p(
          "You may refer to Borepix by name in articles, reviews and study guides. Do not use the Borepix logo, or a name or design that could be confused with it, in a way that suggests Borepix sponsors or endorses you, your product or your program, without our written permission.",
        ),
      ],
    },
    {
      id: "copyright",
      heading: "Copyright",
      blocks: [
        p(
          `Unless otherwise noted, the Borepix website, apps and content, including practice questions, rationales, flashcards, lessons and software, are © ${site.copyrightYear} Borepix. All rights reserved. The Terms of Service explain how you may use this content.`,
        ),
      ],
    },
    {
      id: "report",
      heading: "Reporting a concern",
      blocks: [
        p(`If you believe something on Borepix infringes your trademark or copyright, email ${email} with:`),
        list(
          "Your name and contact information.",
          "A description of the trademark or copyrighted work.",
          "The page address (URL) and a description of the material you are concerned about.",
          "A statement that you believe in good faith that the use is not authorized by the owner, its agent or the law.",
          "A statement that the information in your notice is accurate and that you are the owner or are authorized to act for the owner.",
          "Your physical or electronic signature.",
        ),
        p("We review every notice and remove or change material where appropriate."),
      ],
    },
  ],
};

/* ───────────── DMCA Copyright Notice ───────────── */

const dmca: LegalDoc = {
  slug: "dmca",
  title: TITLE.dmca,
  description: `How to report copyright infringement on Borepix under the Digital Millennium Copyright Act, how counter-notices work, and how to reach the ${legalEntity} copyright agent at ${legalEmail}.`,
  summary: [
    `${legalEntity} respects the intellectual property of others and expects the same of everyone who uses the Service.`,
    `To report material that infringes your copyright, email a complete DMCA notice to ${legalEmail}. We act on valid notices promptly.`,
    "If your material was removed by mistake, you can send a counter-notice. Accounts that repeatedly infringe are terminated.",
    "Knowingly misrepresenting that material infringes, or was removed by mistake, can make you liable for damages under 17 U.S.C. § 512(f).",
  ],
  sections: [
    {
      id: "policy",
      heading: "Our copyright policy",
      blocks: [
        p(
          `${legalEntity} responds to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (DMCA), 17 U.S.C. § 512. This page explains how to send a notice, what happens next, and how to respond if your own material is removed.`,
        ),
        p(
          "Borepix writes its own workbooks, questions, rationales and diagrams. If you believe that any content on the Service copies your work without permission, we want to know.",
        ),
      ],
    },
    {
      id: "notice",
      heading: "How to send a takedown notice",
      blocks: [
        p(`Send your notice by email to ${legalEmail} with the subject line "DMCA notice". To be effective under the DMCA, the notice must include:`),
        list(
          "Identification of the copyrighted work you claim has been infringed, or a representative list if several works are covered by one notice.",
          "Identification of the material you claim is infringing, with enough detail for us to find it, including the full page address (URL) and, where relevant, the question, module or image.",
          "Your name, mailing address, telephone number and email address.",
          "A statement that you have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent or the law.",
          "A statement, made under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or are authorized to act on the owner's behalf.",
          "Your physical or electronic signature.",
        ),
        note(
          "A notice that leaves out required elements may not be acted on. We may send a copy of your notice, including your contact information, to the person who posted the material.",
        ),
      ],
    },
    {
      id: "agent",
      heading: "Designated copyright agent",
      blocks: [
        p(`DMCA Agent, ${legalEntity}. Email: ${legalEmail}. Please use this address only for copyright matters; account and billing questions go to ${site.supportEmail}.`),
      ],
    },
    {
      id: "response",
      heading: "What happens after a notice",
      blocks: [
        list(
          "We review the notice and, if it is complete, remove or disable access to the material promptly.",
          "We notify the person who posted the material, where one exists, and give them the chance to send a counter-notice.",
          "We keep a record of the notice and the action taken.",
        ),
      ],
    },
    {
      id: "counter-notice",
      heading: "Counter-notices",
      blocks: [
        p(
          `If material you posted was removed and you believe the removal was a mistake or misidentification, you may send a counter-notice to ${legalEmail} with the subject line "DMCA counter-notice". It must include:`,
        ),
        list(
          "Identification of the material that was removed and the address where it appeared before removal.",
          "A statement, under penalty of perjury, that you have a good-faith belief the material was removed as a result of mistake or misidentification.",
          "Your name, mailing address, telephone number and email address.",
          "A statement that you consent to the jurisdiction of the federal district court for the judicial district in which your address is located, or, if you are outside the United States, any judicial district in which Borepix may be found, and that you will accept service of process from the person who sent the original notice or their agent.",
          "Your physical or electronic signature.",
        ),
        p(
          "On receipt of a valid counter-notice we forward it to the original complainant. Unless the complainant tells us within 10 business days that they have filed a court action seeking to restrain the material, we may restore it within 10 to 14 business days of receiving the counter-notice.",
        ),
      ],
    },
    {
      id: "repeat-infringers",
      heading: "Repeat infringers",
      blocks: [
        p(
          "Borepix terminates the accounts and voids the license keys of users who are repeat infringers, and may do so after a single serious incident.",
        ),
      ],
    },
    {
      id: "misrepresentation",
      heading: "False claims",
      blocks: [
        p(
          "Under 17 U.S.C. § 512(f), anyone who knowingly and materially misrepresents that material is infringing, or that it was removed by mistake, may be liable for damages, including costs and attorneys' fees. Consider whether a use is fair use, licensed or otherwise authorized before sending a notice.",
        ),
      ],
    },
  ],
};

/* ───────────── exports ───────────── */

export const legalDocs: Record<LegalSlug, LegalDoc> = { terms, privacy, refunds, disclaimer, trademarks, dmca };

/** Documents in the order of `legalPages` in site.ts. */
export const legalDocList: LegalDoc[] = legalPages.map((page) => legalDocs[page.slug]);

export function isLegalSlug(value: string): value is LegalSlug {
  return legalPages.some((page) => page.slug === value);
}

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return isLegalSlug(slug) ? legalDocs[slug] : undefined;
}
