import type { ReactNode } from "react";
import {
  ArrowRight,
  ChartColumn,
  CircleCheck,
  Clock,
  Layers,
  ListChecks,
  Magnet,
  MonitorSmartphone,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";
import {
  DevicesVignette,
  ExamVignette,
  FlashcardVignette,
  PhysicsVignette,
  QuestionVignette,
  ReadinessVignette,
} from "@/components/landing/core/feature-vignettes";

type TileProps = {
  icon: LucideIcon;
  label: string;
  title: string;
  description: ReactNode;
  visual: ReactNode;
  /** Extra content under the description (links, status badges). */
  extra?: ReactNode;
  featured?: boolean;
  /** Grid placement classes for the list item. */
  className?: string;
  /** Layout overrides for the card body (e.g. side-by-side on wide tiles). */
  bodyClassName?: string;
  visualClassName?: string;
};

function Tile({
  icon: Icon,
  label,
  title,
  description,
  visual,
  extra,
  featured = false,
  className,
  bodyClassName,
  visualClassName,
}: TileProps) {
  return (
    // `reveal` animates the list item; the hover lift lives on the inner card so the two never fight.
    <li className={cn("reveal", className)}>
      <article
        className={cn(
          "group panel relative flex h-full flex-col overflow-hidden rounded-2xl p-6 sm:p-7",
          "transition-transform duration-250 ease-out-expo motion-safe:hover:-translate-y-1",
          featured && "haze-top xl:p-9",
          bodyClassName,
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-pink/70 to-transparent opacity-0 transition-opacity duration-250 group-hover:opacity-100"
        />
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-blush">
            <Icon aria-hidden strokeWidth={1.75} className="size-4" />
            {label}
          </p>
          <h3 className={cn("mt-3 font-semibold text-fg", featured ? "text-2xl sm:text-3xl md:text-2xl xl:text-3xl" : "text-xl")}>{title}</h3>
          <p className="mt-3 max-w-prose leading-relaxed text-muted">{description}</p>
          {extra}
        </div>
        <div className={cn("mt-auto pt-6", visualClassName)}>{visual}</div>
      </article>
    </li>
  );
}

/** Wide tiles (question bank, web and mobile) sit side by side from md up. */
const split = "md:grid md:gap-8 lg:gap-10";

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="relative py-24 sm:py-32">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 h-96" />
      <div className="container-x relative">
        <SectionHeading
          id="features-title"
          eyebrow="The platform"
          className="reveal"
          title={
            <>
              Everything the registry tests. <span className="text-gradient">Built for how you actually study.</span>
            </>
          }
          lede="Radiography and MRI prep organized around the ARRT® content categories. Practice that explains itself, exams that feel familiar, and a clear next step after every session."
        />

        <ul role="list" className="mt-14 grid gap-4 sm:mt-16 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Tile
            featured
            icon={ListChecks}
            label="Question bank"
            title="Exam-style questions with full rationales"
            description="Original Radiography and MRI questions, written to the ARRT content categories. Every answer comes with a full rationale, so each miss teaches you something."
            visual={<QuestionVignette />}
            className="md:col-span-2"
            bodyClassName={cn(split, "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start")}
            visualClassName="md:mt-0 md:pt-0"
          />

          <Tile
            icon={Timer}
            label="Mock exams"
            title="Timed mock exams in a computer-based format"
            description="A running clock, one question per screen, flag for review and a question navigator. Learn the format before test day."
            visual={<ExamVignette />}
          />

          <Tile
            icon={ChartColumn}
            label="Readiness"
            title="Readiness by content category"
            description="Every answer feeds a category breakdown, so your next session starts with your weakest area."
            visual={<ReadinessVignette />}
          />

          <Tile
            icon={Magnet}
            label="MRI Mastery"
            title="An interactive MRI physics lab"
            description="Change TR, TE and field strength and watch tissue contrast respond. Larmor frequency, relaxation, k-space and SAR, learned by doing."
            extra={
              <a
                href="#mri-lab"
                className="group/link mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blush transition-colors duration-150 hover:text-fg"
              >
                Try the physics lab
                <ArrowRight
                  aria-hidden
                  strokeWidth={1.75}
                  className="size-4 transition-transform duration-150 motion-safe:group-hover/link:translate-x-0.5"
                />
              </a>
            }
            visual={<PhysicsVignette />}
          />

          <Tile
            icon={Layers}
            label="Flashcards"
            title="Spaced-repetition flashcards"
            description="Grade each card Again, Hard, Good or Easy. Borepix schedules the next review at a widening interval, so facts stay fresh without cramming."
            visual={<FlashcardVignette />}
          />

          <Tile
            icon={MonitorSmartphone}
            label="Web and mobile"
            title="Study where you are"
            description="The web app runs in any modern browser, on a desktop or a phone. Native mobile apps are on the way."
            extra={
              <ul role="list" className="mt-5 flex flex-wrap gap-2">
                <li className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-fg">
                  <CircleCheck aria-hidden strokeWidth={1.75} className="size-3.5 text-success" />
                  Web app: available now
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-muted">
                  <Clock aria-hidden strokeWidth={1.75} className="size-3.5" />
                  Mobile app: coming soon
                </li>
              </ul>
            }
            visual={<DevicesVignette />}
            className="md:col-span-2 lg:col-span-3"
            bodyClassName={cn(split, "md:grid-cols-2 md:items-center")}
            visualClassName="md:mt-0 md:pt-0"
          />
        </ul>
      </div>
    </section>
  );
}
