import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";

export type LabHeadingLevel = "h2" | "h3";

export type LabProps = {
  /** Heading level for the lab title. Sub-headings inside the lab use the next level down. Defaults to h2. */
  headingLevel?: LabHeadingLevel;
  className?: string;
};

type LabFrameProps = {
  id: string;
  title: string;
  /** One line on what the lab teaches. */
  caption: string;
  headingLevel?: LabHeadingLevel;
  className?: string;
  children: ReactNode;
};

/**
 * Shared shell for every interactive lab: eyebrow, title, teaching caption and a panel body.
 * The body is a size container, so lab layouts respond to the space they get (a lesson column,
 * a full-width page or a landing section) rather than to the viewport.
 */
export function LabFrame({ id, title, caption, headingLevel = "h2", className, children }: LabFrameProps) {
  const Heading = headingLevel;
  const headingId = `${id}-title`;
  const captionId = `${id}-caption`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-describedby={captionId}
      className={cn("panel scroll-mt-24 overflow-hidden rounded-2xl", className)}
    >
      <header className="border-b border-white/8 px-5 py-5 sm:px-7">
        <p className="eyebrow">
          <FlaskConical className="size-4" strokeWidth={1.75} aria-hidden />
          Interactive lab
        </p>
        <Heading id={headingId} className="mt-3 text-xl font-semibold text-fg sm:text-2xl">
          {title}
        </Heading>
        <p id={captionId} className="mt-2 max-w-[70ch] text-[0.95rem] leading-relaxed text-muted">
          {caption}
        </p>
      </header>
      <div className="@container px-5 py-6 sm:px-7">{children}</div>
    </section>
  );
}
