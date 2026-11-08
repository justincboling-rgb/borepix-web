"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const COPIED_MS = 1500;

/** Writes to the clipboard; falls back to a selection copy where the async API is unavailable. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.setAttribute("aria-hidden", "true");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

type State = "idle" | "copied" | "failed";

const LABEL: Record<State, string> = {
  idle: "Copy",
  copied: "Copied",
  failed: "Copy failed",
};

type Props = {
  /** The text written to the clipboard. */
  text: string;
  /** What is being copied, for the accessible name: "license key BPX-…". */
  label: string;
  className?: string;
};

/** Small "Copy" chip that confirms with "Copied" for 1.5 s. */
export function CopyButton({ text, label, className }: Props) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  async function onClick() {
    const ok = await copyText(text);
    setState(ok ? "copied" : "failed");
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), COPIED_MS);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${LABEL[state]}: ${label}`}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-fg",
        "transition-colors duration-150 hover:border-white/25 hover:bg-white/[0.08]",
        state === "copied" && "border-success/40 bg-success/10 text-success hover:border-success/40 hover:bg-success/10",
        state === "failed" && "border-danger/40 text-danger",
        className,
      )}
    >
      {state === "copied" ? (
        <Check className="size-3.5" strokeWidth={2.25} aria-hidden />
      ) : (
        <Copy className="size-3.5" strokeWidth={1.75} aria-hidden />
      )}
      <span aria-live="polite">{LABEL[state]}</span>
    </button>
  );
}
