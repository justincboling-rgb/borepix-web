"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, CircleCheck, Flame, ListChecks } from "lucide-react";
import { countdownLabel, daysUntil, formatIsoDay } from "@/components/app/shell/exam-date";
import { useNow } from "@/components/app/shell/use-now";
import { flashcards } from "@/lib/content/flashcards";
import { lessons } from "@/lib/content/lessons";
import type { ExamTrack } from "@/lib/content/types";
import { CATEGORY_LABEL, TRACK_LABEL } from "@/lib/content/types";
import {
  dayKey,
  getCategoryMastery,
  getDueCards,
  getReadiness,
  getStreak,
  useProgress,
  type Mastery,
  type ProgressState,
} from "@/lib/store/progress";
import { CategoryMastery } from "./category-mastery";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { ACTION_ICONS, QuickActions, type QuickAction } from "./quick-actions";
import { READINESS_MIN_ANSWERS, ReadinessRing } from "./readiness-ring";
import { RecentExams } from "./recent-exams";
import { StatCard } from "./stat-card";
import { TrackSwitcher } from "./track-switcher";

/** Readiness uses at most this many recent answers (mirrors getReadiness). */
const READINESS_WINDOW = 300;
const RECENT_EXAMS = 5;

/** Lowest accuracy among categories with answers; ties go to the category with fewer answers. */
function pickWeakest(mastery: Mastery[]): Mastery | null {
  return mastery
    .filter((m) => m.pct !== null)
    .reduce<Mastery | null>((weakest, m) => {
      if (!weakest) return m;
      if ((m.pct ?? 0) < (weakest.pct ?? 0)) return m;
      if (m.pct === weakest.pct && m.total < weakest.total) return m;
      return weakest;
    }, null);
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

function summarize(state: ProgressState, track: ExamTrack, now: number) {
  const trackAnswers = state.answers.filter((a) => a.track === track);
  const correct = trackAnswers.filter((a) => a.correct).length;
  const mastery = getCategoryMastery(state, track);

  const trackCardIds = flashcards.filter((c) => c.track === track).map((c) => c.id);
  const due = getDueCards(state, trackCardIds, now);
  const dueReviews = due.filter((id) => state.cards[id]).length;

  const done = new Set(state.lessonsDone);

  return {
    answered: trackAnswers.length,
    accuracy: trackAnswers.length ? Math.round((correct / trackAnswers.length) * 100) : null,
    readiness: getReadiness(state, track),
    readinessBasis: Math.min(trackAnswers.length, READINESS_WINDOW),
    mastery,
    weakest: pickWeakest(mastery),
    streak: getStreak(state, now),
    studiedToday: state.studyDays.includes(dayKey(now)),
    dueReviews,
    newCards: due.length - dueReviews,
    lessonsDone: lessons.filter((l) => done.has(l.slug)).length,
    nextLesson: lessons.find((l) => !done.has(l.slug)) ?? null,
    exams: [...state.exams].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, RECENT_EXAMS),
  };
}

type Summary = ReturnType<typeof summarize>;

function buildActions(s: Summary, track: ExamTrack): QuickAction[] {
  const trackLabel = TRACK_LABEL[track];
  const actions: QuickAction[] = [];

  actions.push(
    s.weakest
      ? {
          href: `/app/practice?track=${track}&category=${s.weakest.category}`,
          title: "Practice your weakest category",
          detail: `${CATEGORY_LABEL[s.weakest.category]}: ${s.weakest.pct}% across ${s.weakest.total} ${plural(
            s.weakest.total,
            "answer",
            "answers",
          )}.`,
          Icon: ACTION_ICONS.practice,
          primary: true,
        }
      : {
          href: `/app/practice?track=${track}`,
          title: `Start practicing ${trackLabel}`,
          detail: "Answer a few questions in each category to find your weakest area.",
          Icon: ACTION_ICONS.practice,
          primary: true,
        },
  );

  // Counts are for the selected track; the flashcards page lets the learner pick the deck.
  actions.push(
    s.dueReviews > 0
      ? {
          href: "/app/flashcards",
          title: `Review ${s.dueReviews} due ${trackLabel} ${plural(s.dueReviews, "flashcard", "flashcards")}`,
          detail:
            s.newCards > 0
              ? `Plus ${s.newCards} new ${plural(s.newCards, "card", "cards")} you have not studied yet.`
              : "Spaced repetition schedules each card by how well you recalled it last time.",
          Icon: ACTION_ICONS.flashcards,
        }
      : s.newCards > 0
        ? {
            href: "/app/flashcards",
            title: `Start ${s.newCards} new ${trackLabel} ${plural(s.newCards, "flashcard", "flashcards")}`,
            detail: "No reviews are due. These cards have not been studied yet.",
            Icon: ACTION_ICONS.flashcards,
          }
        : {
            href: "/app/flashcards",
            title: `${trackLabel} flashcards are up to date`,
            detail: "No cards are due right now. Your next reviews appear here when they come due.",
            Icon: ACTION_ICONS.flashcards,
          },
  );

  if (lessons.length > 0) {
    actions.push(
      s.nextLesson
        ? {
            href: `/app/mri/${s.nextLesson.slug}`,
            title: `Continue MRI Mastery: ${s.nextLesson.title}`,
            detail: `${s.nextLesson.level} · ${s.nextLesson.minutes} min · ${s.lessonsDone} of ${lessons.length} lessons done.`,
            Icon: ACTION_ICONS.mri,
          }
        : {
            href: "/app/mri",
            title: "Review MRI Mastery",
            detail: `All ${lessons.length} ${plural(lessons.length, "lesson", "lessons")} complete. Revisit any lesson or lab.`,
            Icon: ACTION_ICONS.mri,
          },
    );
  }

  actions.push({
    href: "/app/exam",
    title: "Take a mock exam",
    detail: "A timed exam across all four content categories, with a full rationale review at the end.",
    Icon: ACTION_ICONS.exam,
  });

  return actions;
}

