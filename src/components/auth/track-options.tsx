import { CircleCheck, Magnet, ScanLine, type LucideIcon } from "lucide-react";
import type { ExamTrack } from "@/lib/content/types";
import { TRACK_LABEL } from "@/lib/content/types";

const OPTIONS: { track: ExamTrack; Icon: LucideIcon; detail: string }[] = [
  { track: "radiography", Icon: ScanLine, detail: "Radiography registry prep" },
  { track: "mri", Icon: Magnet, detail: "MRI registry prep and physics" },
];

type Props = {
  name: string;
  legend: string;
  /** Controlled value. Omit (and pass defaultValue) for an uncontrolled group read via FormData. */
  value?: ExamTrack;
  defaultValue?: ExamTrack;
  onChange?: (track: ExamTrack) => void;
};

/** Radio cards for the exam track. Native radios, so arrow keys and form semantics work as expected. */
export function TrackOptions({ name, legend, value, defaultValue, onChange }: Props) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-fg">{legend}</legend>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {OPTIONS.map(({ track, Icon, detail }) => (
          <label
            key={track}
            className="group relative flex min-h-11 items-start gap-3 rounded-xl border border-white/12 bg-ink-2 p-4 transition-colors duration-150 hover:border-white/25 has-[:checked]:border-pink/70 has-[:checked]:bg-pink/[0.08] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blush"
          >
            <input
              type="radio"
              name={name}
              value={track}
              className="sr-only"
              {...(value !== undefined
                ? { checked: value === track, onChange: () => onChange?.(track) }
                : { defaultChecked: defaultValue === track })}
            />
            <Icon
              aria-hidden
              strokeWidth={1.75}
              className="mt-0.5 size-5 shrink-0 text-silver group-has-[:checked]:text-pink"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-fg">{TRACK_LABEL[track]}</span>
              <span className="mt-0.5 block text-sm text-muted">{detail}</span>
            </span>
            <CircleCheck
              aria-hidden
              strokeWidth={1.75}
              className="size-5 shrink-0 text-pink opacity-0 transition-opacity duration-150 group-has-[:checked]:opacity-100"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
