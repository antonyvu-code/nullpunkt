"use client";

import { useEffect, useRef } from "react";
import { fieldNotes, fieldNoteSweep, homeRestAccent } from "@/lib/projects";
import { useFx } from "@/components/fx/FxProvider";
import { Walze } from "@/components/Walze";

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
 * instead of snapping back — and for the length of that trace the scroll-driven
 * sweep stays stood down, which is what stops the slow duration from being
 * applied to a colour something else is writing every frame. Any scroll ends the
 * trace and hands the dial back. Reduced motion drops both, per globals.css.
 */
export default function FieldNotes() {
  const releaseTimer = useRef<number | null>(null);
  /* Removes the scroll listener that ends a trace early. Held as a closure
     rather than the listener itself so hold(), handBack() and unmount all take
     the same one line to undo it. */
  const stopWatch = useRef<(() => void) | null>(null);
  /* Whether anything is READING the page while the pointer is off the list.
     Not used to decide what a hover does — a hover always does the same thing —
     but to decide what LETTING GO means, which is a different question with a
     different answer depending on whether the dial has another owner. */
  const gemessen = useFx("accent-scroll") || useFx("notes-sweep");

  const clearTimer = () => {
    if (releaseTimer.current !== null) {
      window.clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
    }
  };

  const clearWatch = () => {
    if (stopWatch.current !== null) {
      stopWatch.current();
      stopWatch.current = null;
    }
  };

  /** Tune in — normal speed, so pointing at a row answers immediately.
   *
   *  data-zeiger FIRST, then the colour. The attribute is what tells
   *  AccentScroll to stand down (see the guard at the top of its apply()), and
   *  writing the colour before raising it leaves a window — one scroll frame
   *  wide, which is all it took — in which the sweep writes over the value this
   *  line just set. That window IS the bug this pair fixes; opening it again
   *  here would be fixing it in one direction only. */
  const hold = (hex: string) => {
    clearTimer();
    clearWatch();
    document.documentElement.removeAttribute("data-accent-release");
    document.documentElement.setAttribute("data-zeiger", "");
    setAccent(hex);
  };

  /** Hand the dial back to whatever else is reading the page, leaving nothing
   *  pinned on <html>. Both attributes come down together: a stray
   *  data-accent-release outlives the fade and slows the next colour change, a
   *  stray data-zeiger leaves the sweep politely standing down forever. */
  const handBack = () => {
    clearTimer();
    clearWatch();
    document.documentElement.removeAttribute("data-accent-release");
    document.documentElement.removeAttribute("data-zeiger");
  };

  /** Let go — the page keeps a trace of the note you just left.
   *
   *  WHO GETS THE DIAL BACK decides what happens here, and until 14.08.2026 the
   *  answer with FX.01 or FX.05 running was "immediately, so skip the trace
   *  entirely". That was measured and it meant the 2s release **never ran on the
   *  shipping page at all**: every effect defaults on, the panel that could turn
   *  them off is dev-only, so the guard returned every single time. README
   *  described a gesture the site did not have. See OFFEN.md §7.
   *
   *  The reason behind that guard was real and is kept: the sweep writes
   *  --accent on every scroll frame, so a 2s transition while it is writing does
   *  not read as a lingering trace, it reads as a colour that has gone sluggish.
   *  What was wrong was the conclusion. The fix is not to drop the trace but to
   *  keep the sweep STOOD DOWN for the length of it — data-zeiger stays up
   *  through the fade, so nothing is writing --accent for those 2s and there is
   *  nothing to go sluggish. Then both attributes come down together and the
   *  sweep resumes at its normal 450ms.
   *
   *  THE PRICE, stated because it is the honest half: for those 2s the accent no
   *  longer tracks the scroll. So any scroll ends the trace at once and hands the
   *  dial straight back — a reader who has moved on gets the measurement, and the
   *  trace is reserved for the gesture it was designed for, taking the pointer
   *  off the list. It plays less often than it would have; it is never wrong.
   *
   *  The attribute must land BEFORE the colour changes, or the transition is
   *  computed at the old duration and the fade stays short. */
  const release = () => {
    clearTimer();
    clearWatch();
    const root = document.documentElement;

    if (!gemessen) {
      /* Nothing is reading the page — the dial has no other owner, so the
         sweep can be released immediately and the fade is the whole story. */
      root.removeAttribute("data-zeiger");
      root.setAttribute("data-accent-release", "");
      setAccent(homeRestAccent);
      releaseTimer.current = window.setTimeout(handBack, RELEASE_MS);
      return;
    }

    root.setAttribute("data-accent-release", "");
    setAccent(homeRestAccent);
    /* `once` is not enough on its own — the listener has to be removable, or a
       trace ended by hold() or by unmount leaves it armed for a scroll that
       arrives after this component stopped caring. */
    const onScroll = () => handBack();
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    stopWatch.current = () => window.removeEventListener("scroll", onScroll);
    releaseTimer.current = window.setTimeout(handBack, RELEASE_MS);
  };

  // Navigating away mid-fade would otherwise leave the slow duration pinned on
  // <html> for the next page — and leaving data-zeiger up would leave the next
  // page's accent frozen wherever this one left it, with the measurement
  // politely standing down for a pointer that is no longer anywhere.
  useEffect(
    () => () => {
      clearTimer();
      clearWatch();
      document.documentElement.removeAttribute("data-accent-release");
      document.documentElement.removeAttribute("data-zeiger");
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
            // The indent used to be animated padding. It looked right and was
            // wrong: padding is a layout property, so every frame of every
            // hover re-laid out the row and everything below it — twelve rows
            // of display type at 4xl–7xl, on the one section that exists to be
            // swept through quickly. The floor's P1 allows a layout property
            // only with a reason, and "it was the obvious utility" is not one.
            // The indent is now a transform on the content (below), which the
            // compositor can do without touching layout at all.
            className="group relative block border-b py-6 pl-11 no-underline md:py-7"
            style={{ borderColor: "var(--line)" }}
          >
            <span className="hud accent-t absolute left-0 top-7 text-muted-dim group-hover:text-accent md:top-8">
              F.{String(i + 1).padStart(2, "0")}
            </span>
            {/* The indent, as a transform. Same distance the padding used to
                travel — pl-11→pl-16 is 20px, and md pl-11→pl-20 is 36px — so
                the row reads exactly as before and costs no layout. The two
                speeds survive the move: duration-700 is the resting value and
                governs the way out, group-hover:duration-200 the way in.
                pr-12 keeps a long note clear of the arrow, which no longer
                shares this box and so no longer gets pushed by the indent. */}
            <span className="flex flex-wrap items-baseline gap-x-5 gap-y-2 pr-12 transition-transform duration-700 ease-out group-hover:translate-x-5 group-hover:duration-200 motion-reduce:transition-none md:group-hover:translate-x-9">
              {/* .accent-t carries the timing here — it is declared outside
                  @layer, so it beats any Tailwind duration utility. That is
                  what we want: the name then obeys the 2s release rule and
                  fades out with the rest of the page. */}
              {/* THE ROLLER AT 7xl, and Antony chose it WITH the indent still
                  running — 18.08.2026, after looking at both. Worth writing
                  down that this row therefore carries two horizontal motions
                  on one gesture: the box travels 20/36px at 200ms in, and the
                  letters turn over across 200ms of spread and 380ms of travel.
                  They point the same way, which is why it reads as one thing
                  accelerating rather than two things arguing — but if this row
                  ever feels busy, the indent is the half to drop, not the
                  roller: the roller is the page's hover language, the indent is
                  only this section's. Cost, measured: 8 notes, 70 characters,
                  +210 elements on `/` and again on `/work`. */}
              <span className="accent-t font-display text-4xl font-medium leading-none tracking-tight text-muted group-hover:text-accent md:text-6xl lg:text-7xl">
                <Walze en={f.name} de={f.name} />
              </span>
              <span className="max-w-[36ch] text-sm leading-snug text-muted-dim transition-colors duration-700 group-hover:text-muted group-hover:duration-200 motion-reduce:transition-none">
                {f.note}
              </span>
            </span>

            {/* Anchored to the row, not carried by the content. Inside the
                indenting box it would have ridden the transform 36px to the
                right and left the row's own edge behind — the arrow marks where
                the row ENDS, and a mark that moves is not marking anything.
                Absolute here also puts it out of the flex flow, so a note that
                wraps to two lines can no longer push it down a line with it.

                Deliberately NOT .accent-t: that rule is a `transition`
                shorthand, and being unlayered it would replace this one and
                kill both the fade and the slide. The properties are now named
                rather than `transition-all`, which was animating every
                animatable property this element has — including the layout ones
                it must not touch. */}
            <span
              aria-hidden="true"
              className="absolute right-0 top-6 hidden -translate-x-1.5 text-3xl text-muted/40 opacity-0 transition-[transform,opacity,color] duration-700 ease-out group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100 group-hover:duration-200 motion-reduce:transition-none md:top-7 md:block"
            >
              ↗
            </span>
          </a>
        );
      })}
    </div>
  );
}
