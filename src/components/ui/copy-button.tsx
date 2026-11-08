"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  /** The text written to the clipboard. */
  value: string;
  /** Accessible name, e.g. "Copy referral link". */
  label: string;
  size?: "sm" | "md";
  className?: string;
  /** Show the label text next to the icon. */
  showLabel?: boolean;
};

/** Copies `value` to the clipboard and confirms with "Copied" for 1.5 s. Announces via aria-live. */
export function CopyButton({ value, label, size = "sm", className, showLabel = false }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] font-medium text-fg transition-colors duration-150 hover:border-white/25 hover:bg-white/[0.08]",
        size === "sm" ? "min-h-11 min-w-11 px-2.5 text-xs" : "min-h-11 px-3.5 text-sm",
        copied && "border-success/50 text-success",
        className,
      )}
    >
      {copied ? (
        <Check className="size-4" strokeWidth={2} aria-hidden />
      ) : (
        <Copy className="size-4" strokeWidth={1.75} aria-hidden />
      )}
      {showLabel ? <span>{copied ? "Copied" : label}</span> : null}
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
