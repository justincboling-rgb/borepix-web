import { ArrowRight } from "lucide-react";
import { InteractiveDiagram } from "@/components/anatomy/interactive-diagram";
import { WorkbookCard } from "@/components/anatomy/workbook-card";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { DIAGRAM_CAPTION, getWorkbook, workbooks } from "@/data/workbooks";

/** The workbook whose diagram is embedded on the landing page. */
const FEATURED_SLUG = "mri-cross-sectional-anatomy";

/**
 * Anatomy workbooks band: the MRI axial-brain diagram on the left, the three workbook cards stacked on
 * the right, then links to the full library and the certification steps. Server component; the only
 * client leaves are the diagram and the entrance motion.
 */
export function WorkbooksSection() {
  const featured = getWorkbook(FEATURED_SLUG) ?? workbooks[0];

  return (
    <section id="anatomy" aria-labelledby="anatomy-heading" className="relative isolate border-y border-white/8 bg-ink-2 py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            id="anatomy-heading"
            eyebrow="Anatomy workbooks"
            title="Anatomy, written like a clinical workbook."
            lede="Every workbook, review guide and self-quiz on Borepix is free to read, cover to cover: objectives and key points for each module, an interactive diagram for each workbook, nothing behind a paywall. The only paid step is the official test key submission that records your CE credit."
          />
        </Reveal>

        {/* grid-cols-1 keeps the mobile track at minmax(0,1fr); an implicit auto track would grow to the chip row's min-content width. */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-8">
          <Reveal delay={0.05}>
            <InteractiveDiagram
              diagram={featured.diagram}
              hotspots={featured.hotspots}
              title={featured.title}
              caption={`${featured.title} · ${DIAGRAM_CAPTION[featured.diagram]}`}
            />
          </Reveal>

          <RevealGroup className="flex flex-col gap-4">
            {workbooks.map((workbook) => (
              <RevealItem key={workbook.slug}>
                <WorkbookCard workbook={workbook} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/anatomy" variant="secondary" size="lg">
            Browse all workbooks
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </ButtonLink>
          <ButtonLink href="/anatomy#how-it-works" variant="ghost" size="lg">
            How certification works
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
