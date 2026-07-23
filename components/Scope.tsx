"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's instrument bed — three slow oscilloscope traces. Monochrome at
 * rest; the middle trace reads the live --accent each frame, so pointing at
 * a project tints the signal. Static single trace under reduced motion,
 * and the loop parks itself while the hero is off-screen.
 */
export default function Scope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let t = 0;
    let rafId = 0;
    let visible = true;

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // One waveform sample — shared by the stroke and the beam so the phosphor
    // dot rides exactly on the accent trace, never beside it.
    const waveY = (x: number, y: number, amp: number, freq: number, phase: number) =>
      y + Math.sin(x * freq + phase) * amp * Math.sin(x * 0.0016 + t * 0.4);

    // The graticule — a scope face behind the signal. Faint vertical divisions,
    // a centre baseline, and minor tick marks along it. Static (no t), drawn
    // first so the traces and beam read on top of it.
    const graticule = (line: string) => {
      const y0 = h * 0.72;
      const DIVS = 12;
      const div = w / DIVS;
      // Full-height division lines, dialled well under the line token.
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
      // Envelope guides framing the accent signal's swing.
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(0, y0 - 40);
      ctx.lineTo(w, y0 - 40);
      ctx.moveTo(0, y0 + 40);
      ctx.lineTo(w, y0 + 40);
      ctx.stroke();
      // Centre baseline — the zero line the traces oscillate around.
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(y0) + 0.5);
      ctx.lineTo(w, Math.round(y0) + 0.5);
      ctx.stroke();
      // Tick marks along the baseline: tall at each division, short in between.
      const minor = div / 5;
      for (let x = 0; x <= w; x += minor) {
        const major = Math.abs((x / div) - Math.round(x / div)) < 0.001;
        const len = major ? 6 : 3;
        const xx = Math.round(x) + 0.5;
        ctx.beginPath();
        ctx.moveTo(xx, y0 - len);
        ctx.lineTo(xx, y0 + len);
        ctx.stroke();
      }
    };

    const trace = (y: number, amp: number, freq: number, phase: number, color: string, width: number) => {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const yy = waveY(x, y, amp, freq, phase);
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    // The beam — a phosphor dot sweeping along the accent trace. Additive blend
    // so it glows on the near-black ground. Knobs to taste: SPEED (px/s feel),
    // CORE (bright centre px), HALO (soft glow px).
    const SPEED = 58;
    const CORE = 1.7;
    const HALO = 8;
    const beam = (accent: string, phase: number) => {
      const bx = reduce ? w * 0.62 : ((t * SPEED) % (w + 120)) - 60;
      if (bx < 0 || bx > w) return;
      const by = waveY(bx, h * 0.72, 40, 0.006, phase);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.arc(bx, by, HALO, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.95;
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
      trace(h * 0.72, 26, 0.01, t, line, 1.4);
      trace(h * 0.72, 40, 0.006, accentPhase, accent, 1.1);
      trace(h * 0.72, 12, 0.02, -t * 0.8, line, 1);
      beam(accent, accentPhase);
      t += 0.03;
      if (visible && !reduce) rafId = requestAnimationFrame(frame);
    };

    size();
    window.addEventListener("resize", size);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduce) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);

    if (reduce) {
      // One still reading instead of a running signal.
      frame();
    }

    return () => {
      window.removeEventListener("resize", size);
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-0 h-full w-screen -translate-x-1/2 opacity-55"
    />
  );
}
