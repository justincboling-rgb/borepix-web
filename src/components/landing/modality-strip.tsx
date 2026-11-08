import Link from "next/link";
import { Activity, Aperture, ArrowRight, Bone, Magnet, ScanLine, type LucideIcon } from "lucide-react";
import { Marquee } from "@/components/landing/marquee";
import { SectionHeading } from "@/components/ui/section-heading";
import { MODALITY_LABEL, MODALITY_SHORT } from "@/data/types";
import { cn } from "@/lib/cn";

/** Vocabulary of the suites. Read left to right by assistive tech; the second copy is hidden. */
const TERMS = [
  "3.0 T",
  "Spin Echo",
  "k-space",
  "Seldinger technique",
  "Bolus tracking",
  "Dual-energy CT",
  "SAR",
  "Zone IV",
  "CTA",
  "Embolization",
  "Tomosynthesis",
  "Diffusion",
  "Portal venous phase",
  "Parallel imaging",
  "Radial access",
  "Iterative reconstruction",
  "MQSA",
] as const;

type Pathway = {
  id: string;
  code: string;
  label: string;
  icon: LucideIcon;
  promise: string;
  tags: [string, string, string];
  href: string;
  cta: string;
};

/**
 * The five pathways, advanced suites first. MRI, IR and CT open their free workbooks; mammography opens
 * its test key; radiography is the baseline and opens the registry-prep web app.
 */
const PATHWAYS: Pathway[] = [
  {
    id: "mri",
    code: MODALITY_SHORT.mri,
    label: MODALITY_LABEL.mri,
    icon: Magnet,
    promise: "Read cross-sectional anatomy the way the sequence shows it, from TR and TE to k-space.",
    tags: ["3.0 T", "Spin Echo", "k-space"],
    href: "/anatomy/mri-cross-sectional-anatomy",
    cta: "Open the workbook",
  },
  {
    id: "ir",
    code: MODALITY_SHORT.ir,
    label: MODALITY_LABEL.ir,
    icon: Activity,
    promise: "Own the vascular pathway from access to closure, wire by wire.",
    tags: ["Seldinger", "Radial access", "Embolization"],
    href: "/anatomy/vascular-ir-pathways",
    cta: "Open the workbook",
  },
  {
    id: "ct",
    code: MODALITY_SHORT.ct,
    label: MODALITY_LABEL.ct,
    icon: ScanLine,
    promise: "Time the bolus, pick the phase and defend the dose on every protocol.",
    tags: ["Bolus tracking", "Portal venous", "Dual-energy"],
    href: "/anatomy/advanced-ct-protocols",
    cta: "Open the workbook",
  },
  {
    id: "mammo",
    code: MODALITY_SHORT.mammo,
    label: MODALITY_LABEL.mammo,
    icon: Aperture,
    promise: "Positioning that recovers tissue, a QC program that passes inspection, dose that stays in limits.",
    tags: ["CC · MLO", "Tomosynthesis", "MQSA"],
    href: "/store/mammography-positioning-qc-test-key",
    cta: "See the test key",
  },
  {
    id: "xray",
    code: "XR",
    label: "Radiography",
    icon: Bone,
    promise: "The baseline. Registry-style practice, timed mock exams and flashcards in the web app.",
    tags: ["Patient care", "Image production", "Procedures"],
    href: "/app",
    cta: "Open registry prep",
  },
];

function MarqueeRow() {
  return (
    <ul className="flex shrink-0 items-center">
      {TERMS.map((term) => (
        <li key={term} className="flex shrink-0 items-center">
          <span className="font-mono text-sm font-medium tracking-[0.12em] whitespace-nowrap text-muted uppercase">
            {term}
          </span>
          <span aria-hidden className="mx-6 size-1.5 shrink-0 rounded-full bg-pink sm:mx-8" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Directly under the hero: a seamless marquee of modality vocabulary, then one card per pathway.
 * The marquee is two identical rows translated by half their width; the global reduced-motion rule
 * freezes it on the first frame, which reads as a static strip with faded edges.
 */
export function ModalityStrip() {
  return (
    <section id="modalities" aria-labelledby="modalities-heading" className="relative bg-ink">
      <div className="border-y border-white/8">
        <Marquee label="Modality vocabulary">
          <MarqueeRow />
        </Marquee>
      </div>

      <div className="container-x py-24 sm:py-32">
        <SectionHeading
          id="modalities-heading"
          eyebrow="Five pathways"
          title="Choose the suite you are walking into."
          lede="MRI, Interventional Radiology and CT each have a free workbook, a free self-quiz and an official CE test key. Mammography has its own key. Radiography is the baseline, with registry prep in the web app."
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
          {PATHWAYS.map(({ id, code, label, icon: Icon, promise, tags, href, cta }) => (
            <li key={id} className="flex sm:last:col-span-2 lg:last:col-span-1">
              <article
                className={cn(
                  "card-lift hairline relative flex w-full flex-col rounded-2xl bg-card p-6",
                  "focus-within:border-pink/60",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blush">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="font-mono text-xs font-medium tracking-[0.18em] text-muted uppercase">{code}</span>
                </div>

                <h3 className="mt-6 text-xl font-semibold text-fg">{label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{promise}</p>

                <ul aria-label={`${label} topics`} className="mt-5 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[0.6875rem] font-medium tracking-[0.12em] text-silver uppercase"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>

                {/* The link stretches over the card so the whole panel is the target; the text stays the accessible name. */}
                <Link
                  href={href}
                  className="group mt-auto inline-flex min-h-11 items-center gap-1.5 pt-6 text-sm font-medium text-blush after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                >
                  {cta}
                  <ArrowRight
                    className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
