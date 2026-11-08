"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Layers, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { larmorMHz } from "@/lib/mri-physics";
import { DomeModel, type ScanPhase } from "./dome-three";
import { DOME_PARTS } from "./parts";

type Props = {
  className?: string;
  /** Called when WebGL cannot be created; the parent swaps in the static fallback. */
  onUnsupported?: () => void;
};

type Inputs = {
  exploded: boolean;
  hover: boolean;
  focus: number;
  /** 0–1 progress of the stage through the viewport: drives explosion and rotation on scroll. */
  scroll: number;
  table: number;
  dragging: boolean;
  pointer: { x: number; y: number } | null;
  reduce: boolean;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const PHASE_LABEL: Record<ScanPhase, string> = {
  idle: "Idle",
  advancing: "Table advancing",
  scanning: "Scanning",
  returning: "Table returning",
};

/** Announced once per phase change, so assistive tech is never flooded by the per-frame readout. */
const PHASE_ANNOUNCEMENT: Record<ScanPhase, string> = {
  idle: "",
  advancing: "Scan started. Table advancing to isocenter.",
  scanning: "Scanning.",
  returning: "Scan complete. Table returning.",
};

/**
 * The interactive MRI bore. It explodes and turns with the page scroll, on hover or with the toggle;
 * pick a layer to isolate it, slide the table, or run a scan to watch the patient reach isocenter while
 * the RF coil pulses. Per-frame numbers are written straight to the DOM; React state only tracks
 * discrete UI changes. The canvas is transparent, so the stage has no box of its own.
 */
export function DomeScene({ className, onUnsupported }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inputs = useRef<Inputs>({
    exploded: false,
    hover: false,
    focus: -1,
    scroll: 0,
    table: 0,
    dragging: false,
    pointer: null,
    reduce: false,
  });
  const modelRef = useRef<DomeModel | null>(null);
  const kickRef = useRef<() => void>(() => {});

  const [exploded, setExploded] = useState(false);
  const [pinned, setPinned] = useState(-1);
  const [focus, setFocus] = useState(-1);
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [ready, setReady] = useState(false);

  const applyFocus = (i: number) => {
    inputs.current.focus = i;
    setFocus(i);
    kickRef.current();
  };

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      onUnsupported?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    const model = new DomeModel();
    modelRef.current = model;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    inputs.current.reduce = reduceMq.matches;
    const onReduce = () => {
      inputs.current.reduce = reduceMq.matches;
      kick();
    };
    reduceMq.addEventListener("change", onReduce);

    let raf = 0;
    let last = 0;
    let onScreen = true;
    let pageVisible = !document.hidden;
    let lastPhase: ScanPhase = "idle";
    let lastStatus = "";
    let lastSlider = -1;
    let firstFrame = true;
    const projected = DOME_PARTS.map(() => ({ x: 0, y: 0, visible: false }));

    const paintHud = () => {
      const s = model.state;
      if (s.scanPhase !== lastPhase) {
        lastPhase = s.scanPhase;
        setPhase(s.scanPhase);
      }
      const status =
        s.scanPhase === "scanning"
          ? `${PHASE_LABEL.scanning} · ${String(Math.round(s.scanProgress * 100)).padStart(3, "0")}%`
          : s.scanPhase === "idle"
            ? `${PHASE_LABEL.idle} · table ${s.table > 0.98 ? "at isocenter" : s.table < 0.02 ? "out" : `${Math.round(s.table * 100)}% in`}`
            : PHASE_LABEL[s.scanPhase];
      if (status !== lastStatus && statusRef.current) {
        lastStatus = status;
        statusRef.current.textContent = status;
      }
      const sliderValue = Math.round(s.table * 100);
      if (!inputs.current.dragging && sliderValue !== lastSlider && sliderRef.current) {
        lastSlider = sliderValue;
        sliderRef.current.value = String(sliderValue);
      }
      model.projectAnchors(projected);
      const show = s.explode;
      projected.forEach((p, i) => {
        const el = chipRefs.current[i];
        if (!el) return;
        const op = p.visible ? show : 0;
        el.style.opacity = op.toFixed(3);
        el.style.transform = `translate(-50%, -50%) translate(${(p.x * stage.clientWidth).toFixed(1)}px, ${(p.y * stage.clientHeight).toFixed(1)}px)`;
        const hidden = op < 0.25;
        if (el.inert !== hidden) el.inert = hidden;
        el.setAttribute("aria-hidden", hidden ? "true" : "false");
      });
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const inp = inputs.current;
      const explodeTarget = Math.max(inp.exploded ? 1 : 0, inp.hover ? 1 : 0, inp.focus >= 0 ? 1 : 0, inp.scroll);
      const moving = model.update(dt, {
        explodeTarget,
        tableTarget: inp.table,
        focus: inp.focus,
        pointer: inp.pointer,
        scroll: inp.scroll,
        reduceMotion: inp.reduce,
      });
      renderer.render(model.scene, model.camera);
      paintHud();
      if (firstFrame) {
        firstFrame = false;
        setReady(true);
      }
      if (moving && onScreen && pageVisible) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const kick = () => {
      if (!raf && onScreen && pageVisible) raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;

    /* ---------- size ---------- */
    const size = () => {
      const w = Math.max(1, stage.clientWidth);
      const h = Math.max(1, stage.clientHeight);
      renderer.setSize(w, h, false);
      model.resize(w, h);
      kick();
    };
    const ro = new ResizeObserver(size);
    ro.observe(stage);
    size();

    /* ---------- pointer parallax and hover-to-explode ---------- */
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = stage.getBoundingClientRect();
      inputs.current.pointer = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
      inputs.current.hover = true;
      kick();
    };
    const onPointerLeave = () => {
      inputs.current.pointer = null;
      inputs.current.hover = false;
      kick();
    };
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);

    /* ---------- scroll: progress of the stage's centre from three-quarters down the viewport to its top ---------- */
    const onScroll = () => {
      const r = stage.getBoundingClientRect();
      const centre = r.top + r.height / 2;
      const span = window.innerHeight * 0.75;
      inputs.current.scroll = clamp((span - centre) / span, 0, 1);
      kick();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    /* ---------- pause off-screen or in a background tab ---------- */
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) kick();
      },
      { threshold: 0 },
    );
    io.observe(stage);
    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) kick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onContextRestored = () => kick();
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    kick();

    return () => {
      kickRef.current = () => {};
      reduceMq.removeEventListener("change", onReduce);
      ro.disconnect();
      io.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      if (raf) cancelAnimationFrame(raf);
      // dispose() releases the GPU resources; the context itself goes with the canvas element. Forcing a
      // context loss here would break React's development double-mount, which reuses the same canvas.
      model.dispose();
      renderer.dispose();
      modelRef.current = null;
    };
  }, [onUnsupported]);

  const scanning = phase !== "idle";
  const activePart = focus >= 0 ? DOME_PARTS[focus] : null;

  const layerHandlers = (i: number) => ({
    onClick: () => {
      const next = pinned === i ? -1 : i;
      setPinned(next);
      applyFocus(next);
    },
    onMouseEnter: () => applyFocus(i),
    onMouseLeave: () => applyFocus(pinned),
    onFocus: () => applyFocus(i),
    onBlur: () => applyFocus(pinned),
  });

  return (
    <div className={cn("absolute inset-0 flex flex-col select-none", className)}>
      {/* Canvas stage: fills everything above the controls on phones, the whole box from sm up. */}
      <div ref={stageRef} className="relative min-h-0 flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-radial-[ellipse_55%_45%_at_50%_58%] from-pink/18 via-pink/5 to-transparent"
        />

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 block h-full w-full transition-opacity duration-700 ease-out-expo",
            ready ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Projected callout chips: one per layer, positioned each frame */}
        {DOME_PARTS.map((part, i) => (
          <button
            key={part.id}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            type="button"
            aria-hidden="true"
            aria-label={`${part.name}: ${part.short}`}
            aria-pressed={pinned === i}
            {...layerHandlers(i)}
            style={{ opacity: 0, transform: "translate(-50%, -50%)" }}
            className={cn(
              "absolute top-0 left-0 z-10 inline-flex size-7 items-center justify-center rounded-full border font-mono text-[0.6875rem] font-semibold transition-colors duration-150 before:absolute before:-inset-2 before:content-['']",
              pinned === i || focus === i
                ? "border-pink-strong bg-pink-strong text-white shadow-[0_0_18px_2px_rgb(255_0_127/0.6)]"
                : "border-pink/60 bg-ink/80 text-blush backdrop-blur",
            )}
          >
            {i + 1}
          </button>
        ))}

        {/* Readouts */}
        <div className="pointer-events-none absolute top-3 left-4 z-10 flex flex-col gap-1 sm:top-4 sm:left-5">
          <p className="eyebrow">Interactive · MRI bore anatomy</p>
          <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-fg/70 uppercase">
            B₀ 3.0 T · ƒ₀ {larmorMHz(3).toFixed(1)} MHz · Bore 70 cm
          </p>
          <p className="mt-1 flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.16em] text-fg/70 uppercase">
            <span className="relative inline-flex size-2">
              <span className={cn("absolute inset-0 rounded-full bg-pink/60", scanning && "animate-ping")} />
              <span className="relative inline-block size-2 rounded-full bg-pink" />
            </span>
            <span ref={statusRef}>Idle · table out</span>
          </p>
        </div>

        {/* Layer rail (sm+): numbered dots at the right edge; the active one reveals its name. */}
        <ol className="absolute top-3 right-4 z-10 hidden flex-col items-end gap-1.5 sm:flex lg:top-4 lg:right-5" aria-label="Bore layers">
          {DOME_PARTS.map((part, i) => {
            const active = focus === i;
            return (
              <li key={part.id} className="flex items-center justify-end gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "glass rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap text-fg transition-opacity duration-150",
                    active ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  {part.name}
                </span>
                <button
                  type="button"
                  aria-pressed={pinned === i}
                  aria-label={`${part.name}: ${part.short}`}
                  {...layerHandlers(i)}
                  className={cn(
                    "num relative inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-150 before:absolute before:-inset-1.5 before:content-['']",
                    active
                      ? "border-pink-strong bg-pink-strong text-white shadow-[0_0_14px_2px_rgb(255_0_127/0.55)]"
                      : "border-white/20 bg-ink/70 text-muted backdrop-blur hover:border-pink/60 hover:text-fg",
                  )}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Controls: below the canvas on phones so the callout chips never sit under them; overlaid from sm up. */}
      <div className="relative z-10 flex flex-col gap-3 px-4 pt-3 pb-1 sm:absolute sm:inset-x-5 sm:bottom-5 sm:p-0">
        <p className="min-h-5 max-w-xl text-sm leading-snug text-muted" aria-live="polite">
          {activePart ? (
            <>
              <span className="font-medium text-fg">{activePart.name}.</span> {activePart.detail}
            </>
          ) : (
            <span className="hidden sm:inline">Scroll or hover to pull the bore apart. Pick a layer to isolate it, or run a scan.</span>
          )}
        </p>
        <p className="sr-only" aria-live="polite">
          {PHASE_ANNOUNCEMENT[phase]}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            aria-pressed={exploded}
            disabled={scanning}
            onClick={() => {
              const next = !exploded;
              setExploded(next);
              inputs.current.exploded = next;
              kickRef.current();
            }}
            className={cn("glass", exploded && "border-pink/50 text-blush")}
          >
            <Layers className="size-4" strokeWidth={1.75} aria-hidden />
            Exploded view
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={scanning}
            onClick={() => {
              const model = modelRef.current;
              if (model && model.startScan()) {
                setPinned(-1);
                applyFocus(-1);
                kickRef.current();
              }
            }}
            className="glass"
          >
            {scanning ? (
              <Loader2 className="size-4 animate-spin text-blush" strokeWidth={1.75} aria-hidden />
            ) : (
              <Play className="size-4 text-blush" strokeWidth={1.75} aria-hidden />
            )}
            {scanning ? PHASE_LABEL[phase] : "Run scan"}
          </Button>
          <label className="glass flex min-h-11 min-w-[11rem] flex-1 items-center gap-3 rounded-xl px-3 sm:max-w-xs">
            <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted uppercase">Table</span>
            <input
              ref={sliderRef}
              type="range"
              min={0}
              max={100}
              step={1}
              defaultValue={0}
              disabled={scanning}
              aria-label="Table position, 0 is out, 100 is isocenter"
              onPointerDown={() => {
                inputs.current.dragging = true;
              }}
              onPointerUp={() => {
                inputs.current.dragging = false;
              }}
              onInput={(e) => {
                inputs.current.table = Number(e.currentTarget.value) / 100;
                kickRef.current();
              }}
              className="h-1 w-full cursor-pointer accent-pink disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
