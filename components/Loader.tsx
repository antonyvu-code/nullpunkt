"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

const DURATION = 1500;

/**
 * Boot sequence — a crosshair finds its zero point, the counter calibrates
 * 000 → 100. Skipped entirely for reduced motion; page scroll is locked
 * while it runs so the reveal starts from the top.
 */
export default function Loader() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    document.body.style.overflow = "hidden";
    let rafId = 0;
    const t0 = performance.now();
    const run = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const e = 1 - Math.pow(1 - p, 3);
      if (countRef.current) countRef.current.textContent = String(Math.round(e * 100)).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${e})`;
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
      <div className="relative h-16 w-16">
        <i className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2" style={{ background: "var(--line)" }} />
        <i className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2" style={{ background: "var(--line)" }} />
        <i className="np-zero absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-flare" />
      </div>
      <p className="text-2xl font-medium tracking-tight">{site.name}</p>
      <div className="relative h-px w-44 overflow-hidden" style={{ background: "var(--line)" }}>
        <div ref={barRef} className="absolute inset-0 origin-left bg-flare" style={{ transform: "scaleX(0)" }} />
      </div>
      <p className="hud text-muted">
        CALIBRATING FROM ZERO — <span ref={countRef} className="text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>000</span>%
      </p>
    </div>
  );
}
