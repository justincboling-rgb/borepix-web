"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ExamTrack, Question } from "@/lib/content/types";
import { useHydrated, useProgress } from "@/lib/store/progress";
import { PracticeRunner, type PracticeResult } from "./practice-runner";
import { PracticeSetup } from "./practice-setup";
import { PracticeSummary } from "./practice-summary";
import {
  filteredQuestions,
  lastResultByQuestion,
  needsWork,
  parseCategory,
  parseTrack,
  sessionSize,
  topicOptions,
  type PracticeFilters,
} from "./pool";
import { createSeed, seededShuffle } from "./random";

type Stage =
  | { kind: "setup"; focusHeading: boolean }
  | { kind: "session"; id: number; questions: Question[]; startedAt: number }
  | { kind: "summary"; results: PracticeResult[]; planned: number };

type FilterState = Omit<PracticeFilters, "track"> & {
  /** Explicit choice (URL or user). When null, the profile's track is used. */
  track: ExamTrack | null;
};

/**
 * Tutor-mode practice. Reads ?track= and ?category= for the initial filters (must render under Suspense),
 * and re-applies them when the URL changes while this route is preserved by Activity.
 */
export function PracticeApp() {
  const searchParams = useSearchParams();
  const paramTrack = parseTrack(searchParams.get("track"));
  const paramCategory = parseCategory(searchParams.get("category"));
  const paramKey = `${paramTrack ?? ""}|${paramCategory ?? ""}`;

  const progress = useProgress();
  const hydrated = useHydrated();

  const [filterState, setFilterState] = useState<FilterState>(() => ({
    track: paramTrack,
    category: paramCategory ?? "all",
    topic: "all",
    onlyNeedsWork: false,
    length: "10",
  }));
  const [stage, setStage] = useState<Stage>({ kind: "setup", focusHeading: false });

  // Follow URL changes (e.g. "Practice weak areas" from a mock exam) without an effect.
  const [syncedKey, setSyncedKey] = useState(paramKey);
  if (paramKey !== syncedKey) {
    setSyncedKey(paramKey);
    setFilterState((f) => ({
      ...f,
      track: paramTrack ?? f.track,
      category: paramCategory ?? "all",
      topic: "all",
    }));
    setStage({ kind: "setup", focusHeading: false });
  }

  const track: ExamTrack = filterState.track ?? progress.profile?.track ?? "radiography";
  const topics = topicOptions(track, filterState.category);
  const topic = topics.includes(filterState.topic) ? filterState.topic : "all";
  const filters: PracticeFilters = { ...filterState, track, topic };

  const lastResult = useMemo(() => lastResultByQuestion(progress.answers), [progress.answers]);
  const matching = filteredQuestions(filters);
  const pool = filters.onlyNeedsWork ? needsWork(matching, lastResult) : matching;
  const size = sessionSize(pool.length, filters.length);

  function updateFilters(patch: Partial<PracticeFilters>) {
    setFilterState((f) => {
      const nextState: FilterState = { ...f, ...patch };
      // A new track or category can make the chosen topic unavailable; fall back to all topics.
      if (patch.track !== undefined || patch.category !== undefined) {
        const nextTrack = nextState.track ?? track;
        if (!topicOptions(nextTrack, nextState.category).includes(nextState.topic)) nextState.topic = "all";
      }
      return nextState;
    });
  }

  function startWith(questions: Question[], limit: number) {
    if (!questions.length) return;
    const seed = createSeed();
    const ordered = seededShuffle(questions, seed).slice(0, limit);
    setStage({ kind: "session", id: seed, questions: ordered, startedAt: Date.now() });
  }

  if (stage.kind === "session") {
    return (
      <PracticeRunner
        key={stage.id}
        questions={stage.questions}
        startedAt={stage.startedAt}
        onFinish={(results) => setStage({ kind: "summary", results, planned: stage.questions.length })}
      />
    );
  }

  if (stage.kind === "summary") {
    const missed = stage.results.filter((r) => !r.correct).map((r) => r.question);
    return (
      <PracticeSummary
        results={stage.results}
        planned={stage.planned}
        onPracticeMissed={() => startWith(missed, missed.length)}
        onNewSession={() => setStage({ kind: "setup", focusHeading: true })}
      />
    );
  }

  return (
    <PracticeSetup
      filters={filters}
      onChange={updateFilters}
      topics={topics}
      matchCount={pool.length}
      matchCountIgnoringProgress={matching.length}
      sessionCount={size}
      ready={hydrated}
      focusHeading={stage.focusHeading}
      onStart={() => startWith(pool, size)}
    />
  );
}
