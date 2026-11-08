import Link from "next/link";
import { useId } from "react";
import { ArrowRight, Check, Clock, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Modality, type Workbook } from "@/data/types";
import { workbookMinutes } from "@/data/workbooks";
import { cn } from "@/lib/cn";

/** Short modality chip for cards. */
const MODALITY_CHIP: Record<Modality, string> = {
  mri: "MRI",
  ir: "IR",
  ct: "CT",
  mammo: "Mammo",
  all: "MR · IR · CT",
};

type Props = {
  workbook: Workbook;
  /** Heading level for the title. Cards under a page h1 use h2; under a section h2 use h3. */
  headingLevel?: "h2" | "h3";
  className?: string;
};

/**
 * Workbook card: modality and Free badges, title, summary, module count and total reading time
 * computed from the data. The title is the accessible link and it stretches over the whole panel.
 */
export function WorkbookCard({ workbook, headingLevel: Heading = "h3", className }: Props) {
  const titleId = useId();
  const href = `/anatomy/${workbook.slug}`;
  const minutes = workbookMinutes(workbook);
  const moduleCount = workbook.modules.length;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "card-lift hairline group relative flex h-full flex-col rounded-2xl bg-card p-5 focus-within:border-pink/60 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="outline">{MODALITY_CHIP[workbook.modality]}</Badge>
        <Badge tone="success">
          <Check className="size-3" strokeWidth={2.5} aria-hidden />
          Free
        </Badge>
        <span className="ml-auto font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">
          {workbook.level}
        </span>
      </div>

      <Heading id={titleId} className="mt-4 text-xl font-semibold leading-snug text-fg">
        <Link
          href={href}
          prefetch
          className="rounded-md transition-colors duration-150 group-hover:text-blush after:absolute after:inset-0 after:rounded-2xl after:content-['']"
        >
          {workbook.title}
        </Link>
      </Heading>

      <p className="mt-2 text-sm leading-relaxed text-muted">{workbook.summary}</p>

      <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
          <dt className="sr-only">Modules</dt>
          <dd className="num text-fg">{moduleCount} modules</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
          <dt className="sr-only">Reading time</dt>
          <dd className="num text-fg">{minutes} min</dd>
        </div>
      </dl>

      <p className="mt-auto flex items-center gap-1.5 border-t border-white/8 pt-4 text-sm font-medium text-blush">
        Open the workbook
        <ArrowRight
          className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
          strokeWidth={1.75}
          aria-hidden
        />
      </p>
    </article>
  );
}
