# Borepix Ecosystem Build Contract

Read this before touching any file under `src/`. It is the shared agreement between every component in the
advanced-modality landing page and store. `design-system/MASTER.md` still governs typography, motion limits
and accessibility; where the two differ, this file wins.

## 1. Positioning and voice

- **Product:** Borepix, the advanced modalities training and education ecosystem for Radiologic Technologists
  mastering **MRI, Interventional Radiology (IR) and CT**. Free workbooks and self-quizzes; money changes hands only
  for official **CE test keys**, **CE Library passes** and the **mobile app license**.
- **Voice:** high-ticket, confident, precise. Short declarative sentences. Authority without hype adjectives.
  No emoji. No exclamation marks in body copy.
- **Hero copy is fixed, verbatim:**
  - H1: `Most Rad Techs Stop at X-Ray. You're Here to Dominate the Suite.`
  - Sub: `The definitive intelligence and advanced modality ecosystem for Radiologic Technologists mastering MRI, Interventional Radiology, and CT. Stop guessing. Start leading.`
  - Primary CTA: `Access CE Library & Store` → `/store`
  - Secondary CTA: `Download iOS / Android App` → `/#app`
- **Community statement is fixed, verbatim** (`community.statement` in `src/data/community.ts`).
- **Footer must print:** `Privacy Policies`, `Terms of Service`, `Contact` (from `footerLegalLinks`) and
  `© 2026 Borepix. Co-founded for Radiologic Technologists.` (from `site.copyrightYear`, `site.name`, `site.copyrightTag`).
- Never invent testimonials, press logos, pass rates or user counts. Product ratings come from `src/data/products.ts` only.
- ARRT® on first prominent use per page. Borepix is independent of ARRT and ASRT.

## 2. Visual system (pure black, logo pink)

Tokens are Tailwind v4 utilities from `src/app/globals.css`. Never write raw hex in components.

| Utility | Value | Use |
|---|---|---|
| `bg-ink` | `#000000` | page background |
| `bg-ink-2` | `#0A0A0A` | alternating sections |
| `bg-card` / `bg-card-2` | `#0E0E0F` / `#161617` | panels, hover |
| `border-line` | `#262626` (neutral-800) | **the** border. Use `hairline` class or `border-line`. `border-white/8` is allowed for dividers. |
| `text-fg` | `#FFFFFF` | primary text |
| `text-muted` | `#A1A1AA` | secondary text |
| `text-subtle` | `#7C7C85` | tertiary, ≥14px only |
| `text-silver` | `#D4D4D8` | icons |
| `pink` | `#FF007F` | neon accent, glows |
| `pink-strong` / `pink-deep` | button bg / pressed |
| `blush` | `#FF66C4` | the logo pink: eyebrows, links, text accents |
| `rose` | `#EC4899` | gradient partner |
| `success` / `warning` / `danger` | states (always with icon + text) |

Classes available: `container-x`, `eyebrow`, `text-gradient`, `text-neon`, `glass`, `panel`, `hairline`, `glow-pink`,
`bg-grid`, `haze-top`, `num`, `reveal` (CSS scroll reveal), `card-lift`, `mask-fade-x`, `scrollbar-thin`, `nrtw-stripe`.
Animations: `animate-nrtw-pulse`, `animate-marquee`, `animate-ring`, `animate-float`.

