"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFx } from "@/components/fx/FxProvider";

/**
 * The hero's instrument — the signature of the whole page. Three oscilloscope
 * traces; the middle one reads the live --accent each frame, so pointing at a
 * project tints the signal. It is playable: move the cursor across the hero and
 * the beam leaves its auto-sweep to lock under the pointer, a probe line drops,
 * and the readout reports POS / AMP off the wave — the page is an instrument you
 * read. Static single frame under reduced motion (no sweep, no probe), and the
 * loop parks itself while the hero is off-screen.
 */
export default function Scope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const dock = useFx("scope-dock");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    const readout = readoutRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let t = 0;
    let rafId = 0;
    let visible = true;
    let pointerX = 0;
    let probing = false;

    /* FX.02 — attenuation. 1 while the hero holds the screen, falling to 0 as it
       leaves. Every amplitude on the face is multiplied by it, so the signal
       does not fade out as a picture would: it collapses onto its own baseline,
       which is what an instrument losing a signal actually shows. The beam then
       reappears at the foot of the page, on the progress rule Chrome already
       draws — the scope is not removed, it is minimised. */
    let att = 1;

    // Rides the big display title, which tolerates the faint wave, so the
    // smaller body text stays clear. That used to be hard-coded as h * 0.5 —
    // true only on a wide screen. At 390px the title takes four lines and the
    // manifesto moves up into mid-hero, so the trace ran straight through the
    // body copy. The baseline is therefore MEASURED off the title, and clamped
    // so the wave (AMP + halo) cannot leave the hero.
    let base = 0;
    const BASE = () => base;

    const messeBase = () => {
      const title = document.querySelector<HTMLElement>('[data-hero="title"]');
      if (!title || h <= 0) {
        base = h * 0.5;
        return;
      }
      const cr = canvas.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      const mitte = tr.top - cr.top + tr.height / 2;
      const rand = 70;
      base = Math.max(rand, Math.min(h - rand, mitte));
    };

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      messeBase();
    };

    // One waveform sample — shared by the stroke and the beam so the phosphor
    // dot rides exactly on the accent trace, never beside it.
    const waveY = (x: number, y: number, amp: number, freq: number, phase: number) =>
      y + Math.sin(x * freq + phase) * amp * Math.sin(x * 0.0016 + t * 0.4);

    // The graticule — a scope face behind the signal. Faint vertical divisions,
    // a centre baseline, and minor tick marks along it. Static (no t), drawn
    // first so the traces and beam read on top of it.
    const graticule = (line: string) => {
      const y0 = BASE();
      const DIVS = 12;
      const div = w / DIVS;
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      for (let i = 1; i < DIVS; i += 1) {
        const x = Math.round(i * div) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(0, y0 - 54);
      ctx.lineTo(w, y0 - 54);
      ctx.moveTo(0, y0 + 54);
      ctx.lineTo(w, y0 + 54);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(y0) + 0.5);
      ctx.lineTo(w, Math.round(y0) + 0.5);
      ctx.stroke();
      const minor = div / 5;
      for (let x = 0; x <= w; x += minor) {
        const major = Math.abs(x / div - Math.round(x / div)) < 0.001;
        const len = major ? 6 : 3;
        const xx = Math.round(x) + 0.5;
        ctx.beginPath();
        ctx.moveTo(xx, y0 - len);
        ctx.lineTo(xx, y0 + len);
        ctx.stroke();
      }
    };

    const trace = (
      y: number,
      amp: number,
      freq: number,
      phase: number,
      color: string,
      width: number,
      alpha: number,
      glow = false,
    ) => {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const yy = waveY(x, y, amp, freq, phase);
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = alpha;
      if (glow) {
        ctx.shadowBlur = 14;
        ctx.shadowColor = color;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    // Accent trace params — kept in one place so the beam and probe read exactly
    // the same wave. Knobs to taste: SPEED (sweep px/s), CORE/HALO (beam glow px).
    const AMP = 52;
    const FREQ = 0.006;
    const SPEED = 58;
    const CORE = 2;
    const HALO = 10;

    const beam = (bx: number, accent: string, phase: number) => {
      const by = waveY(bx, BASE(), AMP * att, FREQ, phase);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(bx, by, HALO, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.98;
      ctx.beginPath();
      ctx.arc(bx, by, CORE, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const accent = getComputedStyle(root).getPropertyValue("--accent").trim() || "#f2f0eb";
      const line = getComputedStyle(root).getPropertyValue("--line").trim() || "rgba(242,240,235,0.14)";
      const accentPhase = t * 1.3 + 2;

      graticule(line);
      trace(BASE(), 26 * att, 0.01, t, line, 1.4, 0.5);
      trace(BASE(), AMP * att, FREQ, accentPhase, accent, 2.2, 0.85, true);
      trace(BASE(), 12 * att, 0.02, -t * 0.8, line, 1, 0.5);

      // Beam position: locked under the cursor while probing, otherwise sweeping.
      const sweepX = ((t * SPEED) % (w + 120)) - 60;
      const active = probing && !reduce;
      const bx = active ? Math.max(0, Math.min(w, pointerX)) : reduce ? w * 0.62 : sweepX;

      if (active) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.moveTo(Math.round(bx) + 0.5, 0);
        ctx.lineTo(Math.round(bx) + 0.5, h);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (bx >= 0 && bx <= w) beam(bx, accent, accentPhase);

      if (readout) {
        const pos = w > 0 ? Math.round((bx / w) * 100) : 0;
        const amp = Math.abs(Math.sin(bx * FREQ + accentPhase));
        readout.textContent = `SCOPE ▸ POS ${String(pos).padStart(2, "0")}% · AMP ${amp.toFixed(2)}${
          active ? " · PROBE" : ""
        }`;
      }

      t += 0.03;
      if (visible && !reduce) rafId = requestAnimationFrame(frame);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      probing = inside;
      if (inside) pointerX = e.clientX - rect.left;
    };

    size();
    window.addEventListener("resize", size);
    /* Die Titelhöhe hängt an der Display-Schrift. Vor deren Laden misst
       messeBase() den Fallback-Satz — danach noch einmal, sonst sitzt die
       Grundlinie dauerhaft ein paar Zeilen daneben (und im Reduced-Motion-Fall
       bliebe das Standbild so stehen). */
    document.fonts?.ready.then(() => {
      size();
      if (reduce) frame();
    });
    if (!reduce) window.addEventListener("mousemove", onMove, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduce) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);

    let dockTween: gsap.core.Tween | null = null;
    if (dock && !reduce) {
      gsap.registerPlugin(ScrollTrigger);
      {
        /* The window matters more than the effect. The first version ran the
           collapse from the hero's "top top" to its "bottom top" — the whole
           length of the hero leaving the screen — and was invisible: measured,
           the trace was already at viewport y ≈ −16 by the time attenuation
           reached 0.25, so the signal did all its dying above the fold.
           Something can only be watched failing while it is on screen.

           The trace rides the title's centre, which starts at y ≈ 410 and
           leaves the top of the screen at about the same number of pixels of
           scroll. So the whole collapse has to fit inside that: pinned to the
           scroll itself rather than to the hero, and done inside the first 38 %
           of a screen. Measured across the run, the trace never leaves the
           viewport before the wave is flat. */
        root.style.setProperty("--scope-att", "1");

        /* Driven through a tween rather than read off the trigger. scrub smooths
           the progress of an animation it is linked to — ScrollTrigger.create()
           links none, so the old version handed onUpdate the raw scrollbar
           position and the needle fell exactly as abruptly as the wheel turned.
           Giving scrub something to smooth is what puts any weight in the fall,
           and it is also where the curve can now live. */
        const drive = { att: 1 };
        dockTween = gsap.to(drive, {
          att: 0,
          /* Not linear. An instrument losing its source holds amplitude while
             there is still something to read, then gives out: power2.in barely
             moves through the first half of the run (att .94 at a quarter, .75
             at half) and spends the collapse in the second — which is the half
             still on screen. Linear did most of its dying on a trace that had
             already left the fold, which is how the effect came to look like
             nothing was happening. */
          ease: "power2.in",
          scrollTrigger: {
            start: 0,
            end: () => window.innerHeight * 0.38,
            scrub: 0.6,
          },
          onUpdate: () => {
            att = drive.att;
            /* Opacity deliberately lags the amplitude. Fading in step with att
               hid the collapse behind a dissolve — the point is to watch the
               wave flatten, not to watch it disappear. At a fractional power the
               face stays legible until the wave is nearly flat, then goes. */
            canvas.style.opacity = String(0.7 * Math.pow(att, 0.4));
            // Published so the foot of the page can fade the beam IN by exactly
            // as much as the hero has faded it out — that hand-over is the whole
            // point, and without it the dot is just another dot.
            root.style.setProperty("--scope-att", String(att));
          },
        });
      }
    }

    if (reduce) frame();

    return () => {
      window.removeEventListener("resize", size);
      window.removeEventListener("mousemove", onMove);
      io.disconnect();
      cancelAnimationFrame(rafId);
      dockTween?.scrollTrigger?.kill();
      dockTween?.kill();
      // Handing the face back at full strength — the next mount reads the
      // element's own class again instead of a value this run happened to stop on.
      canvas.style.opacity = "";
      root.style.removeProperty("--scope-att");
    };
  }, [dock]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-full w-screen -translate-x-1/2 opacity-70"
      />
      {/* The readout follows a pointer probe, so it has nothing to say on touch
          — and at 375px it lands on top of the coordinates. Desktop only. */}
      <div
        ref={readoutRef}
        aria-hidden="true"
        className="hud accent-t pointer-events-none absolute right-0 top-2 hidden text-accent md:block"
      />
    </>
  );
}
