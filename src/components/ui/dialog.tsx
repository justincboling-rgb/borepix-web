"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useId, useRef, type ReactNode, type RefObject } from "react";
import { ARRIVAL_EASE, OverlayPortal, overlayCloseButtonClasses, useModalLayer } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";

type Size = "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-3xl",
};

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** id of the element that labels the dialog, when it is not the rendered title. */
  labelledBy?: string;
  /** Receives focus on open instead of the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Width from `sm` up. Phones always get the full width as a bottom sheet. */
  size?: Size;
  /** False disables the close button; pair it with an onClose that ignores the request. */
  dismissible?: boolean;
  className?: string;
};

/**
 * Centered modal (bottom sheet on phones) with a fixed header and a scrollable body. Same contract as
 * <Sheet>: role="dialog", focus trapped, Escape and backdrop close, body scroll locked, focus returns
 * to the opener, reduced-motion safe.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  labelledBy,
  initialFocusRef,
  size = "lg",
  dismissible = true,
  className,
}: DialogProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalLayer({ open, onClose, panelRef, initialFocusRef });

  return (
    <OverlayPortal>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="dialog"
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              aria-hidden
              onClick={onClose}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              transition={{ duration: reduce ? 0 : 0.3, ease: "easeOut" }}
              className="absolute inset-0 bg-ink/75 backdrop-blur-sm"
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy ?? titleId}
              tabIndex={-1}
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: reduce ? 0 : 0.45, ease: ARRIVAL_EASE }}
              className={cn(
                "relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-card text-fg shadow-panel outline-none",
                "sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl",
                sizes[size],
                className,
              )}
            >
              <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                <h2 id={titleId} className="min-w-0 text-lg font-semibold text-fg">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  disabled={!dismissible}
                  className={cn(overlayCloseButtonClasses, "-mr-2")}
                >
                  <X className="size-5" strokeWidth={1.75} aria-hidden />
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin">{children}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </OverlayPortal>
  );
}