export function Dashboard() {
  const state = useProgress();
  const now = useNow();
  const [trackChoice, setTrackChoice] = useState<ExamTrack | null>(null);

  const profile = state.profile;
  const track: ExamTrack = trackChoice ?? profile?.track ?? "radiography";
  const firstName = profile?.name.trim().split(/\s+/)[0] ?? "";

  // now is null on the server and during hydration, i.e. until stored progress is readable.
  const summary = useMemo(() => (now === null ? null : summarize(state, track, now)), [state, track, now]);
  const examDays = profile?.examDate && now !== null ? daysUntil(profile.examDate, now) : null;

  return (
    <div className="container-x py-8 lg:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-fg sm:text-4xl">
            {summary ? (
              firstName ? (
                <>Hi, {firstName}</>
              ) : (
                "Hi there"
              )
            ) : (
              <>
                <span className="sr-only">Dashboard</span>
                <span aria-hidden className="inline-block h-[1em] w-56 max-w-full animate-pulse rounded-lg bg-white/[0.06]" />
              </>
            )}
          </h1>
          {summary ? (
            <p className="mt-2 text-muted">Your {TRACK_LABEL[track]} prep for the ARRT® registry, at a glance.</p>
          ) : (
            <p aria-hidden className="mt-3 h-5 w-72 max-w-full animate-pulse rounded-md bg-white/[0.04]" />
          )}
        </div>
        {summary ? <TrackSwitcher value={track} onChange={setTrackChoice} /> : null}
      </div>

      {!summary ? (
        <DashboardSkeleton />
      ) : (
        <div className="mt-8 space-y-6">
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="sr-only">
              Overview
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="panel flex flex-col rounded-2xl p-5 sm:col-span-2 sm:p-6 lg:col-span-1 lg:row-span-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-sans text-sm font-medium text-muted">Readiness</h3>
                  <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted">
                    {TRACK_LABEL[track]}
                  </span>
                </div>
                <div className="mt-5 flex flex-1 flex-col items-start gap-5 sm:flex-row sm:items-center lg:flex-col lg:items-start">
                  <ReadinessRing value={summary.readiness} answered={summary.answered} />
                  <div className="space-y-2">
                    {summary.readiness === null ? (
                      <p className="font-medium text-fg">
                        Answer {READINESS_MIN_ANSWERS}+ {TRACK_LABEL[track]} questions to unlock.
                      </p>
                    ) : (
                      <p className="font-medium text-fg">
                        Based on your last {summary.readinessBasis} {TRACK_LABEL[track]}{" "}
                        {plural(summary.readinessBasis, "answer", "answers")}.
                      </p>
                    )}
                    <p className="text-sm leading-relaxed text-muted">
                      A study signal from your recent accuracy, weighted toward newer answers. It is not a score
                      prediction.
                    </p>
                  </div>
                </div>
              </div>

              <StatCard
                title="Study streak"
                Icon={Flame}
                value={summary.streak}
                unit={plural(summary.streak, "day", "days")}
                detail={
                  summary.studiedToday ? (
                    <span className="flex items-center gap-1.5 text-success">
                      <CircleCheck aria-hidden strokeWidth={1.75} className="size-4" />
                      Studied today
                    </span>
                  ) : summary.streak > 0 ? (
                    "Study today to keep it going."
                  ) : (
                    "Answer a question or review a card to start one."
                  )
                }
              />

              <StatCard
                title="Exam countdown"
                Icon={CalendarDays}
                value={examDays === null || examDays < 0 ? "–" : examDays === 0 ? "Today" : examDays}
                unit={
                  examDays === null
                    ? "No date set"
                    : examDays > 0
                      ? plural(examDays, "day to go", "days to go")
                      : examDays === 0
                        ? "is exam day"
                        : countdownLabel(examDays)
                }
                detail={
                  profile?.examDate && examDays !== null ? (
                    <>
                      {formatIsoDay(profile.examDate)}
                      {examDays < 0 ? (
                        <>
                          {" · "}
                          <Link href="/app/settings" className="font-medium text-blush underline-offset-4 hover:underline">
                            Update it
                          </Link>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <Link
                      href="/app/settings"
                      className="inline-flex min-h-11 items-center font-medium text-blush underline-offset-4 hover:underline"
                    >
                      Set your exam date
                    </Link>
                  )
                }
              />

              <StatCard
                title="Questions answered"
                Icon={ListChecks}
                value={summary.answered}
                unit={TRACK_LABEL[track]}
                detail={
                  summary.accuracy === null
                    ? "Practice sets, mock exams and lesson checks all count."
                    : `${summary.accuracy}% correct overall.`
                }
              />

              <StatCard
                title="MRI Mastery"
                Icon={BookOpen}
                value={`${summary.lessonsDone}/${lessons.length}`}
                unit={plural(lessons.length, "lesson", "lessons")}
                detail={summary.nextLesson ? `Next: ${summary.nextLesson.title}` : "Every lesson complete."}
              />
            </div>
          </section>

          <QuickActions actions={buildActions(summary, track)} />

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <CategoryMastery track={track} mastery={summary.mastery} weakest={summary.weakest?.category ?? null} />
            </div>
            <div className="flex lg:col-span-2">
              <RecentExams exams={summary.exams} examHref="/app/exam" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
