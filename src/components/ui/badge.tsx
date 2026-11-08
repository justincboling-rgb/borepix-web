import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Tone = "neon" | "neutral" | "success" | "warning" | "outline";

const tones: Record<Tone, string> = {
  neon: "border-pink/40 bg-pink/10 text-blush",
  neutral: "border-white/10 bg-white/[0.04] text-muted",
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  outline: "border-line bg-transparent text-fg",
};

/** Small pill label. Use `neon` for one highlight per card at most. */
export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
