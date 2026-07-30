"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { L, LangToggle } from "@/components/Lang";

export default function Chrome() {
  const timeRef = useRef<HTMLSpanElement>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const scrRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clock = () => {
      if (timeRef.current)
        timeRef.current.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
    };
    clock();
    const clockId = setInterval(clock, 1000);

    let frames = 0;
    let last = performance.now();
    let rafId = 0;
    const loop = (now: number) => {
      frames += 1;
      if (now - last >= 500) {
        if (fpsRef.current)
          fpsRef.current.textContent = String(Math.round((frames * 1000) / (now - last))).padStart(2, "0");
        frames = 0;
        last = now;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (scrRef.current)
          scrRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      clearInterval(clockId);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b px-[var(--gutter)] py-4 backdrop-blur-md"
        style={{
          borderColor: "var(--line)",
          background: "color-mix(in srgb, var(--bg) 72%, transparent)",
        }}
      >
        <Link
          href="/"
          className="hud hud-wide accent-t pointer-events-auto -my-3 inline-flex min-h-[44px] items-center text-ink no-underline hover:text-accent"
        >
          {site.wordmark}
        </Link>
        <p aria-hidden="true" className="hud accent-t hidden text-muted md:block">
          <span ref={timeRef}>--:--:--</span>
          <span className="mx-2 opacity-50">·</span>
          FPS <span ref={fpsRef}>--</span>
          <span className="mx-2 opacity-50">·</span>
          SCR <span ref={scrRef}>000%</span>
        </p>
        <div className="flex items-center gap-4">
          {/* Both channels, named. The page is for someone hiring AND for an
              agency looking for a pair of hands — a vaguer "open to work" would
              serve neither. Kept short enough not to wrap next to the toggle. */}
          <p className="hud accent-t hidden text-muted sm:block">
            STATUS —{" "}
            <span className="text-accent">
              <L en="OPEN TO ROLES & AGENCY WORK" de="OFFEN FÜR ROLLEN & AGENTURARBEIT" />
            </span>
          </p>
          <LangToggle />
        </div>
      </header>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-0.5"
        style={{ background: "var(--line)" }}
      >
        <div
          ref={barRef}
          className="accent-t h-full w-full origin-left"
          style={{ background: "var(--accent)", transform: "scaleX(0)" }}
        />
      </div>
    </>
  );
}
