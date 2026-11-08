"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Question } from "@/lib/content/types";
import { QuestionCard } from "@/components/app/question-card";
import { Button } from "@/components/ui/button";
import { recordAnswer } from "@/lib/store/progress";

type Entry = { selected: number | null; revealed: boolean };

const EMPTY: Entry = { selected: null, revealed: false };

/** End-of-lesson check: select, check, reveal the rationale. Each check is recorded with mode "lesson". */
export function LessonCheck({ questions }: { questions: Question[] }) {
  const [entries, setEntries] = useState<Record<string, Entry>>({});

  const entryFor = (id: string) => entries[id] ?? EMPTY;
  const checked = questions.filter((q) => entryFor(q.id).revealed);
  const correct = checked.filter((q) => entryFor(q.id).selected === q.answer).length;
  const allChecked = questions.length > 0 && checked.length === questions.length;

  function select(id: string, choice: number) {
    setEntries((e) => ({ ...e, [id]: { selected: choice, revealed: false } }));
  }

  function check(q: Question) {
    const entry = entries[q.id];
    if (!entry || entry.selected === null || entry.revealed) return;
    recordAnswer({
      qid: q.id,
      track: q.track,
      category: q.category,
      choice: entry.selected,
      correct: entry.selected === q.answer,
      mode: "lesson",
    });
    setEntries((e) => ({ ...e, [q.id]: { ...entry, revealed: true } }));
  }

  function retry(id: string) {
    setEntries((e) => ({ ...e, [id]: EMPTY }));
  }

  return (
    <div className="mt-6">
      <div className="grid gap-8">
      {questions.map((q, i) => {
        const entry = entryFor(q.id);
        return (
          <div key={q.id}>
            <QuestionCard
              question={q}
              selected={entry.selected}
              onSelect={(choice) => select(q.id, choice)}
              revealed={entry.revealed}
              counter={`Question ${i + 1} of ${questions.length}`}
              headingLevel="h3"
            />
            <div className="mt-3 flex justify-end">
              {/* One element for both states so keyboard focus stays put after checking. */}
              <Button
                variant="secondary"
                onClick={() => (entry.revealed ? retry(q.id) : check(q))}
                disabled={!entry.revealed && entry.selected === null}
              >
                {entry.revealed ? (
                  <>
                    <RotateCcw className="size-4" aria-hidden />
                    Try again
                  </>
                ) : (
                  "Check answer"
                )}
              </Button>
            </div>
          </div>
        );
      })}
      </div>
      <p aria-live="polite" className="mt-6 text-sm font-medium text-fg">
        {allChecked ? `You answered ${correct} of ${questions.length} correctly.` : null}
      </p>
    </div>
  );
}