Rules:
- Generous whitespace: landing sections `py-24 sm:py-32`. Section headings via `SectionHeading` (`@/components/ui/section-heading`).
- Radii: cards `rounded-2xl`, controls `rounded-xl`, pills `rounded-full`. Borders are 1px, razor sharp. No drop shadows except `shadow-panel` and the pink glows.
- One neon glow element per view. Neon is an accent, not a fill.
- Buttons: `Button` / `ButtonLink` from `@/components/ui/button` (`primary | secondary | ghost`, `sm | md | lg`). Min 44px tall. One primary per view.
- Icons: `lucide-react`, `strokeWidth={1.75}`, `aria-hidden` when decorative. Icon-only buttons need `aria-label`.
- Badges: `Badge` from `@/components/ui/badge` (`neon | neutral | success | warning | outline`).
- Ratings: `RatingStars` from `@/components/ui/rating-stars`.
- Entrance motion: `Reveal`, `RevealGroup`, `RevealItem` from `@/components/ui/reveal` (Framer Motion, reduced-motion safe) or the CSS `reveal` class. Animate only `transform` and `opacity`. Max 1–2 animated elements per viewport outside the hero.
- Typography: display `font-display` (Sora) for headings, `font-sans` (Inter) body, `font-mono` (JetBrains Mono) for readouts, SKUs, keys, prices in tables (`num`).
- Mobile first. No horizontal scroll at 375px. Tap targets ≥ 44px.

## 3. Stack and Next.js 16 rules

- Next.js 16.4 App Router with `cacheComponents: true`, React 19.3, Tailwind v4, Framer Motion 12, Zustand 5, Three 0.180, lucide-react.
- Server Components by default. Add `"use client"` only to interactive leaves. Pages and sections that merely compose data are server components.
- **Never call `Date.now()`, `new Date()` or `Math.random()` during render of a Server Component.** Use `useNow()` from `@/lib/hooks/use-now` (returns `null` until mounted) in client components for anything date-dependent. Render a neutral state while it is null.
- Dynamic routes need `generateStaticParams()` and must `notFound()` on unknown slugs. Type params as `{ params: Promise<{ slug: string }> }`. The default export is a **static shell** (`<main>` plus backgrounds) that renders an `async` body component inside `<Suspense fallback={<PageSkeleton />}>`; only the body awaits `params`. Awaiting `params` at the top of the page trips the dev overlay's `instant-shell-url-data` error under `cacheComponents` + `partialPrefetching` (see `src/app/(marketing)/store/[slug]/page.tsx`).
- Never call `new Date()` / `Date.now()` while rendering a Client Component that is mounted on every route (the cart drawer, checkout, toast): use `usePricingClock()` from `@/lib/store/cart` or `useNow()` and pass the date in. Event handlers may call `new Date()` freely.
- Metadata: export `metadata` (or `generateMetadata`) from every page with `title`, `description`, `alternates.canonical`.
- Links: `next/link`. Images: `next/image` for raster, inline SVG for generated art. The logo is `/logo.png` via `Logo` from `@/components/site/logo`.
- `next/dynamic` with `ssr: false` is only allowed inside a client component.
- Hydration safety: persisted stores skip hydration until `<StoreHydrator />` mounts (already in the marketing layout). Any UI that depends on stored state must look correct in the empty state for the first paint.
- Every page's `<main>` has `id="main"`. One `h1` per page. Sequential headings.
- Run from `borepix-web/`: `npx tsc --noEmit` and `npx eslint <your files>` must be clean for your files before you finish.

## 4. Data (`src/data`)

- `types.ts`: all shared types (`Product`, `Workbook`, `QuizQuestion`, `Order`, `Pledge`, labels).
- `products.ts`: catalogue, `getProduct(slug)`, `getProductById(id)`, `featuredProducts` (the three landing keys).
- `nrtw.ts`: National Radiologic Technology Week, Nov 8–14, 2026, code `NRTW2026`, 30% off. `getNrtwStatus(now)` gives phase and countdown. Promo is already active (early access from Nov 1).
- `community.ts`: Kearny shelter copy, drive items, pledge tiers.
- Owned by builders: `workbooks.ts` (anatomy builder), `quizzes.ts` + `quiz-questions.ts` (quiz builder), `faq.ts` and `about.ts` (content builder).

## 5. Stores (`src/lib/store`)

