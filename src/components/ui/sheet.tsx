"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useEffectEvent, useId, useRef, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

/* ───────────────────────── Shared modal-layer behavior ─────────────────────────
   Used by <Sheet> (right-side slide-over, z-50) and <Dialog> (centered modal, z-60). */

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getAttribute("aria-hidden") !== "true" && el.getClientRects().length > 0,
  );
}

/** Open layers, bottom to top. Only the topmost one answers Escape and owns the focus trap. */
const layers: object[] = [];

let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

/** Locks body scroll and pads for the vanished scrollbar so the page does not shift. Reference counted. */
function lockScroll() {
  lockCount += 1;
  if (lockCount > 1) return;
  const body = document.body;
  savedOverflow = body.style.overflow;
  savedPaddingRight = body.style.paddingRight;
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  body.style.overflow = "hidden";
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  document.body.style.overflow = savedOverflow;
  document.body.style.paddingRight = savedPaddingRight;
}

export type ModalLayerOptions = {
  open: boolean;
  onClose: () => void;
  /** The dialog element. Give it tabIndex={-1} so it can take focus when nothing inside can. */
  panelRef: RefObject<HTMLElement | null>;
  /** Receives focus on open instead of the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Everything a modal layer needs besides its markup: body scroll lock, Escape to close, a Tab / Shift+Tab
 * focus trap, initial focus, and returning focus to the element that opened it when it closes.
 */
export function useModalLayer({ open, onClose, panelRef, initialFocusRef }: ModalLayerOptions) {
  const requestClose = useEffectEvent(() => {
    onClose();
  });

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const token = {};
    layers.push(token);
    lockScroll();
    const isTop = () => layers[layers.length - 1] === token;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const frame = window.requestAnimationFrame(() => {
      const target = initialFocusRef?.current ?? focusableIn(panel)[0] ?? panel;
      target.focus({ preventScroll: true });
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isTop()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusableIn(panel);
      if (items.length === 0) {
        e.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && panel.contains(active);
      if (e.shiftKey) {
        if (!inside || active === first || active === panel) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // Pull focus back if it escapes the panel (screen-reader cursor, programmatic focus elsewhere).
    const onFocusIn = (e: FocusEvent) => {
      if (!isTop()) return;
      if (e.target instanceof Node && panel.contains(e.target)) return;
      (focusableIn(panel)[0] ?? panel).focus({ preventScroll: true });
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      const i = layers.indexOf(token);
      if (i >= 0) layers.splice(i, 1);
      unlockScroll();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, panelRef, initialFocusRef]);
}

const subscribeNoop = () => () => {};

/** Renders children into document.body once mounted, so overlays escape any transformed ancestor. */
export function OverlayPortal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export const overlayCloseButtonClasses =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-silver transition-colors duration-150 " +
  "hover:bg-white/[0.06] hover:text-fg disabled:opacity-40";

export const ARRIVAL_EASE = [0.16, 1, 0.3, 1] as const;

/* ───────────────────────── Sheet ───────────────────────── */

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** id of the element that labels the dialog, when it is not the rendered title. */
  labelledBy?: string;
  /** Receives focus on open instead of the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** False hides nothing but disables the close button; pair it with an onClose that ignores the request. */
  dismissible?: boolean;
  className?: string;
};

/**
 * Right-side slide-over. Full width on phones, 28rem from `sm`. Backdrop fade and panel slide are
 * Framer Motion, reduced-motion falls back to a plain fade. role="dialog", focus trapped, Escape and
 * backdrop close, body scroll locked, focus returns to the opener.
 */
export function Sheet({ open, onClose, title, children, labelledBy, initialFocusRef, dismissible = true, className }: SheetProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalLayer({ open, onClose, panelRef, initialFocusRef });

  return (
    <OverlayPortal>
      <AnimatePresence>
        {open ? (
          <motion.div key="sheet" className="fixed inset-0 z-50" initial="hidden" animate="visible" exit="hidden">
            <motion.div
              aria-hidden
              onClick={onClose}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              transition={{ duration: reduce ? 0 : 0.3, ease: "easeOut" }}
              className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy ?? titleId}
              tabIndex={-1}
              variants={{
                hidden: reduce ? { opacity: 0 } : { x: "100%" },
                visible: reduce ? { opacity: 1 } : { x: 0 },
              }}
              transition={{ duration: reduce ? 0 : 0.5, ease: ARRIVAL_EASE }}
              className={cn(
                "absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-card text-fg shadow-panel outline-none sm:max-w-md",
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
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </OverlayPortal>
  );
}
