"use client";

import { useEffect, useEffectEvent, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarClock, CheckCircle2, Eye } from "lucide-react";
import type { ExamTrack, Flashcard } from "@/lib/content/types";
import { TRACK_LABEL } from "@/lib/content/types";
import {
  getDueCards,
  nextCardState,
  reviewCard,
  useHydrated,
  useProgress,
  type ProgressState,
  type ReviewGrade,
} from "@/lib/store/progress";
import { Button, ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/app/labs/controls";
import { useNow, usePrefersReducedMotion } from "@/components/app/labs/hooks";
import { cn } from "@/lib/cn";
import { CardSkeleton } from "./flashcards-skeleton";
import { formatDateTime, formatInterval, formatRelative } from "./format";

type TrackFilter = "all" | ExamTrack;

const TRACK_OPTIONS: { value: TrackFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "radiography", label: TRACK_LABEL.radiography },
  { value: "mri", label: TRACK_LABEL.mri },
];

const GRADES: { grade: ReviewGrade; label: string; key: "1" | "2" | "3" | "4"; tone: string }[] = [
  { grade: 0, label: "Again", key: "1", tone: "text-danger" },
  { grade: 1, label: "Hard", key: "2", tone: "text-warning" },
  { grade: 2, label: "Good", key: "3", tone: "text-blush" },
  { grade: 3, label: "Easy", key: "4", tone: "text-success" },
];

function parseTrack(value: string | null): TrackFilter {
  return value === "radiography" || value === "mri" ? value : "all";
}

/** Due reviews first (most overdue first), then never-reviewed cards in deck order. */
function buildQueue(progress: ProgressState, ids: string[], now: number): string[] {
  const due = getDueCards(progress, ids, now);
  const reviews = due.filter((id) => progress.cards[id]).sort((a, b) => progress.cards[a].due - progress.cards[b].due);
  const fresh = due.filter((id) => !progress.cards[id]);
  return [...reviews, ...fresh];
}

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  return Boolean(el.closest("input, textarea, select, [contenteditable='true']"));
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="num inline-flex min-w-6 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] px-1.5 py-0.5 text-[0.7rem] text-fg">
      {children}
    </kbd>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-white/8 bg-ink-2 px-3 py-3 sm:px-4">
      <dt className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.08em] text-muted">{label}</dt>
      <dd className="num mt-1 text-2xl font-semibold text-fg">{value === null ? "–" : value.toLocaleString("en-US")}</dd>
    </div>
  );
}

function CardChips({ card }: { card: Flashcard }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted">{TRACK_LABEL[card.track]}</span>
      <span className="rounded-full border border-pink/30 bg-pink/10 px-2.5 py-0.5 text-xs text-blush">{card.topic}</span>
    </div>
  );
}

type CardViewProps = {
  card: Flashcard;
  revealed: boolean;
  /** CSS 3D flip when motion is allowed; otherwise the faces swap instantly. */
  flip: boolean;
  frontRef: RefObject<HTMLElement | null>;
  backRef: RefObject<HTMLElement | null>;
};

const FACE = "panel col-start-1 row-start-1 flex min-h-72 flex-col rounded-2xl p-6 sm:p-8";

function CardView({ card, revealed, flip, frontRef, backRef }: CardViewProps) {
  const uid = useId();
  return (
    <div className={cn(flip && "perspective-distant")}>
      <div
        className={cn(
          "grid",
          flip && "transform-3d transition-transform duration-500 ease-out-expo",
          flip && revealed && "rotate-y-180",
        )}
      >
        <section
          ref={frontRef}
          tabIndex={-1}
          aria-labelledby={`${uid}-front`}
          inert={revealed}
          className={cn(FACE, flip && "backface-hidden", !flip && revealed && "invisible")}
        >
          <CardChips card={card} />
          <p id={`${uid}-front`} className="eyebrow mt-6">
            Prompt
          </p>
          <p className="mt-3 font-display text-xl font-semibold leading-snug text-balance text-fg sm:text-2xl">{card.front}</p>
          <p className="mt-auto pt-8 text-sm text-muted">Recall the answer in your head, then reveal it.</p>
        </section>

        <section
          ref={backRef}
          tabIndex={-1}
          aria-labelledby={`${uid}-back`}
          inert={!revealed}
          className={cn(FACE, "border-pink/30", flip && "backface-hidden rotate-y-180", !flip && !revealed && "invisible")}
        >
          <CardChips card={card} />
          <p className="mt-6 text-sm leading-relaxed text-muted">
            <span className="font-medium text-fg">Prompt: </span>
            {card.front}
          </p>
          <p id={`${uid}-back`} className="eyebrow mt-5">
            Answer
          </p>
          <p className="mt-3 text-lg leading-relaxed text-fg sm:text-xl">{card.back}</p>
        </section>
      </div>
    </div>
  );
}