`useCart` (`@/lib/store/cart`):
```ts
const add = useCart((s) => s.add);            // add(productId, qty?, { openDrawer?: boolean })
const buyNow = useCart((s) => s.buyNow);      // buyNow(productId) → opens checkout for that line only
const openDrawer = useCart((s) => s.openDrawer);
const openCheckout = useCart((s) => s.openCheckout);
const lines = useCart((s) => s.lines);        // { productId, qty }[]
const count = useCartCount();                 // units in cart
const totals = useCartTotals();               // { subtotal, discount, total, itemCount, promo, promoError }
const checkoutLines = useCheckoutLines();     // ResolvedLine[] = { product, qty }[] for the checkout
applyPromo(code) → PromoResult; removePromo(); setQty(id, n); remove(id); clear();
drawerOpen / closeDrawer; checkoutOpen / closeCheckout; completeCheckout(); lastAdded / clearLastAdded()
```
`useOrders` (`@/lib/store/orders`):
```ts
placeOrder({ lines, totals, email, name, payment: { brand, last4 } }) → Order (keys generated per unit)
redeemKey(raw) → { ok, productId, alreadyRedeemed } | { ok: false, reason }
addPledge(amount, "one-time" | "monthly", name | null) → Pledge; removePledge(id)
orders, redeemed, pledges; useLicenseKeys(); pledgeSummary(pledges)
```
Pricing helpers (`@/lib/pricing`): `formatPrice(n)`, `computeTotals`, `validatePromo`. Card helpers (`@/lib/keys`):
`detectCardBrand`, `luhnValid`, `formatCardNumber`, `formatExpiry`, `expiryValid`, `cvcValid`, `CARD_BRAND_LABEL`.
Learner profile (sign-in) is the existing `@/lib/store/progress` (`useProgress().profile`, `/login`, `/signup`).

## 6. Routes and file ownership

| Route / file | Owner | Notes |
|---|---|---|
| `src/app/(marketing)/layout.tsx`, `page.tsx` | lead | Composes the sections below in this order: `Hero`, `ModalityStrip`, `WorkbooksSection`, `QuizSection`, `StoreSection`, `NrtwSection`, `CommunitySection`, `AppSection`, `Faq`, `FinalCta`. |
| `src/components/site/nav.tsx`, `nrtw-banner.tsx`, `cart-trigger.tsx`, `footer.tsx`, `json-ld.tsx` | site shell | Sticky glass nav (not fixed; it sits below the banner in flow), links from `marketingNav`, `ceLibraryCta` button, cart trigger with badge. |
| `src/components/landing/hero.tsx`, `modality-strip.tsx`, `app-section.tsx`, `app-badges.tsx` | hero | Hero embeds `<MriDome />` from `@/components/landing/dome/mri-dome` (client, self-contained, fills its parent; give it a container ≥ 440px tall). `AppSection` has `id="app"`. |
| `src/components/landing/dome/*` | lead | Three.js exploded MRI dome + patient simulation. Do not edit. |
| `src/data/workbooks.ts`, `src/components/landing/workbooks-section.tsx`, `src/components/anatomy/**`, `src/app/(marketing)/anatomy/page.tsx`, `anatomy/[slug]/page.tsx` | anatomy | Three workbooks with interactive SVG diagrams, free review guides, link to the certifying test key. |
| `src/data/quizzes.ts`, `src/data/quiz-questions.ts`, `src/components/landing/quiz-section.tsx`, `src/components/quiz/**`, `src/app/(marketing)/quizzes/page.tsx`, `quizzes/[slug]/page.tsx` | quizzes | Three quizzes, ≥ 12 original questions each, full quiz engine with navigation, scoring, rationales. |
| `src/components/landing/store-section.tsx`, `src/components/store/**`, `src/app/(marketing)/store/page.tsx`, `store/[slug]/page.tsx` | store | Amazon-style grid: search, category filter, sort, stock badges, ratings, Add to Cart, Buy Now. Product art is generated SVG per `product.art`. |
| `src/components/commerce/cart-drawer.tsx`, `checkout-modal.tsx`, `cart-toast.tsx`, `order-receipt.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/dialog.tsx`, `src/components/account/**`, `src/app/(marketing)/account/page.tsx` | commerce | Slide-over cart, promo input (`NRTW2026`), simulated Stripe checkout, receipt with license keys, My Account (profile, orders, keys, redeem, pledges). |
| `src/data/faq.ts`, `src/data/about.ts`, `src/components/landing/nrtw-section.tsx`, `community-section.tsx`, `src/components/community/pledge-widget.tsx`, `src/components/landing/faq.tsx`, `final-cta.tsx`, `src/app/(marketing)/faq/page.tsx`, `about/page.tsx` | content | NRTW section with countdown and code, Kearny community section with one-click pledge widget, FAQ (native details), About Us, final CTA. |

