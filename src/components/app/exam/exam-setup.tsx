"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { EyeOff, Info, ListChecks, Play, Send, Shuffle, Timer, Target } from "lucide-react";
import type { ExamTrack } from "@/lib/content/types";
import { TRACK_LABEL } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/app/practice/choice-group";
import { Kbd } from "@/components/app/practice/kbd";
import { useFocusOnMount } from "@/components/app/practice/use-focus-on-mount";
import {
  bankSize,
  examPace,
  formatDuration,
  hasBlueprintWeights,
  itemCount,
  LENGTH_TARGET,
  timeLimitSec,
  type ExamLength,
} from "./exam-model";

const TRACKS: ExamTrack[] = ["radiography", "mri"];
const LENGTHS: { value: ExamLength; label: string }[] = [
  { value: "quick", label: "Quick" },
  { value: "standard", label: "Standard" },
  { value: "full", label: "Full bank" },
];

type Props = {
  defaultTrack: ExamTrack;
  onStart: (track: ExamTrack, length: ExamLength) => void;
  focusHeading: boolean;
};

export function ExamSetup({ defaultTrack, onStart, focusHeading }: Props) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>(focusHeading);
  const [trackChoice, setTrackChoice] = useState<ExamTrack | null>(null);
  const [length, setLength] = useState<ExamLength>("quick");

  const track = trackChoice ?? defaultTrack;
  const bank = bankSize(track);
  const pace = examPace(track);
  const weighted = hasBlueprintWeights(track);
  const { count } = itemCount(track, length);
  const limit = timeLimitSec(count, pace);
  const perItem = Number(pace.minutesPerItem.toFixed(2));

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (count > 0) onStart(track, length);
  }

  return (
    <div className="grid gap-6">
      <header>
        <p className="eyebrow">Timed simulation</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-3xl font-semibold text-fg sm:text-4xl">
          Mock exam
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          A timed, registry-style exam built from original Borepix questions written to the ARRT® content categories.
          These are not actual exam items.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <form onSubmit={submit} className="panel rounded-2xl p-5 sm:p-7" aria-labelledby="exam-setup-title">
          <h2 id="exam-setup-title" className="text-xl font-semibold text-fg">
            Set up your exam
          </h2>

          <div className="mt-6 grid gap-6">
            <ChoiceGroup<ExamTrack>
              legend="Exam track"
              value={track}
              onChange={setTrackChoice}
              options={TRACKS.map((t) => {
                const n = bankSize(t);
                return {
                  value: t,
                  label: TRACK_LABEL[t],
                  description: `${n} ${n === 1 ? "question" : "questions"} in the bank`,
                };
              })}
            />

            <ChoiceGroup<ExamLength>
              legend="Length"
              value={length}
              onChange={setLength}
              columnsClassName="sm:grid-cols-3"
              hint={bank > 0 && bank < LENGTH_TARGET.standard ? <CapNote bank={bank} track={track} /> : undefined}
              options={LENGTHS.map((l) => {
                const n = itemCount(track, l.value).count;
                return {
                  value: l.value,
                  label: l.label,
                  description: n ? `${n} ${n === 1 ? "item" : "items"}, ${formatDuration(timeLimitSec(n, pace))}` : "No items yet",
                  disabled: n === 0,
                };
              })}
            />
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-ink-2 p-4">
            <p className="flex flex-wrap items-baseline gap-x-2 text-fg">
              <span className="font-medium">Time limit</span>
              <span className="num text-lg font-semibold">{count ? formatDuration(limit) : "None"}</span>
              <span className="text-sm text-muted">
                for {count} {count === 1 ? "item" : "items"}
              </span>
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-silver" strokeWidth={1.75} aria-hidden />
              {pace.approximate ? (
                <span>
                  Approximate pace: <span className="num text-fg">{perItem}</span> minutes per item.
                </span>
              ) : (
                <span>
                  Pace of <span className="num text-fg">{perItem}</span> minutes per item, from the ARRT® published
                  testing time and item count for this exam.
                </span>
              )}
            </p>
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={count === 0}>
            <Play className="size-5" strokeWidth={1.75} aria-hidden />
            Start mock exam
          </Button>
          {count === 0 ? (
            <p className="mt-3 text-sm text-muted">
              There are no {TRACK_LABEL[track]} questions in the bank yet. Choose the other track.
            </p>
          ) : null}
        </form>

        <aside className="panel rounded-2xl p-5 sm:p-6" aria-labelledby="exam-how-title">
          <h2 id="exam-how-title" className="text-lg font-semibold text-fg">
            How the simulation works
          </h2>
          <ul className="mt-4 grid gap-4 text-sm text-muted">
            <HowItem icon={<EyeOff />}>
              Content categories are hidden during the exam, like the real computer-based test. You see them in your
              results.
            </HowItem>
            <HowItem icon={<Shuffle />}>
              {weighted
                ? "Items are drawn in proportion to the ARRT® content category weights, then shuffled."
                : "Items are spread evenly across the four content categories, then shuffled."}
            </HowItem>
            <HowItem icon={<ListChecks />}>
              Move freely between items, flag any item for review, and change answers until you submit.
            </HowItem>
            <HowItem icon={<Timer />}>
              The countdown runs to a fixed end time, so it keeps going if you switch tabs. Refreshing this tab resumes
              your attempt.
            </HowItem>
            <HowItem icon={<Send />}>
              When time runs out, the exam submits automatically. Unanswered items count as incorrect.
            </HowItem>
            <HowItem icon={<Target />}>
              Results show a raw percentage on Borepix practice items, not a scaled score.
            </HowItem>
          </ul>
          <p className="mt-5 hidden border-t border-white/8 pt-4 text-sm text-muted sm:block">
            <span className="font-medium text-silver">Keyboard:</span> <Kbd>1</Kbd>&ndash;<Kbd>4</Kbd> choose,{" "}
            <Kbd>F</Kbd> flag, <Kbd>&larr;</Kbd> <Kbd>&rarr;</Kbd> previous or next item.
          </p>
        </aside>
      </div>
    </div>
  );
}

function CapNote({ bank, track }: { bank: number; track: ExamTrack }) {
  const which = bank < LENGTH_TARGET.quick ? "Quick and Standard both use" : "Standard uses";
  return (
    <>
      The {TRACK_LABEL[track]} bank has <span className="num text-fg">{bank}</span>{" "}
      {bank === 1 ? "question" : "questions"} right now, so {which} all {bank}.
    </>
  );
}

function HowItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-blush [&>svg]:size-4 [&>svg]:stroke-[1.75]"
        aria-hidden
      >
        {icon}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
