"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

const DURATION = 900;

/* ——— HOW BIG THE MARK IS, AND IT IS ONE NUMBER ————————————————————————
   132px until 18.08.2026, when Antony asked for it larger. Everything the mark
   is made of is an absolute pixel figure — the lattice pitch, the ring, the
   arms, the dot radius, the misregistration — so "bigger" had to become one
   factor rather than five hand-raised numbers that drift apart the next time.

   IT SCALES THE WHOLE DRAWING, NOT JUST ITS OUTLINE. Growing only the ring and
   the arms while the pitch stayed at 5.5 would hand back a denser mark at a
   larger size: more dots, finer lattice, a different drawing. A registration
   mark enlarged on a press is the same mark, so the pitch and the dots grow
   with it.

   264 IS THE CEILING AND IT IS A PHONE THAT SETS IT. The loader is a column —
   mark, wordmark, counter — and at 390×844 a 264 mark leaves the column about
   380px tall in a 844px window, which still reads as centred rather than as
   filling the screen. Past that the mark starts behaving like a splash screen,
   which is the one thing an instrument booting must not look like. */
const KANTE = 220;
const K = KANTE / 132;

/** The hero's three plates, and the same three directions they slip in.
 *  Additive: apart they are three coloured marks, coincident they sum to ink.
 *  Copied as VALUES rather than imported from Passer.tsx on purpose — this
 *  component paints before anything else on the page and must not pull the
 *  hero's module in to do it. If the plates ever change there, they change
 *  here, and the comment in Passer.tsx says so. */
const PLATTEN = [
  { col: [0, 120, 118], dir: 0 },
  { col: [121, 0, 117], dir: (Math.PI * 2) / 3 },
  { col: [121, 120, 0], dir: (Math.PI * 4) / 3 },
] as const;

/**
 * Boot sequence — THE PRESS FINDING ITS REGISTER.
 *
 * It used to be a crosshair, a hairline bar and a counter: a generic instrument
 * booting, and the one screen a reader sees before the hero was arguing
 * something the hero does not. Rewritten 17.08.2026 to be the same event, in
 * the same material, as the page it opens: three plates come in out of register
 * and converge, and at zero they coincide. That is what the site is called.
 *
 * The colours are the hero's own — [0,120,118], [121,0,117], [121,120,0],
 * composited with `lighter`, which is why they sum to near-ink where all three
 * overlap and stay coloured everywhere they do not. The convergence IS the
 * progress bar, so the bar is gone; the counter stays, because a number is what
 * an instrument reports.
 *
 * The mark is drawn as DOTS, not as strokes. Passer's note argues that its
 * grain is particles because "a dot drawn at its cell is a spreadsheet" — here
 * the dots are on a cell, deliberately, because this is the plate BEFORE the
 * impression: a printer's registration mark is ruled, not organic. The
 * material rhymes; the meaning is one step earlier.
 *
 * Canvas 2D and about a hundred circles a frame. This runs before the fonts
 * resolve and before anything else is parsed, so it may not cost anything: no
 * library, no image, no webfont — the wordmark below is the only text and it is
 * allowed to arrive in the fallback face, since it is gone in 900ms.
 *
 * Skipped entirely for reduced motion, as before. Page scroll stays locked
 * while it runs so the reveal starts from the top.
 */
export default function Loader() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    document.body.style.overflow = "hidden";

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") ?? null;
    /* Sized here rather than in a ResizeObserver: this box is KANTE px for the
       900ms it exists and nothing can resize it in that time. */
    const CSS = KANTE;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas) {
      canvas.width = Math.round(CSS * dpr);
      canvas.height = Math.round(CSS * dpr);
    }

    /* THE MARK, in cell coordinates. A registration mark is a ring and a cross;
       both are walked at a fixed pitch so every dot sits on the same lattice —
       which is what makes three of them look like three PLATES rather than
       three drawings. */
    const PITCH = 5.5 * K;
    const R = 26 * K;
    const ARM = 40 * K;
    const punkte: [number, number][] = [];
    for (let a = 0; a < Math.PI * 2; a += PITCH / R) punkte.push([Math.cos(a) * R, Math.sin(a) * R]);
    for (let d = -ARM; d <= ARM; d += PITCH) {
      if (Math.abs(d) < R - PITCH) continue; // the ring already owns the centre
      punkte.push([d, 0]);
      punkte.push([0, d]);
    }

    let rafId = 0;
    const t0 = performance.now();

    const run = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const e = 1 - Math.pow(1 - p, 3);
      if (countRef.current) countRef.current.textContent = String(Math.round(e * 100)).padStart(3, "0");

      if (ctx && canvas) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, CSS, CSS);
        ctx.globalCompositeOperation = "lighter";
        /* Out of register by 18px at the start, nothing at the end. Eighteen is
           a slip a printer would call a misregistration; more than that and the
           three marks read as three objects instead of one impression that has
           not landed yet. */
        const aus = (1 - e) * 18 * K;
        for (const { col, dir } of PLATTEN) {
          const ox = CSS / 2 + Math.cos(dir) * aus;
          const oy = CSS / 2 + Math.sin(dir) * aus;
          ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
          for (const [x, y] of punkte) {
            ctx.beginPath();
            ctx.arc(ox + x, oy + y, 1.6 * K, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalCompositeOperation = "source-over";
      }

      if (p < 1) {
        rafId = requestAnimationFrame(run);
      } else {
        document.body.style.overflow = "";
        setLeaving(true);
        window.setTimeout(() => setGone(true), 650);
      }
    };
    rafId = requestAnimationFrame(run);
    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 bg-bg transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Inline, not a Tailwind h-[132px]: the size is now one constant and a
          utility class cannot read it, so the two would have to be kept in step
          by hand — which is what KANTE exists to stop. */}
      <canvas ref={canvasRef} style={{ width: KANTE, height: KANTE }} />
      <p className="text-2xl font-medium tracking-tight">{site.name}</p>
      <p className="hud text-muted">
        CALIBRATING FROM ZERO —{" "}
        <span ref={countRef} className="text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
          000
        </span>
        %
      </p>
    </div>
  );
}