Cross-component imports must use only the exports named in this file. If you need something another owner
has not exported, build it locally in your own files rather than editing theirs.

## 6b. Affiliate program and founder dashboard (lead-owned)

- `src/lib/store/affiliates.ts`: `useAffiliates` (join, signIn, signOut, captureReferral, recordPayout), `affiliateStats`,
  `commissionFor`, `referralLink`, `useCurrentAffiliate`. Terms live in `affiliateProgram` in `src/lib/site.ts` (40%, 30-day
  attribution, $50 minimum, monthly Stripe/PayPal payouts).
- `?ref=CODE` is captured by `StoreHydrator`; `placeOrder` stamps `order.referralCode` from the active referral.
- `/affiliates` (`src/components/affiliates/affiliate-program.tsx`): sign-up form, then the partner portal (code, link,
  earned / paid / due, attributed orders). `/admin` (`src/components/admin/founder-dashboard.tsx`): KPIs, partner payout
  table with simulated payouts and CSV export, recent orders. `/admin` is `noindex` and must be gated by real auth before launch.
- Landing additions: `DomeBlueprint` (hardware specs from `dome/parts.ts`) after the modality strip; `AffiliateCta` after the
  community section. Header shows `site.motto` ("Enter the Dome") under the wordmark, a `Log in` ghost button and, at xl, `Become an Affiliate`.

## 6c. Alpha/Beta release mode (Nov 2026)

