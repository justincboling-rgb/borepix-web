# Borepix Design System (MASTER)

Source of truth for every page and component. Generated from the ui-ux-pro-max skill
("Modern Dark Cinema" typography, dark-only cinematic style, reduced-motion and a11y rules),
then corrected: the skill's default palette was matrix green, which does not fit the brand.
The palette below is the brand's neon pink, measured for WCAG contrast.

## Brand
- Product: Borepix. The advanced modalities training and education ecosystem for Radiologic Technologists (MRI, IR, CT): free workbooks and self-quizzes, official CE test keys and library passes sold in the store, the registry-prep web app, and a mobile app. Build contract for the landing page and store: `ECOSYSTEM.md`.
- Voice: precise, calm, clinical confidence. Short declarative sentences. No hype words ("revolutionary", "ultimate"), no emoji.
- Never invent statistics, pass rates, user counts, testimonials, awards, or press logos. If a number is not true of this codebase, do not print it.
- Trademark style: first prominent use of ARRT on a page is "ARRT®". Borepix is independent and not affiliated with or endorsed by ARRT or ASRT.
- Do not name competitors (ASRT, MRI Master) in UI copy. Compare against categories ("review books", "lecture-only courses").

## Color tokens (Tailwind v4 `@theme`, use the utility names, never raw hex in components)
Pure-black base since the advanced-modality ecosystem build (see `ECOSYSTEM.md`). Pinks are measured from the logo mark.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `ink` | #000000 | page background | — |
| `ink-2` | #0A0A0A | elevated / alternating sections | — |
| `card` | #0E0E0F | cards, panels | — |
| `card-2` | #161617 | hover / nested panels | — |
| `line` | #262626 | borders, dividers (neutral-800; or `white/8`) | — |
| `fg` | #FFFFFF | primary text | 21:1 on ink |
| `muted` | #A1A1AA | secondary text | 8.3:1 ink, 7.9:1 card |
| `subtle` | #7C7C85 | tertiary text, ONLY on ink, ≥14px | 4.7:1 ink |
| `silver` | #D4D4D8 | machinery-inspired neutrals, icons | 14.5:1 |
| `pink` | #FF007F | neon accent, glows, focus, text accents on ink | 5.4:1 ink |
| `pink-strong` | #E0006F | primary button background (white text) | white 4.8:1 |
| `pink-deep` | #B8005B | pressed state of primary | — |
| `rose` | #EC4899 | secondary accent, gradients | 5.8:1 ink |
| `blush` | #FF66C4 | logo pink, eyebrow labels, links | 7.7:1 ink |
| `success` | #34D399 | correct answers (always with icon + text) | 9.7:1 card |
| `warning` | #FBBF24 | flagged items | 11.2:1 card |
| `danger` | #F87171 | incorrect answers (always with icon + text) | 6.8:1 card |

White text on `pink` (#FF007F) is only 3.8:1, so solid pink buttons use `pink-strong`.

## Typography
- Display: Sora (`font-display`), 600–700, tracking -0.02em to -0.03em, `text-balance` on headings.
- Body: Inter (`font-sans`), 400/500, 16px base, line-height 1.6, measure 60–75ch.
- Mono: JetBrains Mono (`font-mono`) for HUD readouts, scan parameters (TR 500 ms, TE 15 ms, 3.0 T), timers, scores. Use `tabular-nums`.
- Eyebrow labels: `.eyebrow` (mono, 12px, uppercase, 0.18em tracking, blush).
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60 / 72.

## Layout
- Container: `.container-x` (max-w 80rem, 16px gutters → 24px sm → 32px lg).
- Section rhythm: `py-24 sm:py-32` for landing sections; `py-8` for app pages.
- Breakpoints: 375 / 640 / 768 / 1024 / 1280. Mobile-first. No horizontal scroll at 375px.
- Z-index scale: content 0, sticky 10, nav 40, overlay 50, modal 60, toast 70.
- Radius: cards `rounded-2xl`, controls `rounded-xl`, pills `rounded-full`.

## Surfaces & effects
- `.glass`: translucent card with 1px white/8 border and blur. Use for floating UI over imagery only.
- `.panel`: solid `card` background + `line` border. Default for app UI.
- Glow: `.glow-pink` (box-shadow) on ONE primary element per view. Neon is an accent, not a fill.
- Background texture: `.bg-grid` (faint 48px grid) and radial pink haze at section tops. Subtle.
- No glitch effects, no scanline overlays, no skewed text. This is medical education, not a game.

## Motion
- Tokens: fast 150ms (hover, press), base 250ms (state change), slow 500ms (reveal). Ease `cubic-bezier(.16,1,.3,1)` for arrivals.
- Reveal on scroll: add class `reveal` (CSS scroll-driven, no JS; content is visible when unsupported or reduced motion).
- Animate only `transform` and `opacity`.
- `prefers-reduced-motion: reduce`: no scroll scrubbing (show static poster), no auto-advancing anything, instant transitions.
- Max 1–2 animated elements per viewport outside the hero.

## Components
- Buttons: `Button` / `ButtonLink` from `@/components/ui/button` — variants `primary | secondary | ghost`, sizes `sm | md | lg`. Min height 44px. One primary per view.
- Icons: `lucide-react`, stroke 1.75, sizes 16 / 20 / 24. Decorative icons get `aria-hidden`. Icon-only buttons need `aria-label`.
- Focus: visible 2px blush outline with 3px offset (global). Never remove it.
- Forms: visible labels, helper text, inline errors under the field linked by `aria-describedby`, `autocomplete` attributes.
- Correct/incorrect states: color + icon + text label. Never color alone.

## Accessibility (must pass)
- Text contrast ≥ 4.5:1 (use the token table). Large text ≥ 3:1.
- One `h1` per page, sequential headings.
- Keyboard: everything reachable and operable; Escape closes overlays; focus returns to trigger.
- Skip link to `#main` is in the root layout. Every page's main element must have `id="main"`.
- Live regions for score/timer changes use `aria-live="polite"` sparingly.

## Next.js 16 rules for this repo
- Read `node_modules/next/dist/docs/` for any API you use; this version differs from older training data.
- `cacheComponents` is on: visited routes stay mounted but hidden (React Activity). Effects run cleanup on hide and re-run on show. Do not use `new Date()`/`Math.random()` in Server Components at render; do it in client components or effects.
- Server Components by default. Add `"use client"` only to interactive leaves.
- Use `next/link` for internal links, `next/image` for content images, `next/font` (already wired).
- Client state for the web app lives in `@/lib/store/progress` (localStorage, SSR-safe via useSyncExternalStore).
