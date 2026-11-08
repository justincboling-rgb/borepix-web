import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Clock, FlaskConical } from "lucide-react";
import type { Question } from "@/lib/content/types";
import { getLesson, lessons } from "@/lib/content/lessons";
import { getQuestion } from "@/lib/content/questions";
import { LabRenderer } from "@/components/app/labs/lab-renderer";
import { LAB_META } from "@/components/app/labs/lab-meta";
import { CompleteLesson } from "@/components/app/mri/complete-lesson";
import { LessonCheck } from "@/components/app/mri/lesson-check";
import { LevelChip } from "@/components/app/mri/level-chip";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams(): { slug: string }[] {
  return lessons.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found" };
  return { title: lesson.title, description: lesson.summary };
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const index = lessons.findIndex((l) => l.slug === lesson.slug);
  const prev = index > 0 ? lessons[index - 1] : undefined;
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined;

  const questions = (lesson.checkQuestionIds ?? [])
    .map((id) => getQuestion(id))
    .filter((q): q is Question => Boolean(q));

  const toc = [
    ...lesson.sections.map((s, i) => ({ id: `section-${i + 1}`, label: s.heading })),
    ...(lesson.keyPoints.length ? [{ id: "key-points", label: "Key points" }] : []),
    ...(lesson.lab ? [{ id: "lab", label: LAB_META[lesson.lab]?.name ?? "Interactive lab" }] : []),
    ...(questions.length ? [{ id: "check", label: "Check your understanding" }] : []),
  ];

  return (
    <div className="container-x py-8">
      <nav aria-label="Breadcrumb">
        <ol className="flex min-w-0 items-center gap-2 text-sm">
          <li className="shrink-0">
            <Link href="/app/mri" className="rounded-sm text-blush underline-offset-4 hover:underline">
              MRI Mastery
            </Link>
          </li>
          <li className="flex min-w-0 items-center gap-2">
            <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
            <span aria-current="page" className="min-w-0 truncate text-muted">
              {lesson.title}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-6 xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-12">
        <article className="min-w-0">
          <header>
            {index >= 0 ? (
              <p className="eyebrow">
                Lesson {index + 1} of {lessons.length}
              </p>
            ) : null}
            <h1 className="mt-3 text-3xl font-semibold text-fg sm:text-4xl lg:text-[2.75rem]">{lesson.title}</h1>
            <p className="mt-4 max-w-[70ch] text-lg leading-relaxed text-muted">{lesson.summary}</p>
            <ul className="mt-5 flex flex-wrap items-center gap-2" aria-label="Lesson details">
              <li>
                <LevelChip level={lesson.level} />
              </li>
              <li className="num inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted">
                <Clock className="size-3.5" strokeWidth={1.75} aria-hidden />
                {lesson.minutes} min
              </li>
              {lesson.lab ? (
                <li className="inline-flex items-center gap-1.5 rounded-full border border-pink/30 bg-pink/10 px-2.5 py-0.5 text-xs text-blush">
                  <FlaskConical className="size-3.5" strokeWidth={1.75} aria-hidden />
                  Includes the {LAB_META[lesson.lab]?.name ?? "interactive lab"}
                </li>
              ) : null}
            </ul>
          </header>

          <div className="mt-10 grid gap-10">
            {lesson.sections.map((section, i) => {
              const id = `section-${i + 1}`;
              return (
                <section key={id} id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
                  <h2 id={`${id}-heading`} className="text-2xl font-semibold text-fg">
                    {section.heading}
                  </h2>
                  <div className="mt-4 grid max-w-[70ch] gap-4 text-[1.0625rem] leading-[1.75] text-fg/90">
                    {section.body.map((paragraph, j) => (
                      <p key={j}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {lesson.keyPoints.length ? (
            <section
              id="key-points"
              aria-labelledby="key-points-heading"
              className="panel mt-12 max-w-[70ch] scroll-mt-24 rounded-2xl p-6 sm:p-7"
            >
              <h2 id="key-points-heading" className="text-xl font-semibold text-fg">
                Key points
              </h2>
              <ul className="mt-4 grid gap-3">
                {lesson.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-3 leading-relaxed text-fg/90">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-blush" strokeWidth={1.75} aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {lesson.lab ? (
            <div id="lab" className="mt-12 scroll-mt-24">
              <LabRenderer lab={lesson.lab} />
            </div>
          ) : null}

          {questions.length ? (
            <section id="check" aria-labelledby="check-heading" className="mt-12 max-w-3xl scroll-mt-24">
              <h2 id="check-heading" className="text-2xl font-semibold text-fg">
                Check your understanding
              </h2>
              <p className="mt-2 leading-relaxed text-muted">
                Original Borepix practice questions in the style of the ARRT® MRI exam, not actual exam items. Your answers
                are saved to your study history in this browser.
              </p>
              <LessonCheck questions={questions} />
            </section>
          ) : null}

          <div className="mt-12 border-t border-white/8 pt-8">
            <CompleteLesson slug={lesson.slug} next={next ? { slug: next.slug, title: next.title } : undefined} />
          </div>

          <nav aria-label="Lesson navigation" className="mt-8 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/app/mri/${prev.slug}`}
                className="panel group flex min-h-20 items-center gap-3 rounded-2xl p-4 transition-colors duration-150 hover:border-white/20 hover:bg-card-2"
              >
                <ArrowLeft className="size-5 shrink-0 text-muted group-hover:text-blush" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs text-muted">Previous lesson</span>
                  <span className="block font-medium text-fg">{prev.title}</span>
                </span>
              </Link>
            ) : null}
            {next ? (
              <Link
                href={`/app/mri/${next.slug}`}
                className="panel group flex min-h-20 items-center justify-end gap-3 rounded-2xl p-4 text-right transition-colors duration-150 hover:border-white/20 hover:bg-card-2 sm:col-start-2"
              >
                <span className="min-w-0">
                  <span className="block text-xs text-muted">Next lesson</span>
                  <span className="block font-medium text-fg">{next.title}</span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-muted group-hover:text-blush" aria-hidden />
              </Link>
            ) : (
              <Link
                href="/app/mri"
                className="panel group flex min-h-20 items-center justify-end gap-3 rounded-2xl p-4 text-right transition-colors duration-150 hover:border-white/20 hover:bg-card-2 sm:col-start-2"
              >
                <span className="min-w-0">
                  <span className="block text-xs text-muted">Last lesson. Back to</span>
                  <span className="block font-medium text-fg">All lessons</span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-muted group-hover:text-blush" aria-hidden />
              </Link>
            )}
          </nav>
        </article>

        {toc.length > 1 ? (
          <aside className="hidden xl:block">
            <nav aria-label="On this page" className="sticky top-8">
              <p className="eyebrow">On this page</p>
              <ol className="mt-4 grid gap-1 border-l border-white/10">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm leading-snug text-muted transition-colors duration-150 hover:border-blush hover:text-fg"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