/**
 * Spaced-repetition study session. Track filter lives in the URL (?track=radiography|mri) so dashboard links
 * open the right deck; the topic filter is local. Scheduling comes from nextCardState/reviewCard in the
 * progress store. Must render under a Suspense boundary (useSearchParams).
 */
export function FlashcardStudy({ cards }: { cards: Flashcard[] }) {
  const searchParams = useSearchParams();
  const track = parseTrack(searchParams.get("track"));
  const progress = useProgress();
  const hydrated = useHydrated();
  const now = useNow();
  const reducedMotion = usePrefersReducedMotion();
  const topicSelectId = useId();

  const [topicChoice, setTopicChoice] = useState("all");
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(0);

  const frontRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<"front" | "back" | null>(null);

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const allIds = useMemo(() => cards.map((c) => c.id), [cards]);
  const trackCards = useMemo(() => (track === "all" ? cards : cards.filter((c) => c.track === track)), [cards, track]);
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of trackCards) counts.set(c.topic, (counts.get(c.topic) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [trackCards]);
  const topic = topics.some(([t]) => t === topicChoice) ? topicChoice : "all";
  const deckIds = useMemo(
    () => (topic === "all" ? trackCards : trackCards.filter((c) => c.topic === topic)).map((c) => c.id),
    [trackCards, topic],
  );

  const ready = hydrated && now > 0;
  const queue = useMemo(() => (ready ? buildQueue(progress, deckIds, now) : []), [ready, progress, deckIds, now]);
  const newCount = ready ? deckIds.filter((id) => !progress.cards[id]).length : null;
  const dueElsewhere = ready && (track !== "all" || topic !== "all") ? getDueCards(progress, allIds, now).length : 0;
  let nextDue: number | null = null;
  if (ready) {
    for (const id of deckIds) {
      const c = progress.cards[id];
      if (c && c.due > now && (nextDue === null || c.due < nextDue)) nextDue = c.due;
    }
  }

  const current = queue.length ? byId.get(queue[0]) : undefined;
  const currentId = current?.id ?? null;
  const revealed = currentId !== null && revealedId === currentId;

  function setTrack(next: TrackFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("track");
    else params.set("track", next);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  function reveal() {
    if (!currentId || revealed) return;
    pendingFocus.current = "back";
    setRevealedId(currentId);
  }

  function grade(g: ReviewGrade) {
    if (!currentId || !revealed) return;
    pendingFocus.current = "front";
    reviewCard(currentId, g);
    setReviewed((n) => n + 1);
  }

  // Move focus to the answer after revealing, and to the next card (or the summary) after grading.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const el = target === "back" ? backRef.current : (frontRef.current ?? doneRef.current);
    el?.focus();
  }, [currentId, revealed]);

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (!currentId || e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target instanceof Element ? e.target : null;
    if (isTypingTarget(target)) return;
    if (!revealed && (e.key === " " || e.key === "Enter")) {
      // Let focused buttons and links handle their own activation.
      if (target?.closest("button, a, summary, [role='button'], [role='link']")) return;
      e.preventDefault();
      reveal();
      return;
    }
    if (revealed) {
      const match = GRADES.find((g) => g.key === e.key);
      if (match) {
        e.preventDefault();
        grade(match.grade);
      }
    }
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKeyDown(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const previews = current
    ? GRADES.map((g) => formatInterval(nextCardState(progress.cards[current.id], g.grade, now).due - now))
    : [];

  return (
    <div className="mt-8 grid gap-8">
      <section aria-labelledby="deck-heading" className="panel rounded-2xl p-5 sm:p-6">
        <h2 id="deck-heading" className="text-lg font-semibold text-fg">
          Deck
        </h2>
        <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:items-end">
          <Segmented<TrackFilter> legend="Track" value={track} onChange={setTrack} options={TRACK_OPTIONS} className="max-w-md" />
          <div>
            <label htmlFor={topicSelectId} className="mb-2 block text-sm font-medium text-fg">
              Topic
            </label>
            <select
              id={topicSelectId}
              value={topic}
              onChange={(e) => setTopicChoice(e.currentTarget.value)}
              className="h-11 w-full rounded-xl border border-white/12 bg-ink-2 px-3 text-sm text-fg hover:border-white/25"
            >
              <option value="all">All topics ({trackCards.length})</option>
              {topics.map(([t, n]) => (
                <option key={t} value={t}>
                  {t} ({n})
                </option>
              ))}
            </select>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Due now" value={ready ? queue.length : null} />
          <Stat label="New" value={newCount} />
          <Stat label="Total" value={deckIds.length} />
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          New cards count as due until you review them once. Your schedule is saved in this browser.
        </p>
      </section>

      <section aria-labelledby="study-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="study-heading" className="text-lg font-semibold text-fg">
            Study session
          </h2>
          {ready && current ? (
            <p className="num text-sm text-muted">
              {reviewed} reviewed · {queue.length} left
            </p>
          ) : null}
        </div>

        <div className="mt-4">
          {!ready ? (
            <CardSkeleton />
          ) : cards.length === 0 ? (
            <p className="panel rounded-2xl p-6 text-muted">The flashcard deck is being written. Check back soon.</p>
          ) : deckIds.length === 0 ? (
            <p className="panel rounded-2xl p-6 text-muted">No cards match these filters. Choose another track or topic.</p>
          ) : current ? (
            <>
              <CardView
                key={current.id}
                card={current}
                revealed={revealed}
                flip={!reducedMotion}
                frontRef={frontRef}
                backRef={backRef}
              />

              <div className="mt-4">
                {revealed ? (
                  <div role="group" aria-label="Grade your recall" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {GRADES.map((g, i) => (
                      <button
                        key={g.grade}
                        type="button"
                        onClick={() => grade(g.grade)}
                        aria-keyshortcuts={g.key}
                        className="panel relative flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 transition-[background-color,border-color,transform] duration-150 hover:border-white/25 hover:bg-card-2 active:scale-[0.98]"
                      >
                        <span className={cn("text-sm font-semibold", g.tone)}>{g.label}</span>
                        <span className="num text-xs text-muted">
                          <span className="sr-only">, next review in </span>
                          {previews[i]}
                        </span>
                        <span aria-hidden className="absolute right-2 top-2 hidden sm:block">
                          <Kbd>{g.key}</Kbd>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <Button size="lg" onClick={reveal} aria-keyshortcuts="Space Enter" className="w-full sm:w-auto">
                    <Eye className="size-5" aria-hidden />
                    Show answer
                  </Button>
                )}
                <p className="mt-3 hidden text-xs text-muted sm:block">
                  Keyboard: <Kbd>Space</Kbd> or <Kbd>Enter</Kbd> shows the answer, then <Kbd>1</Kbd> to <Kbd>4</Kbd> grades
                  it (Again, Hard, Good, Easy).
                </p>
              </div>
            </>
          ) : (
            <div ref={doneRef} tabIndex={-1} className="panel rounded-2xl px-6 py-10 text-center sm:px-10">
              <CheckCircle2 className="mx-auto size-10 text-success" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-4 text-2xl font-semibold text-fg">{reviewed ? "Session complete" : "Nothing due right now"}</h3>
              <p className="mx-auto mt-2 max-w-md text-muted">
                {reviewed
                  ? `You reviewed ${reviewed} ${reviewed === 1 ? "card" : "cards"} this session.`
                  : "Every card in this deck is scheduled for later."}
              </p>
              {nextDue !== null ? (
                <p className="mx-auto mt-5 flex max-w-md flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-fg">
                  <CalendarClock className="size-4 text-blush" strokeWidth={1.75} aria-hidden />
                  Next card due {formatRelative(nextDue - now)}
                  <span className="text-muted">({formatDateTime(nextDue)})</span>
                </p>
              ) : null}
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/app">Back to dashboard</ButtonLink>
                {dueElsewhere > 0 ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setTopicChoice("all");
                      setTrack("all");
                    }}
                  >
                    Study all decks ({dueElsewhere} due)
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
