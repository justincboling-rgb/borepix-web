import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";

type PanelProps = {
  id: string;
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  /** Rendered top-right of the heading from `sm` up, e.g. a settings link. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Hairline panel with an eyebrow heading. Every My Account section is one of these. */
export function AccountPanel({ id, eyebrow, title, lede, action, children, className }: PanelProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={cn("panel reveal rounded-2xl p-5 sm:p-7", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={titleId} className="mt-2 text-xl font-semibold text-fg sm:text-2xl">
            {title}
          </h2>
          {lede ? <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted">{lede}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

type EmptyProps = {
  icon: ComponentType<LucideProps>;
  title: string;
  body: string;
  action?: ReactNode;
};

/** Zero state for a panel: icon, one line, one sentence, optional action. */
export function EmptyState({ icon: Icon, title, body, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-white/12 px-5 py-8 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full border border-line bg-white/[0.03] text-silver">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="mt-4 font-medium text-fg">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Mono label above a value, for definition lists inside panels. */
export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-4">
      <dt className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="num mt-2 text-3xl font-semibold text-fg">{value}</dd>
      {note ? <dd className="mt-1 text-xs text-muted">{note}</dd> : null}
    </div>
  );
}
