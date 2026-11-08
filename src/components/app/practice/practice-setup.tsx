"use client";

import { useId, type FormEvent, type ReactNode } from "react";
import { ArrowRight, ChevronDown, SearchX } from "lucide-react";
import type { ContentCategory, ExamTrack } from "@/lib/content/types";
import { CATEGORIES, CATEGORY_LABEL, TRACK_LABEL } from "@/lib/content/types";
import { questionsFor } from "@/lib/content/questions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ChoiceGroup } from "./choice-group";
import { SESSION_LENGTHS, type PracticeFilters } from "./pool";
import { useFocusOnMount } from "./use-focus-on-mount";

const TRACKS: ExamTrack[] = ["radiography", "mri"];

type Props = {
  filters: PracticeFilters;
  onChange: (patch: Partial<PracticeFilters>) => void;
  topics: string[];
  /** Questions matching every filter, including the needs-work toggle. */
  matchCount: number;
  /** Questions matching track, category and topic only. */
  matchCountIgnoringProgress: number;
  /** Questions that will be in the session. */
  sessionCount: number;
  /** Stored progress has loaded (the needs-work filter depends on it). */
  ready: boolean;
  /** Move focus to the heading on mount (when returning from a summary). */
  focusHeading?: boolean;
  onStart: () => void;
};

export function PracticeSetup({
  filters,
  onChange,
  topics,
  matchCount,
  matchCountIgnoringProgress,
  sessionCount,
  ready,
  focusHeading = false,
  onStart,
}: Props) {
  const uid = useId();
  const headingRef = useFocusOnMount<HTMLHeadingElement>(focusHeading);
  const categoryId = `${uid}-category`;
  const topicId = `${uid}-topic`;
  const toggleId = `${uid}-needs-work`;
  const toggleHintId = `${uid}-needs-work-hint`;
  const trackBank = questionsFor(filters.track).length;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ready && sessionCount > 0) onStart();
  }

  return (
    <form onSubmit={submit} className="panel rounded-2xl p-5 sm:p-7" aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-fg">
        Build a session
      </h2>
      <p className="mt-1 text-muted">Choose what to study. Each answer shows its rationale before you move on.</p>

      <div className="mt-6 grid gap-6">
        <ChoiceGroup<ExamTrack>
          legend="Exam track"
          value={filters.track}
          onChange={(track) => onChange({ track })}
          options={TRACKS.map((t) => {
            const n = questionsFor(t).length;
            return {
              value: t,
              label: TRACK_LABEL[t],
              description: `${n} ${n === 1 ? "question" : "questions"} in the bank`,
            };
          })}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField id={categoryId} label="Content category">
            <select
              id={categoryId}
              value={filters.category}
              onChange={(e) => onChange({ category: e.target.value as ContentCategory | "all" })}
              className={selectClass}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </SelectField>

          <SelectField id={topicId} label="Topic">
            <select
              id={topicId}
              value={filters.topic}
              onChange={(e) => onChange({ topic: e.target.value })}
              className={selectClass}
              disabled={topics.length === 0}
            >
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </SelectField>
        </div>

        <ChoiceGroup
          legend="Session length"
          value={filters.length}
          onChange={(length) => onChange({ length })}
          compact
          columnsClassName="grid-cols-3"
          options={SESSION_LENGTHS.map((l) => ({ value: l.value, label: l.label }))}
        />

        {/* The label's ::after covers the whole card, so the full row is the touch target. */}
        <div
          className={cn(
            "relative flex items-start gap-3 rounded-xl border p-4 transition-colors duration-150",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush",
            filters.onlyNeedsWork
              ? "border-pink/60 bg-pink/10"
              : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]",
          )}
        >
          <input
            id={toggleId}
            type="checkbox"
            checked={filters.onlyNeedsWork}
            onChange={(e) => onChange({ onlyNeedsWork: e.target.checked })}
            aria-describedby={toggleHintId}
            className="mt-0.5 size-5 shrink-0 accent-pink-strong focus-visible:outline-none"
          />
          <div>
            <label htmlFor={toggleId} className="font-medium text-fg after:absolute after:inset-0 after:rounded-xl">
              Only unanswered or previously missed
            </label>
            <p id={toggleHintId} className="mt-0.5 text-sm text-muted">
              Skips questions you answered correctly on your most recent attempt.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-white/8 pt-6">
        <div aria-live="polite" aria-atomic="true">
          {!ready ? (
            <p className="text-sm text-muted">Loading your progress on this device.</p>
          ) : sessionCount > 0 ? (
            <p className="text-sm text-muted">
              <span className="num text-fg">{matchCount}</span> {matchCount === 1 ? "question matches" : "questions match"}.{" "}
              {filters.length !== "all" && matchCount < Number(filters.length)
                ? `This session uses all ${matchCount}.`
                : `This session uses ${sessionCount}.`}
            </p>
          ) : (
            <EmptyState>
              {trackBank === 0
                ? `There are no ${TRACK_LABEL[filters.track]} questions in the bank yet. Choose the other track.`
                : filters.onlyNeedsWork && matchCountIgnoringProgress > 0
                  ? "You answered every matching question correctly on your most recent attempt. Turn off “Only unanswered or previously missed” to review them again."
                  : "No questions match these filters. Try All categories or All topics."}
            </EmptyState>
          )}
        </div>

        <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto" disabled={!ready || sessionCount === 0}>
          Start practice
          <ArrowRight className="size-5" strokeWidth={1.75} aria-hidden />
        </Button>
      </div>
    </form>
  );
}

const selectClass =
  "min-h-11 w-full appearance-none rounded-xl border border-white/12 bg-card-2 py-2 pl-3.5 pr-10 text-[0.95rem] text-fg " +
  "transition-colors duration-150 hover:border-white/25 disabled:opacity-45";

function SelectField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        {children}
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-ink-2 p-4">
      <SearchX className="mt-0.5 size-5 shrink-0 text-blush" strokeWidth={1.75} aria-hidden />
      <div>
        <p className="font-medium text-fg">No questions to practice</p>
        <p className="mt-1 text-sm text-muted">{children}</p>
      </div>
    </div>
  );
}