- `release` and `commerceEnabled` in `src/lib/site.ts`. While `commerceEnabled` is false: no price, dollar amount or purchase control renders anywhere customer-facing; `add`, `buyNow` and `openCheckout` in the cart store are no-ops; `ReleaseBanner` shows the Beta notice instead of the NRTW offer; product cards and the buy box show `LaunchBadge` / `LaunchNotify`; the pledge widget takes in-kind item pledges; the affiliate portal hides money. Flip the flag at launch and everything returns.
- Header: one line at every desktop width (`sticky top-0 z-50 bg-black/80 backdrop-blur-md`), lowercase wordmark `borepix` with the motto "Enter the dome" in bold silver, six links from `marketingNav`, then the cart icon, the person icon (`AuthMenu`: log in / create account, or account / dashboard / settings / sign out) and the CE Library CTA. No "Log in" or "My Account" text links.
- Copy rules: "Radiologic Technologists" is always capitalized; the company is in Kearny, New Jersey; support is info@borepix.com; the hero reads "Your pathway to mastery of modalities" with the sub "The definitive intelligence and advanced modality ecosystem for Radiologic Technologists in X-Ray, IR, CT and mastering MRI. Stop guessing. Start leading."
- The dome stage is borderless (transparent canvas on the hero's lighting) and turns and explodes with page scroll (`inputs.scroll`).
- Partner shelter: the company is in Kearny; the drives support **The Hoboken Shelter** (`community.partner` in `src/data/community.ts`, rendered by `PartnerShelter` under the community grid). Its mission statement, stats, wish-list and impact-report links, address, phone and contact are the shelter's official messaging; never paraphrase the mission or invent figures.

## 7. Commerce flow (must work end to end)

1. Product card `Add to Cart` → `add(id, 1, { openDrawer: false })`; the toast shows "Added to cart" with a `View cart` action. `Buy now` → `buyNow(id)`.
2. Cart drawer: lines with quantity stepper, remove, promo input, subtotal / discount / total, `Checkout` → `openCheckout()`.
3. Checkout modal (simulated Stripe): email, name on card, card number (Luhn, brand icon), expiry, CVC, country/ZIP; promo already applied shows; `Pay $X` → 1.4 s processing state → `placeOrder` → receipt with order number and one license key per unit, `Copy`, `Go to My Account`. Escape and backdrop close; focus trapped; focus returns to the trigger.
4. Account page: signed-out state offers `/login` and `/signup` but still shows this device's orders; keys list with redeem status; `Redeem a key` input; pledges list.

## 8. Accessibility (must pass)

Contrast ≥ 4.5:1 with the token table; keyboard reachable; Escape closes overlays; `aria-live="polite"` for cart and quiz status changes; forms have visible labels, `autocomplete`, inline errors linked by `aria-describedby`; correct / incorrect states use color + icon + text.

## 9. Security and legal hardening (Nov 2026)

- **Legal routes.** `/terms`, `/privacy`, `/disclaimer` and `/dmca` are the canonical policies (`src/app/(marketing)/<slug>/page.tsx` → `LegalPage`); `/legal/refunds` and `/legal/trademarks` stay under `/legal`. Content lives in `src/lib/content/legal.ts`; paths in `legalPages` (`legalHref(slug)`); the renderer is `src/components/legal/legal-document.tsx`. Old `/legal/terms|privacy|disclaimer` URLs redirect permanently (`next.config.ts`). Copyright and DMCA mail goes to `legalEmail`; the entity is `legalEntity` ("Borepix LLC").
- **Headers.** `next.config.ts` sets X-Frame-Options DENY, nosniff, HSTS (2 years, preload), Referrer-Policy, Permissions-Policy and a baseline CSP (self-hosted scripts/styles/fonts; `data:`/`blob:` images and workers for the dome; no framing; dev adds `unsafe-eval` and WebSockets for HMR). Adding a third-party script or font means extending the CSP first. Vercel Web Analytics (`<Analytics />` in `src/app/layout.tsx`) is same-origin in production; its development debug host `va.vercel-scripts.com` is the one external `script-src` entry, dev only.
- **Secrets.** Only `NEXT_PUBLIC_SITE_URL` may reach the browser. `npm run build` runs `scripts/check-env.mjs` first and fails on secret-looking `NEXT_PUBLIC_` names or credential literals in `src/`. `.env.example` documents every variable.
- **Sessions.** `/admin` is gated by `src/proxy.ts`: `ADMIN_ACCESS_KEY` (server-only) is exchanged once for an HTTP-only, Secure, SameSite cookie; production fails closed without the key. Future account sessions use `src/lib/server/session-cookie.ts` (HTTP-only `borepix_session`), never localStorage.
- **Validation.** Every form parses its input with the Zod schemas in `src/lib/schemas/`; the same schemas are the contract for server actions and route handlers when the backend lands.
- **Clickwrap.** The sign-up checkbox (`src/components/auth/signup-form.tsx`) is unchecked by default and required; its label names the Terms of Service, Privacy Policy and Educational Disclaimer, and the error copy is `TERMS_MESSAGE` from `src/lib/schemas/auth.ts`.
- **Errors.** `src/app/error.tsx` is the generic route error boundary (message plus Next.js digest; no stack traces reach the browser).
- **Specs.** `docs/security/` (`auth.md`, `security.md`, `RLS-policies.md`, `env.md`, `threat-model.md`, `audit-2026-11-13.md`) is binding for every backend addition; `CLAUDE.md` at the project root tells AI sessions to read it first. Server helpers for the backend live in `src/lib/server/` (session cookie, rate limit, CORS allowlist).
