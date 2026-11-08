import Link from "next/link";
import { ArrowRight, Clock3, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { questionCountFor, quizzes } from "@/data/quizzes";
import { MODALITY_SHORT } from "@/data/types";
import { cn } from "@/lib/cn";

type Props = {
  /** Heading level for the quiz titles. h2 on /quizzes, h3 under a section heading. */
  headingLevel?: "h2" | "h3";
  className?: string;
};

/**
 * The three self-quizzes as cards: modality, title, what it covers, item count and time budget.
 * The whole card is the target; the "Start the quiz" text is the accessible name of the link.
 */
export function QuizPicker({ headingLevel: Heading = "h2", className }: Props) {
  return (
    <ul role="list" className={cn("grid gap-4 sm:gap-5 lg:grid-cols-3", className)}>
      {quizzes.map((quiz) => {
        const count = questionCountFor(quiz.slug);
        return (
          <li key={quiz.slug} className="flex">
            <article className="card-lift hairline relative flex w-full flex-col rounded-2xl bg-card p-6 focus-within:border-pink/60 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <Badge tone="outline">{MODALITY_SHORT[quiz.modality]}</Badge>
                <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">Free</span>
              </div>

              <Heading className="mt-6 text-xl font-semibold text-fg sm:text-2xl">{quiz.title}</Heading>
              <p className="mt-3 leading-relaxed text-muted">{quiz.description}</p>

              <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/8 pt-5 text-sm">
                <div className="flex items-center gap-2">
                  <ListChecks className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
                  <dt className="sr-only">Items</dt>
                  <dd className="num text-fg">
                    {count} <span className="text-muted">items</span>
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
                  <dt className="sr-only">Time to budget</dt>
                  <dd className="num text-fg">
                    {quiz.minutes} <span className="text-muted">min</span>
                  </dd>
                </div>
              </dl>

              {/* The link stretches over the card so the whole panel is the target; the text stays the accessible name. */}
              <Link
                href={`/quizzes/${quiz.slug}`}
                className="group mt-auto inline-flex min-h-11 items-center gap-1.5 pt-6 font-medium text-blush after:absolute after:inset-0 after:rounded-2xl after:content-['']"
              >
                Start the quiz
                <ArrowRight
                  className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </Link>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
