import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, FlaskConical } from "lucide-react";
import { lessons } from "@/lib/content/lessons";
import { LAB_META } from "@/components/app/labs/lab-meta";
import { LevelChip } from "@/components/app/mri/level-chip";
import { LessonStatus } from "@/components/app/mri/lesson-status";
import { MriProgress } from "@/components/app/mri/mri-progress";

export const metadata: Metadata = {
  title: "MRI Mastery",
  description:
    "Short MRI physics lessons with interactive labs and exam-style check questions for the ARRT® MRI registry: precession, relaxation, k-space and RF safety.",
};

export default function MriMasteryPage() {
  const totalMinutes = lessons.reduce((sum, l) => sum + l.minutes, 0);
  const labCount = new Set(lessons.flatMap((l) => (l.lab ? [l.lab] : []))).size;

  return (
    <div className="container-x py-8">
      <header className="max-w-3xl">
        <p className="eyebrow">MRI physics</p>
        <h1 className="mt-3 text-3xl font-semibold text-fg sm:text-4xl">MRI Mastery</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Short lessons on the physics behind every scan, from precession to k-space and RF safety. Lessons end with
          exam-style check questions for the ARRT® MRI registry, and many include a lab where you change the parameters
          and watch the physics respond.
        </p>
        {lessons.length ? (
          <ul className="num mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted" aria-label="Course overview">
            <li>
              <span className="text-fg">{lessons.length}</span> {lessons.length === 1 ? "lesson" : "lessons"}
            </li>
            <li>
              <span className="text-fg">{labCount}</span> interactive {labCount === 1 ? "lab" : "labs"}
            </li>
            <li>
              About <span className="text-fg">{totalMinutes}</span> min in total
            </li>
          </ul>
        ) : null}
      </header>

      {lessons.length ? (
        <>
          <div className="mt-8">
            <MriProgress lessons={lessons.map((l) => ({ slug: l.slug, title: l.title }))} />
          </div>

          <section aria-labelledby="lessons-heading" className="mt-10">
            <h2 id="lessons-heading" className="text-xl font-semibold text-fg sm:text-2xl">
              Lessons
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {lessons.map((lesson, i) => (
                <li
                  key={lesson.slug}
                  className="panel group relative flex flex-col rounded-2xl p-5 transition-colors duration-150 hover:border-white/20 hover:bg-card-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num text-xs font-medium text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <LevelChip level={lesson.level} />
                    {lesson.lab ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-pink/30 bg-pink/10 px-2.5 py-0.5 text-xs text-blush">
                        <FlaskConical className="size-3.5" strokeWidth={1.75} aria-hidden />
                        {LAB_META[lesson.lab]?.short ?? "Lab"}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold leading-snug text-fg">
                    <Link
                      href={`/app/mri/${lesson.slug}`}
                      className="rounded-sm after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-blush"
                    >
                      {lesson.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{lesson.summary}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="num inline-flex items-center gap-1.5 text-sm text-muted">
                      <Clock className="size-4" strokeWidth={1.75} aria-hidden />
                      {lesson.minutes} min
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <LessonStatus slug={lesson.slug} />
                      <ArrowRight
                        className="size-4 text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-blush"
                        aria-hidden
                      />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <p className="panel mt-8 rounded-2xl p-6 text-muted">Lessons are being written. Check back soon.</p>
      )}
    </div>
  );
}
