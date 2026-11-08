import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  /** Heading level. Landing sections use h2. */
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
};

export function SectionHeading({ eyebrow, title, lede, align = "left", as: Tag = "h2", id, className }: Props) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <Tag id={id} className="text-3xl font-semibold text-fg sm:text-4xl lg:text-5xl">
        {title}
      </Tag>
      {lede ? <p className="mt-5 text-lg leading-relaxed text-muted">{lede}</p> : null}
    </div>
  );
}
