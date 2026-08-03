"use client";

import { useEffect, useRef } from "react";
import { fieldNotes, fieldNoteSweep, homeRestAccent } from "@/lib/projects";

function setAccent(hex: string) {
  document.documentElement.style.setProperty("--accent", hex);
}

/** How long the page keeps a trace of the note you just left. Must outlast the
 *  2s release transition in globals.css, or the attribute is pulled mid-fade
 *  and the colour snaps the rest of the way. */
const RELEASE_MS = 2200;

/**
 * Field notes as a typographic register: big display names, a hanging mono
 * index, and a hover that indents the whole line — the cursor "tunes in".
 *
 * The list is also the one place the page shows a colour SWEEP rather than a
 * single borrowed accent: moving down the rows turns the hue continuously
 * (see fieldNoteSweep). Arrival is at the page's normal accent speed; the
 * release is slowed to 2s, so the colour lingers after the cursor leaves
 * instead of snapping back. Reduced motion drops both, per globals.css.
 */
export default function FieldNotes() {
  const releaseTimer = useRef<number | null>(null);

  const clearTimer = () => {
    if (releaseTimer.current !== null) {
      window.clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
    }
  };

  /** Tune in — normal speed, so pointing at a row answers immediately. */
  const hold = (hex: string) => {
    clearTimer();
    document.documentElement.removeAttribute("data-accent-release");
    setAccent(hex);
  };

  /** Let go — the attribute must land BEFORE the colour changes, or the
   *  transition is computed at the old duration and the fade stays short. */
  const release = () => {
    clearTimer();
    document.documentElement.setAttribute("data-accent-release", "");
    setAccent(homeRestAccent);
    releaseTimer.current = window.setTimeout(() => {
      document.documentElement.removeAttribute("data-accent-release");
      releaseTimer.current = null;
    }, RELEASE_MS);
  };

  // Navigating away mid-fade would otherwise leave the slow duration pinned on
  // <html> for the next page.
  useEffect(
    () => () => {
      clearTimer();
      document.documentElement.removeAttribute("data-accent-release");
    },
    [],
  );

  return (
    <div className="mt-10" onMouseLeave={release}>
      {fieldNotes.map((f, i) => {
        const stop = fieldNoteSweep[i % fieldNoteSweep.length];
        return (
          <a
            key={f.url}
            href={f.url}
            target="_blank"
            rel="noopener"
            // The row's stop on the sweep, published for the scroll-driven
            // borrow (FX.01/FX.05) to read.
            data-accent={stop}
            onMouseEnter={() => hold(stop)}
            onFocus={() => hold(stop)}
            onBlur={release}
            // duration-700 is the RESTING duration, so it governs the way out;
            // hover:duration-200 only applies while pointed at, which is the
            // way in. One utility pair, two speeds. It must be hover: and not
            // group-hover: — this element IS the group, and group-hover only
            // ever matches descendants.
            className="group relative block border-b py-6 pl-11 no-underline transition-[padding] duration-700 hover:pl-16 hover:duration-200 motion-reduce:transition-none md:py-7 md:hover:pl-20"
            style={{ borderColor: "var(--line)" }}
          >
            <span className="hud accent-t absolute left-0 top-7 text-muted-dim group-hover:text-accent md:top-8">
              F.{String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              {/* .accent-t carries the timing here — it is declared outside
                  @layer, so it beats any Tailwind duration utility. That is
                  what we want: the name then obeys the 1.2s release rule and
                  fades out with the rest of the page. */}
              <span className="accent-t font-display text-4xl font-medium leading-none tracking-tight text-muted group-hover:text-accent md:text-6xl lg:text-7xl">
                {f.name}
              </span>
              <span className="max-w-[36ch] text-sm leading-snug text-muted-dim transition-colors duration-700 group-hover:text-muted group-hover:duration-200 motion-reduce:transition-none">
                {f.note}
              </span>
              <span
                aria-hidden="true"
                // Deliberately NOT .accent-t: that rule is a `transition`
                // shorthand for colour only, and being unlayered it would
                // replace transition-all — killing the fade and the slide.
                className="ml-auto hidden -translate-x-1.5 text-3xl text-muted/40 opacity-0 transition-all duration-700 group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100 group-hover:duration-200 motion-reduce:transition-none md:block"
              >
                ↗
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
