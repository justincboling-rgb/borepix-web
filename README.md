# Borepix web

Landing page, store and web app for **Borepix**, the advanced modalities training and education ecosystem for Radiologic Technologists mastering MRI, Interventional Radiology and CT.

- **Stack:** Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, Three.js, lucide-react.
- **Design system:** [`design-system/MASTER.md`](design-system/MASTER.md) (tokens, typography, motion, a11y) and [`design-system/ECOSYSTEM.md`](design-system/ECOSYSTEM.md) (the landing-page and store build contract: copy, routes, stores, file ownership). Tokens live in [`src/app/globals.css`](src/app/globals.css).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint
```

Set `NEXT_PUBLIC_SITE_URL` (for example `https://www.borepix.com`) in production so canonical URLs, the sitemap and social cards point at the real domain.

## What's here

| Route | What it is |
|---|---|
| `/` | Landing page: NRTW banner, hero with the interactive Three.js MRI bore (exploded view + patient scan simulation), modality strip, anatomy workbooks, self-quiz preview, test-key marketplace, National Radiologic Technology Week section, Kearny community drive with pledge widget, mobile app, FAQ, final CTA |
| `/anatomy`, `/anatomy/[slug]` | Free clinical workbooks with interactive SVG diagrams: MRI Cross-Sectional Anatomy, Vascular IR Pathways, Advanced CT Protocols |
| `/quizzes`, `/quizzes/[slug]` | Free self-quizzes with rationales, scoring and topic breakdown |
| `/store`, `/store/[slug]` | Amazon-style storefront for CE test keys, suites, library passes and the app license: search, filters, sort, ratings, Add to Cart, Buy Now |
| `/account` | My Account: profile, orders, license keys, redeem a key, CE summary, community pledges |
| `/faq`, `/about` | FAQ and About Us |
| `/signup`, `/login` | Preview sign-up and sign-in (local only, see below) |
| `/app/**` | Registry-prep web app: dashboard, practice, mock exams, MRI Mastery lessons and labs, flashcards, settings |
| `/legal/[slug]` | Terms, privacy, refunds, educational disclaimer, trademarks |

Store, workbook, quiz, NRTW and community data live in [`src/data`](src/data). The cart and checkout UI state is [`src/lib/store/cart.ts`](src/lib/store/cart.ts); orders, license keys and pledges are [`src/lib/store/orders.ts`](src/lib/store/orders.ts); both persist to `localStorage` and hydrate after mount via `StoreHydrator`. Learner progress for the web app is [`src/lib/store/progress.ts`](src/lib/store/progress.ts).

## Release mode

`release` in [`src/lib/site.ts`](src/lib/site.ts) puts the platform in its Alpha/Beta preview: `commerceEnabled: false` hides every price and purchase control, turns the cart store's add/buy/checkout actions into no-ops, swaps the Rad Tech Week banner for the Beta notice, and switches the community widget to in-kind item pledges. The workbooks, quizzes, diagrams and accounts stay fully open. Set `commerceEnabled: true` (and update `launch`) for the public launch in March 2027.

The founder dashboard at `/admin` is not linked from the site and is `noindex`; it must sit behind real authentication before launch.

## Promotions

National Radiologic Technology Week (November 8–14, 2026) is configured in [`src/data/nrtw.ts`](src/data/nrtw.ts): code `NRTW2026`, 30% off promo-eligible products (test keys and suites), valid from November 1 through November 14, 2026 (America/New_York). The banner, section, cart and checkout all read this one file.

## The MRI bore

[`src/components/landing/dome`](src/components/landing/dome) renders the hero's MRI scanner in Three.js: five layers (cover, superconducting magnet, gradient coils, RF birdcage, patient table) that explode along the bore axis on hover, toggle or scroll, a layer legend that isolates each part, a table slider, and a scan simulation that advances the patient to isocenter while the RF coil pulses. It loads on the client only and falls back to a static diagram without WebGL.

## Legacy hero media pipeline

The previous landing page scrubbed an MRI image sequence on scroll; its frames remain under `public/frames` and `public/frames-sm` and can be rebuilt with `scripts/process-media.ps1`. The components under `src/components/landing/scroll-hero.tsx` and `src/components/landing/hero` are no longer mounted.

## Not wired up yet

This build is front-end only. Before launch:

- **Payments.** The checkout is a simulated Stripe flow: it validates the card locally, generates license keys in the browser and stores the order on the device. Connect Stripe Checkout or Payment Intents server-side, generate keys there, and email them.
- **Accounts.** Sign-up and sign-in store a profile in the browser. Connect a real auth provider so orders and keys follow the user across devices.
- **CE records.** Redeeming a key is recorded locally. The CE library, assessments and certificates need a backend.
- **Pledges.** Community pledges are recorded locally for Borepix to fulfill; no money is collected on the site.
- **App-store links.** `site.appLinks` in [`src/lib/site.ts`](src/lib/site.ts) is `null` until the apps are published; the badges open a launch-notification form until then.
- **Legal copy.** The legal pages are templates and need review by qualified counsel.
- **Content review.** Workbooks, quizzes and product descriptions should be reviewed by a credentialed R.T.(R)(MR) or (CT)/(VI) educator before sale.

## Notes

- This folder sits inside OneDrive. OneDrive syncing `node_modules`, `.next` and the frame folders can slow installs and builds and occasionally lock files on Windows. Consider moving the project out of OneDrive, or pausing sync while you build.
- `AGENTS.md` is generated by Next.js and points coding agents at the version-matched docs in `node_modules/next/dist/docs`.
