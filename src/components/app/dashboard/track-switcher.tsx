import { useId } from "react";
import { Check } from "lucide-react";
import type { ExamTrack } from "@/lib/content/types";
import { TRACK_LABEL } from "@/lib/content/types";

const TRACKS: ExamTrack[] = ["radiography", "mri"];

/** Segmented control built on native radios: arrow keys and screen readers work without extra code. */
export function TrackSwitcher({ value, onChange }: { value: ExamTrack; onChange: (track: ExamTrack) => void }) {
  const name = `track-${useId()}`;
  return (
    <fieldset>
      <legend className="sr-only">Show progress for exam track</legend>
      <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {TRACKS.map((track) => {
          const checked = value === track;
          return (
            <label
              key={track}
              className="relative inline-flex min-h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-muted transition-colors duration-150 hover:text-fg has-[:checked]:bg-white/10 has-[:checked]:text-fg has-[:checked]:ring-1 has-[:checked]:ring-inset has-[:checked]:ring-pink/45 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush"
            >
              <input
                type="radio"
                name={name}
                value={track}
                checked={checked}
                onChange={() => onChange(track)}
                className="sr-only"
              />
              {checked ? <Check aria-hidden strokeWidth={2} className="size-4 text-pink" /> : null}
              {TRACK_LABEL[track]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
