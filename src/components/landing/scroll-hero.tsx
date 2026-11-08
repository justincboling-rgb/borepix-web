"use client";

import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { larmorMHz } from "@/lib/mri-physics";
import { FRAME_COUNT, chooseFrameSet, getFrameStore, type FrameStore } from "./hero/frames";
import styles from "./hero/scroll-hero.module.css";

/**
 * Landing hero: the pink-graded MRI footage scrubbed by scroll on a <canvas>.
 *
 * - Frames: /public/frames (1920 px) or /public/frames-sm (960 px), loaded coarse-to-fine (see hero/frames.ts).
 * - Playhead: target progress comes from scroll; the drawn progress eases toward it in a rAF loop that
 *   stops when it converges or the hero leaves the viewport.
 * - Captions: four beats cross-fade by scroll distance; the first holds the page's h1.
 * - Static mode: prefers-reduced-motion or Save-Data shows one still frame and only the first beat.
 *   The page is complete if no frame ever loads.
 */

type Beat = { from: number; to: number };

// Scroll ranges, aligned to the footage: C-arm (0â€“.27), radiography suite (.34â€“.54),
// bore close-up and tunnel (.6â€“.8), scanner front (.86â€“1).
const BEATS: Beat[] = [
  { from: 0, to: 0.24 },
  { from: 0.3, to: 0.53 },
  { from: 0.58, to: 0.8 },
  { from: 0.85, to: 1 },
];
const FADE = 0.045;
const MRI_FROM = 0.58;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

function beatOpacity(p: number, i: number): number {
  const b = BEATS[i];
  const fadeIn = i === 0 ? 1 : smoothstep(b.from, b.from + FADE, p);
  const fadeOut = i === BEATS.length - 1 ? 1 : 1 - smoothstep(b.to - FADE, b.to, p);
  return clamp(fadeIn * fadeOut, 0, 1);
}

