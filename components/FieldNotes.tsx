"use client";

import { useEffect, useRef } from "react";
import { fieldNotes, fieldNoteSweep, homeRestAccent } from "@/lib/projects";
import { useFx } from "@/components/fx/FxProvider";

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
    document.documentElement.removeAttribute("data-accent-release");
    document.documentElement.setAttribute("data-zeiger", "");
    setAccent(hex);
  };

  /** Let go.
   *
   *  WHO GETS THE DIAL BACK decides what happens here, and there are two
   *  answers. With FX.01 or FX.05 running, the page has its own reading of this
   *  spot and the honest thing is to hand it straight back: drop the attribute
   *  and AccentScroll's observer restores the measured colour in the same
   *  frame, at normal accent speed. Setting the 2s release as well would have
   *  been actively wrong — the sweep writes on every scroll frame, so a 2s
   *  transition on --accent makes the whole sweep crawl for as long as the
   *  attribute is up, and the effect the reader sees is not a lingering trace
   *  but a colour that has gone sluggish.
   *
   *  With both switches off nothing is measuring, and the slow fade back to
   *  rest is the designed gesture it always was — the page keeps a trace of the
   *  note you just left. The attribute must land BEFORE the colour changes, or
   *  the transition is computed at the old duration and the fade stays short. */
  const release = () => {
    clearTimer();
    document.documentElement.removeAttribute("data-zeiger");
    if (gemessen) return;
    document.documentElement.setAttribute("data-accent-release", "");
    setAccent(homeRestAccent);
    releaseTimer.current = window.setTimeout(() => {
      document.documentElement.removeAttribute("data-accent-release");
      releaseTimer.current = null;
    }, RELEASE_MS);
  };

  // Navigating away mid-fade would otherwise leave the slow duration pinned on
  // <html> for the next page — and leaving data-zeiger up would leave the next
  // page's accent frozen wherever this one left it, with the measurement
  // politely standing down for a pointer that is no longer anywhere.
  useEffect(
    () => () => {
      clearTimer();
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
                  what we want: the name then obeys the 1.2s release rule and
                  fades out with the rest of the page. */}
              <span className="accent-t font-display text-4xl font-medium leading-none tracking-tight text-muted group-hover:text-accent md:text-6xl lg:text-7xl">
                {f.name}
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
