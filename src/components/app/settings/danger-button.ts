import { cn } from "@/lib/cn";

/**
 * Destructive button styles. The shared Button has no danger variant, and cn() does not merge conflicting
 * utilities, so these are standalone classes mirroring Button's base (44px min height, xl radius, press scale).
 */
const base =
  "inline-flex min-h-11 select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-[0.95rem] font-semibold " +
  "transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-45";

export function dangerButtonClasses(kind: "solid" | "outline", className?: string) {
  return cn(
    base,
    kind === "solid"
      ? "bg-danger text-ink hover:bg-danger/85"
      : "border border-danger/45 bg-transparent text-danger hover:border-danger/70 hover:bg-danger/10",
    className,
  );
}
