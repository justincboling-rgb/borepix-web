"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { ExamTrack } from "@/lib/content/types";
import { saveExamResult, useHydrated, useProgress } from "@/lib/store/progress";
import { createId, createSeed } from "@/components/app/practice/random";
import {
  clearActiveExam,
  drawExamItems,
  examPace,
  examReducer,
  gradeExam,
  initExamState,
  itemCount,
  saveActiveExam,
  timeLimitSec,
  type ActiveExam,
  type ExamLength,
} from "./exam-model";
import { ExamResults } from "./exam-results";
import { ExamSession } from "./exam-session";
import { ExamSetup } from "./exam-setup";
import { ExamSkeleton } from "./exam-skeleton";

/**
 * Mock exam entry. Renders a static placeholder until hydration, then mounts the exam on the client only,
 * so resuming from sessionStorage and reading the clock never run during prerender or hydration.
 */
export function ExamRoot() {
  const hydrated = useHydrated();
  return hydrated ? <ExamApp /> : <ExamSkeleton />;
}

function ExamApp() {
  const [state, dispatch] = useReducer(examReducer, undefined, initExamState);
  const progress = useProgress();
  /** Focus stage headings only after a learner action, never on first load or resume. */
  const [focusHeadings, setFocusHeadings] = useState(false);
  /** Guards against double submission (timer expiry racing a click). */
  const finishedIds = useRef(new Set<string>());

  const activeExam = state.stage === "exam" ? state.exam : null;
  const examInProgress = activeExam !== null;

  // Persist every change so a refresh in this tab resumes the attempt.
  useEffect(() => {
    if (activeExam) saveActiveExam(activeExam);
  }, [activeExam]);

  // Warn before leaving the page (refresh, close, external navigation) while an exam is running.
  useEffect(() => {
    if (!examInProgress) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Legacy browsers need returnValue set to show the prompt.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [examInProgress]);

  function start(track: ExamTrack, length: ExamLength) {
    const { count } = itemCount(track, length);
    const qids = drawExamItems(track, count, createSeed());
    if (!qids.length) return;
    const pace = examPace(track);
    const limit = timeLimitSec(qids.length, pace);
    const startedAt = Date.now();
    const exam: ActiveExam = {
      version: 1,
      id: createId(),
      track,
      qids,
      answers: qids.map(() => null),
      flagged: qids.map(() => false),
      index: 0,
      startedAt,
      deadline: startedAt + limit * 1000,
      timeLimitSec: limit,
      approximatePace: pace.approximate,
      reviewing: false,
    };
    setFocusHeadings(true);
    dispatch({ type: "start", exam });
  }

  function finish(exam: ActiveExam, autoSubmitted: boolean) {
    if (finishedIds.current.has(exam.id)) return;
    finishedIds.current.add(exam.id);
    const result = gradeExam(exam, Date.now());
    saveExamResult(result);
    clearActiveExam();
    setFocusHeadings(true);
    dispatch({ type: "finish", finished: { result, autoSubmitted, approximatePace: exam.approximatePace } });
  }

  function reset() {
    clearActiveExam();
    setFocusHeadings(true);
    dispatch({ type: "reset" });
  }

  if (state.stage === "exam") {
    const exam = state.exam;
    return (
      <ExamSession
        key={exam.id}
        exam={exam}
        dispatch={dispatch}
        onSubmit={() => finish(exam, false)}
        onExpire={() => finish(exam, true)}
        focusHeading={focusHeadings}
      />
    );
  }

  if (state.stage === "results") {
    return (
      <ExamResults
        key={state.result.id}
        result={state.result}
        autoSubmitted={state.autoSubmitted}
        approximatePace={state.approximatePace}
        onNewExam={reset}
        focusHeading={focusHeadings}
      />
    );
  }

  return <ExamSetup defaultTrack={progress.profile?.track ?? "radiography"} onStart={start} focusHeading={focusHeadings} />;
}