export function ScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameLabel = useRef<HTMLSpanElement>(null);
  const modalityLabel = useRef<HTMLSpanElement>(null);
  const railFill = useRef<HTMLSpanElement>(null);
  const scanLabel = useRef<HTMLSpanElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderText = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  // The poster is the LCP image: ask the browser for it early.
  preload("/hero/poster-1920.webp", { as: "image", fetchPriority: "high" });

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    );
    const ctx = canvas.getContext("2d", { alpha: false });
    const beatEls = Array.from(section.querySelectorAll<HTMLElement>("[data-beat]"));

    let scrub = false;
    let store: FrameStore | null = null;
    let unsubscribe: (() => void) | null = null;
    let raf = 0;
    let lastTick = 0;
    let target = 0;
    let shown = 0;
    let drawnImg: HTMLImageElement | null = null;
    let onScreen = true;
    let idleId: number | null = null;
    let timeoutId: number | null = null;
    const cache = { beatOp: BEATS.map(() => -1), frame: -1, mri: null as boolean | null, cue: null as boolean | null };

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const range = section.offsetHeight - window.innerHeight;
      return range > 0 ? clamp(-rect.top / range, 0, 1) : 0;
    };

    /* ---------- canvas ---------- */
    let cw = 0;
    let ch = 0;
    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(stage.clientWidth * dpr));
      const h = Math.max(1, Math.round(stage.clientHeight * dpr));
      if (w !== cw || h !== ch) {
        cw = w;
        ch = h;
        canvas.width = w;
        canvas.height = h;
        drawnImg = null; // resizing clears the bitmap; force the next draw
      }
    };

    /** Draw the loaded frame nearest to `index`; a no-op when that image is already on the canvas. */
    const draw = (index: number) => {
      if (!ctx || !store) return;
      const img = store.nearest(index);
      if (!img || img === drawnImg) return;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const s = Math.max(cw / iw, ch / ih);
      const w = iw * s;
      const h = ih * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawnImg = img;
      if (canvas.dataset.ready !== "true") canvas.dataset.ready = "true";
    };

    /* ---------- overlays (delta-gated DOM writes) ---------- */
    const paintOverlays = (p: number) => {
      BEATS.forEach((_, i) => {
        const el = beatEls[i];
        if (!el) return;
        const op = beatOpacity(p, i);
        if (Math.abs(op - cache.beatOp[i]) < 0.004 && op !== 0 && op !== 1) return;
        if (op === cache.beatOp[i]) return;
        cache.beatOp[i] = op;
        const dir = p < (BEATS[i].from + BEATS[i].to) / 2 ? 1 : -1;
        el.style.opacity = op.toFixed(3);
        el.style.transform = op >= 0.999 ? "none" : `translate3d(0, ${((1 - op) * 18 * dir).toFixed(1)}px, 0)`;
        const hidden = op < 0.08;
        if (el.inert !== hidden) el.inert = hidden;
      });

      const frame = Math.round(p * (FRAME_COUNT - 1));
      if (frame !== cache.frame) {
        cache.frame = frame;
        if (frameLabel.current) frameLabel.current.textContent = `${String(frame + 1).padStart(4, "0")} / ${FRAME_COUNT}`;
        if (scanLabel.current) scanLabel.current.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
        if (railFill.current) railFill.current.style.transform = `scaleX(${p.toFixed(4)})`;
      }
      const mri = p >= MRI_FROM;
      if (mri !== cache.mri) {
        cache.mri = mri;
        if (modalityLabel.current) {
          modalityLabel.current.textContent = mri
            ? `MRI Â· Bâ‚€ 3.0 T Â· ${larmorMHz(3).toFixed(1)} MHz`
            : "Radiography Â· Fluoro C-arm";
        }
      }
      const cue = p < 0.015;
      if (cue !== cache.cue) {
        cache.cue = cue;
        if (cueRef.current) cueRef.current.style.opacity = cue ? "1" : "0";
      }
    };

    /* ---------- loop ---------- */
    const render = (p: number) => {
      draw(p * (FRAME_COUNT - 1));
      paintOverlays(p);
    };

    const tick = (now: number) => {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.18, dt / 16.667));
      if (Math.abs(target - shown) < 0.0004) {
        shown = target;
        raf = 0;
        lastTick = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
      render(shown);
    };

    const kick = () => {
      if (!raf && onScreen) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = progress();
      kick();
    };

    const onResize = () => {
      sizeCanvas();
      target = progress();
      render(shown);
      kick();
    };

    /* ---------- loading ---------- */
    const updateLoader = () => {
      if (!store || !loaderRef.current) return;
      const pct = Math.round(store.coarseProgress() * 100);
      if (loaderText.current) loaderText.current.textContent = `${pct}%`;
      loaderRef.current.dataset.done = pct >= 100 ? "true" : "false";
    };

    const startLoading = () => {
      idleId = null;
      timeoutId = null;
      if (!scrub) return;
      const set = chooseFrameSet(stage.clientWidth, window.devicePixelRatio || 1);
      store = getFrameStore(set);
      unsubscribe = store.subscribe(() => {
        updateLoader();
        // draw() is a no-op unless the new arrival is now the nearest frame to the playhead.
        draw(shown * (FRAME_COUNT - 1));
      });
      updateLoader();
      draw(shown * (FRAME_COUNT - 1));
    };

    /* ---------- mode gate ---------- */
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen && scrub) onScroll();
      },
      { threshold: 0 },
    );

    const enable = () => {
      if (scrub) return;
      scrub = true;
      section.dataset.static = "false";
      sizeCanvas();
      target = shown = progress();
      cache.beatOp = BEATS.map(() => -1);
      cache.frame = -1;
      cache.mri = null;
      cache.cue = null;
      render(shown);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      io.observe(section);
      // Let the poster, fonts and first paint win; then start the frames.
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(startLoading, { timeout: 1200 });
      } else {
        timeoutId = window.setTimeout(startLoading, 300);
      }
    };

    const cancelStart = () => {
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      idleId = null;
      timeoutId = null;
    };

    const disable = () => {
      if (scrub) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        io.disconnect();
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        lastTick = 0;
      }
      scrub = false;
      cancelStart();
      unsubscribe?.();
      unsubscribe = null;
      section.dataset.static = "true";
      if (loaderRef.current) loaderRef.current.dataset.done = "true";
      beatEls.forEach((el, i) => {
        el.style.opacity = i === 0 ? "1" : "0";
        el.style.transform = "none";
        el.inert = i !== 0;
      });
    };

    const applyMode = () => {
      if (reduceMq.matches || saveData || !ctx) disable();
      else enable();
    };

    reduceMq.addEventListener("change", applyMode);
    applyMode();

    return () => {
      reduceMq.removeEventListener("change", applyMode);
      cancelStart();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      unsubscribe?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-title"
      className={styles.hero}
      data-static="false"
    >
      <noscript>
        <style>{`[data-static]{height:100svh!important}`}</style>
      </noscript>

      <div className={styles.sticky}>
        <div ref={stageRef} className={styles.stage}>
          <picture className={styles.poster}>
            <source
              media="(prefers-reduced-motion: reduce)"
              type="image/webp"
              srcSet="/hero/static-960.webp 960w, /hero/static-1920.webp 1920w"
              sizes="100vw"
            />
            <source media="(prefers-reduced-motion: reduce)" srcSet="/hero/static-1920.jpg" />
            <source type="image/webp" srcSet="/hero/poster-960.webp 960w, /hero/poster-1920.webp 1920w" sizes="100vw" />
            <img
              src="/hero/poster-1920.jpg"
              alt="An X-ray C-arm lit in neon pink, the opening shot of the Borepix scan sequence"
              width={1920}
              height={1080}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        </div>

        <div className={styles.scrimTop} aria-hidden="true" />
        <div className={styles.scrimSide} aria-hidden="true" />
        <div className={styles.scrimBottom} aria-hidden="true" />

        {/* HUD */}
        <div
          className={cn(styles.hud, "pointer-events-none absolute right-4 top-20 z-10 hidden flex-col items-end gap-1.5 md:flex lg:right-8")}
          aria-hidden="true"
        >
          <span className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-pink shadow-[0_0_10px_2px_rgb(255_0_127/0.8)]" />
            <span ref={modalityLabel}>Radiography Â· Fluoro C-arm</span>
          </span>
          <span>
            Frame <span ref={frameLabel}>0001 / {FRAME_COUNT}</span>
          </span>
        </div>

        <div
          className={cn(styles.hud, "pointer-events-none absolute bottom-8 right-4 z-10 hidden items-center gap-3 md:flex lg:right-8")}
          aria-hidden="true"
        >
          <span>Scan</span>
          <span className={styles.rail}>
            <span ref={railFill} className={styles.railFill} />
          </span>
          <span ref={scanLabel}>000%</span>
        </div>

        <div
          ref={loaderRef}
          data-done="true"
          className={cn(
            styles.hud,
            "pointer-events-none absolute left-4 top-20 z-10 flex items-center gap-2 transition-opacity duration-500 data-[done=true]:opacity-0 sm:left-6 lg:left-8",
          )}
          aria-hidden="true"
        >
          <span className="relative inline-flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-pink/60" />
            <span className="relative inline-block size-2 rounded-full bg-pink" />
          </span>
          Loading scan <span ref={loaderText}>0%</span>
        </div>

        {/* Caption beats */}
        <div className="absolute inset-x-0 bottom-0 z-20 pb-[max(env(safe-area-inset-bottom),5svh)] md:pb-[11svh]">
          <div className={cn("container-x", styles.beats)}>
            <div data-beat="0" className={cn(styles.beat, "max-w-2xl")}>
              <p className="eyebrow">ARRTÂ® registry prep Â· Radiography + MRI</p>
              <h1
                id="hero-title"
                className="mt-4 text-[2.35rem] font-semibold leading-[1.04] tracking-[-0.03em] text-fg sm:text-6xl lg:text-7xl [@media(max-height:560px)]:text-4xl"
              >
                From first exposure to the <span className="text-gradient">bore of the magnet.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg [@media(max-height:560px)]:hidden">
                The exam-prep platform and mobile app for Radiologic Technologists: registry-style questions with full
                rationales, timed mock exams, and MRI physics you can watch move.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap [@media(max-height:560px)]:mt-5">
                <ButtonLink href="/signup" size="lg" className="px-4 sm:px-7">
                  Start studying
                  <ArrowRight className="hidden size-4 sm:block" aria-hidden />
                </ButtonLink>
                <ButtonLink href="/#try" variant="secondary" size="lg" className="px-4 sm:px-7">
                  Try a question
                </ButtonLink>
              </div>
            </div>

            <div data-beat="1" className={cn(styles.beat, "max-w-xl")}>
              <p className="eyebrow">Module 01 Â· Registry question bank</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.06] text-fg sm:text-5xl">
                Every content category. <span className="text-gradient">Every rationale.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
                Patient Care, Safety, Image Production and Procedures: the four areas the ARRTÂ® content specifications
                are built on. Each answer explains why it is right, and why the others are not.
              </p>
            </div>

            <div data-beat="2" className={cn(styles.beat, "max-w-xl")}>
              <p className="eyebrow">Module 02 Â· MRI Mastery</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.06] text-fg sm:text-5xl">
                Inside the bore, <span className="text-gradient">the physics moves.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
                Drag TR and TE and watch tissue contrast change. Watch k-space build an image. Precession, relaxation
                and SAR stop being formulas and start making sense.
              </p>
            </div>

            <div data-beat="3" className={cn(styles.beat, "max-w-xl")}>
              <p className="eyebrow">Module 03 Â· Exam simulation</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.06] text-fg sm:text-5xl">
                Walk into the exam <span className="text-gradient">already at home.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
                Timed mock exams in a computer-based format, readiness tracked by category, and spaced-repetition review
                on your phone between cases.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <ButtonLink href="/signup" size="lg" className="px-4 sm:px-7">
                  Start studying
                  <ArrowRight className="hidden size-4 sm:block" aria-hidden />
                </ButtonLink>
                <ButtonLink href="/#pricing" variant="secondary" size="lg" className="px-4 sm:px-7">
                  See pricing
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue (desktop) */}
        <div
          ref={cueRef}
          className={cn(
            styles.cue,
            "pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex",
          )}
          aria-hidden="true"
        >
          <span className={styles.hud}>Scroll to scan</span>
          <span className="relative block h-8 w-px overflow-hidden bg-white/15">
            <span className={cn(styles.cueDot, "absolute left-0 top-0 block h-3 w-px bg-blush")} />
          </span>
        </div>
      </div>
    </section>
  );
}
