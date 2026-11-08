import { useId } from "react";
import { GlowFilter, subjectClass, subjectFilter, type DiagramProps } from "./shared";
import { cn } from "@/lib/cn";

/**
 * The arterial tree from the aortic arch to the common femoral arteries, anterior view (the patient's
 * right on the viewer's left). Vessels are smooth stroked paths whose width falls with calibre: aorta,
 * iliacs, visceral branches, then the small branches. A dotted pink catheter runs retrograde from the
 * right common femoral artery to the celiac trunk, the standard course for a visceral angiogram.
 */

/** x → 880 - x: mirrors a right-sided structure about the abdominal aorta (x = 440). */
const MIRROR_AORTA = "matrix(-1 0 0 1 880 0)";

const CATHETER =
  "M 350 590 C 348 566, 348 546, 350 528 C 358 504, 372 480, 386 458 C 400 440, 418 422, 432 404 " +
  "C 438 360, 440 310, 442 262 C 434 258, 426 256, 418 256";

export function VascularTree({ active = null, className }: DiagramProps) {
  const uid = useId();
  const glowId = `${uid}-glow`;
  const titleId = `${uid}-title`;
  const subject = (id: string) => ({ className: subjectClass(id, active), filter: subjectFilter(id, active, glowId) });

  return (
    <svg
      viewBox="0 0 800 600"
      role="img"
      aria-label="Arterial tree from the aortic arch to the common femoral arteries with a catheter path to the celiac trunk"
      aria-labelledby={titleId}
      className={cn("text-silver", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title id={titleId}>
        Arterial tree from the aortic arch to the common femoral arteries with a catheter path to the celiac trunk
      </title>
      <defs>
        <GlowFilter id={glowId} />
      </defs>

      {/* Orientation */}
      <g className="font-mono" fill="currentColor" stroke="none" fontSize="14" opacity="0.7">
        <text x="40" y="306" textAnchor="middle">
          R
        </text>
        <text x="760" y="306" textAnchor="middle">
          L
        </text>
      </g>

      {/* Context: heart silhouette, diaphragm, kidneys, femoral heads, inguinal ligaments */}
      <g strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4">
        <path d="M 352 186 C 306 176, 266 214, 270 266 C 276 316, 332 342, 370 322 C 396 306, 392 254, 374 218 C 368 204, 360 192, 352 186 Z" />
        <path d="M 236 262 C 300 236, 380 236, 440 252 C 500 236, 580 240, 636 266" />
        <circle cx="330" cy="548" r="30" />
        <circle cx="534" cy="548" r="30" />
        <path d="M 282 496 L 398 552" />
        <path d="M 582 496 L 466 552" />
      </g>
      <g strokeWidth="1.5" opacity="0.65">
        <path d="M 318 280 C 292 278, 282 306, 286 334 C 290 356, 312 368, 330 356 C 340 348, 336 336, 338 326 C 340 316, 348 314, 346 304 C 344 292, 334 282, 318 280 Z" />
        <path
          d="M 318 280 C 292 278, 282 306, 286 334 C 290 356, 312 368, 330 356 C 340 348, 336 336, 338 326 C 340 316, 348 314, 346 304 C 344 292, 334 282, 318 280 Z"
          transform={MIRROR_AORTA}
        />
      </g>

      {/* Aorta: ascending, arch, descending, abdominal to the bifurcation */}
      <path
        d="M 346 182 C 344 128, 362 84, 404 80 C 442 76, 452 108, 450 140 C 448 190, 444 230, 442 262 C 440 310, 438 360, 432 404"
        strokeWidth="14"
      />

      {/* Arch branches in silver: the right common carotid, left common carotid and left subclavian */}
      <g strokeWidth="5">
        <path d="M 356 52 C 354 40, 352 26, 350 12" />
        <path d="M 404 80 C 405 58, 406 36, 406 12" />
        <path d="M 430 84 C 448 60, 476 44, 516 40 C 548 38, 576 48, 600 68 C 616 90, 630 130, 640 180" />
      </g>
      <path d="M 378 86 C 372 74, 364 62, 356 52" strokeWidth="7" />

      {/* Celiac branches: left gastric, splenic, gastroduodenal */}
      <g strokeWidth="4">
        <path d="M 418 256 C 416 244, 418 232, 424 222" strokeWidth="3" />
        <path d="M 418 256 C 436 244, 468 242, 498 250 C 522 256, 544 256, 566 248" />
        <path d="M 348 244 C 348 258, 350 270, 354 284" strokeWidth="3" />
      </g>

      {/* SMA branches: jejunal, ileal, ileocolic */}
      <g strokeWidth="2.5">
        <path d="M 414 318 C 428 326, 440 338, 450 354" />
        <path d="M 404 348 C 418 356, 430 368, 438 384" />
        <path d="M 396 374 C 384 382, 374 394, 368 406" />
        <path d="M 388 396 C 400 402, 410 412, 416 426" />
      </g>

      {/* Accessory lower-pole renal artery (common variant) */}
      <path d="M 436 356 C 414 354, 384 350, 350 346" strokeWidth="2.5" strokeDasharray="5 5" opacity="0.7" />

      {/* IMA branches: left colic and sigmoid */}
      <g strokeWidth="2.5">
        <path d="M 468 394 C 486 390, 504 386, 522 382" />
        <path d="M 492 430 C 506 436, 518 446, 526 460" />
      </g>

      {/* External iliac arteries */}
      <g strokeWidth="8">
        <path d="M 386 458 C 372 480, 358 504, 350 528" />
        <path d="M 478 458 C 492 480, 506 504, 514 528" />
      </g>

      {/* Internal iliac branches: gluteal and obturator */}
      <g strokeWidth="2.5">
        <path d="M 404 514 C 412 520, 420 530, 424 544" />
        <path d="M 398 486 C 386 492, 378 502, 372 514" />
        <path d="M 460 514 C 452 520, 444 530, 440 544" />
        <path d="M 466 486 C 478 492, 486 502, 492 514" />
      </g>

      {/* Left common femoral artery with its bifurcation */}
      <g>
        <path d="M 514 528 C 516 548, 516 566, 514 582" strokeWidth="8" />
        <path d="M 514 582 C 512 590, 510 596, 508 604" strokeWidth="6" />
        <path d="M 514 582 C 522 588, 528 596, 532 606" strokeWidth="5" />
      </g>

      {/* ── Hotspot subjects ────────────────────────────────────────────── */}

      {/* Aortic arch and the origins of its three branches */}
      <g {...subject("arch")}>
        <path d="M 362 112 C 370 92, 384 80, 404 80 C 426 78, 440 88, 447 108" strokeWidth="14" opacity="0.55" />
        <path d="M 378 86 C 372 74, 364 62, 356 52" strokeWidth="7" />
        <path d="M 404 80 C 405 68, 406 56, 406 44" strokeWidth="5" />
        <path d="M 430 84 C 444 64, 464 50, 490 44" strokeWidth="5" />
      </g>

      {/* Right subclavian, axillary and brachial: the pathway back from a radial access */}
      <g {...subject("radial-route")}>
        <path d="M 356 52 C 326 42, 290 40, 258 46 C 226 52, 206 68, 196 86 C 182 112, 168 150, 160 196" strokeWidth="5" />
        <path d="M 160 196 C 156 212, 152 226, 150 242" strokeWidth="3" strokeDasharray="1 6" />
      </g>

      {/* Celiac trunk */}
      <g {...subject("celiac")}>
        <path d="M 442 262 C 434 258, 426 256, 418 256" strokeWidth="6" />
        <path d="M 418 256 C 416 244, 418 232, 424 222" strokeWidth="3" />
      </g>

      {/* Common hepatic, proper hepatic and the right and left hepatic arteries */}
      <g {...subject("hepatic")}>
        <path d="M 418 256 C 396 254, 370 250, 348 244 C 332 240, 320 232, 308 222" strokeWidth="4" />
        <path d="M 308 222 C 298 212, 290 202, 284 192" strokeWidth="3" />
        <path d="M 308 222 C 306 214, 310 206, 318 200" strokeWidth="3" />
      </g>

      {/* Superior mesenteric artery */}
      <g {...subject("sma")}>
        <path d="M 441 290 C 428 296, 416 310, 410 328 C 402 352, 394 378, 384 404" strokeWidth="5" />
      </g>

      {/* Renal arteries */}
      <g {...subject("renal")}>
        <path d="M 441 318 C 420 320, 396 324, 372 324 C 360 324, 350 324, 340 324" strokeWidth="5" />
        <path d="M 441 312 C 466 312, 494 314, 516 316 C 526 316, 534 318, 540 322" strokeWidth="5" />
      </g>

      {/* Inferior mesenteric artery */}
      <g {...subject("ima")}>
        <path d="M 436 372 C 448 380, 466 392, 480 408 C 492 424, 498 444, 496 470" strokeWidth="4" />
      </g>

      {/* Aortic bifurcation and the common iliac arteries */}
      <g {...subject("bifurcation")}>
        <path d="M 432 404 C 418 422, 400 440, 386 458" strokeWidth="9" />
        <path d="M 432 404 C 446 422, 464 440, 478 458" strokeWidth="9" />
      </g>

      {/* Internal iliac arteries */}
      <g {...subject("internal-iliac")}>
        <path d="M 386 458 C 392 476, 400 494, 404 514 C 406 526, 404 536, 400 546" strokeWidth="5" />
        <path d="M 478 458 C 472 476, 464 494, 460 514 C 458 526, 460 536, 464 546" strokeWidth="5" />
      </g>

      {/* Right common femoral artery, the access site, with its bifurcation */}
      <g {...subject("cfa")}>
        <path d="M 350 528 C 348 548, 348 566, 350 582" strokeWidth="8" />
        <path d="M 350 582 C 352 590, 354 596, 356 604" strokeWidth="6" />
        <path d="M 350 582 C 342 588, 336 596, 332 606" strokeWidth="5" />
      </g>

      {/* Catheter course: retrograde from the right CFA to the celiac trunk */}
      <g className="text-pink" opacity="0.9">
        <path d={CATHETER} strokeWidth="2.5" strokeDasharray="1 6" />
        <circle cx="418" cy="256" r="4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
