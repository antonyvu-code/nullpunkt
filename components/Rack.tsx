"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

/**
 * The capability modules are carried into the rack by the scroll itself.
 *
 * ALL SIX ARE ON SCREEN, and that is a decision, not a leftover. A one-bay
 * version of this section was built and measured (FX.08, `capability-deck`):
 * the six modules dealt through a single slot held at the middle of the window,
 * one at a time, five parked. It worked, and it was the wrong instrument — a
 * reader who wants to know whether this person writes shaders had to scroll
 * three screens to find out, and could never see MOTION and GRAPHICS at once to
 * compare them. A rack is read across, so the rack is laid out across.
 *
 * SCRUBBED, NOT TRIGGERED, and that distinction is the whole point of this
 * file's third version. The first two fired a timeline when the section crossed
 * a line: the modules played their entrance once and stayed, and scrolling back
 * up did nothing, because the animation had already been spent. That is a
 * transition — a thing the page does at you — and it is not what a rack being
 * loaded looks like. Here the scroll position IS the position: every module's
 * place on screen is a function of how far through the range the reader is, so
 * the wheel carries them in, and rolling it back carries them out again. There
 * is no state to be spent.
 *
 * They come from OFF THE SCREEN, not from a few pixels below it. The distance is
 * measured per module from its own rect, so each one starts fully clear of the
 * edge it enters from at any viewport width, rather than from a guessed offset
 * that is too far on a phone and invisible on a desktop.
 *
 * The outer columns converge from the sides and the middle rises from below,
 * which is what makes it read as a rack being filled rather than as a list
 * sliding about: three streams arriving at one frame. Which column a module is
 * in is derived from the laid-out grid — modules sharing an offsetTop are a row
 * — so the effect follows the 1/2/3-column breakpoints without being told about
 * them.
 *
 * Transform and opacity only, per the craft floor's P1. Nothing here reflows,
 * and html already carries overflow-x: clip, so a module waiting off the left
 * edge cannot grow a horizontal scrollbar.
 */
export default function Rack() {
  const pathname = usePathname();

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const cards = gsap.utils.toArray<HTMLElement>("[data-rack-card]");
      if (cards.length === 0) return;

      /* gsap.matchMedia rather than a test at mount, for the reason FX.03
         states at length: the layout this driver measures is CSS, it can change
         underneath it, and a decision taken once stays bolted to a layout that
         no longer exists.
         The motion query is safe here: this is the browser's matchMedia. It is
         only Lightning CSS that drops no-preference (see globals.css, FX.03). */
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const grid = cards[0].parentElement || cards[0];
        const section = grid.closest<HTMLElement>("section") || grid;

        /* NOTHING IS RETIRED HERE, and that is deliberate. ShelfTransport has to
           kill the reveal on the section it pins at runtime; this one does not,
           because the section carries data-reveal-pinned instead of data-reveal
           (see app/page.tsx) and Reveal therefore never fades it in the first
           place. Doing it at runtime was tried and does not hold: Reveal depends
           on FX.07, so every switch rebuilds its tweens, and a kill that runs
           once when this context is created cannot reach a fade created after
           the next toggle. Measured then — the section sat at opacity 0 for the
           whole pin while the rack loaded invisibly inside it. A static marker
           has no order to get wrong. */

        /* How many columns the grid actually resolved to, read off the layout
           rather than off a breakpoint list: every module on the first row
           shares the first module's offsetTop. Re-read on every refresh — a
           column count captured once survives the breakpoint that invalidated
           it, and after a 1280 → 375 resize module 6 still carried the x = 628
           of a three-column layout that no longer existed. */
        const measureCols = () => {
          const firstTop = cards[0].offsetTop;
          return Math.max(1, cards.filter((c) => c.offsetTop === firstTop).length);
        };
        let cols = measureCols();

        /* LAYOUT METRICS, NOT RECTS. getBoundingClientRect() reports the element
           WHERE IT IS DRAWN, transform included — so once these values had been
           applied, invalidateOnRefresh re-measured a module that was already
           displaced and fed its own offset back into the sum. Measured: five of
           six modules resolved to x = 0 and only cross-faded. offsetLeft and
           offsetWidth are layout figures a transform cannot touch. */
        const startX = (i: number, el: HTMLElement) => {
          if (cols === 1) return 0;
          const col = i % cols;
          if (col === 0) return -(el.offsetLeft + el.offsetWidth + 64);
          /* clientWidth, not innerWidth: innerWidth counts the scrollbar, which
             is the same trap --gutter documents at length in globals.css. The
             64px margin swallows the error here, so this is consistency rather
             than a fix — but a file that measures layout should not be the one
             place in the repo still asking the wrong question. */
          if (col === cols - 1) return document.documentElement.clientWidth - el.offsetLeft + 64;
          return 0;
        };

        const startY = (i: number, el: HTMLElement) => {
          const middle = cols === 1 || (cols === 3 && i % cols === 1);
          return middle ? el.offsetHeight * 0.6 + 80 : 0;
        };

        /* PARK ON EVERY REFRESH. With function-based or staggered from-values
           GSAP does not record a module's start until that module's own tween
           begins; until then the element renders at its stylesheet state —
           seated, opaque, in the way. Measured: module 4 sat fully seated at
           25 % of the range and JUMPED BACK OUT to the edge at 50 % to fly in
           again. Re-stating the parked state restores the invariant the scrub
           assumes; anything the scrub has already rendered is re-rendered
           immediately after this. */
        const park = () => gsap.set(cards, { x: startX, y: startY, opacity: 0 });
        park();

        const tl = gsap.timeline({
          scrollTrigger: {
            /* THE SECTION IS PINNED WHILE THE RACK LOADS: the page stops, the
               six modules travel in, and only then does the page move on. The
               trigger is the section rather than the grid, because what has to
               hold still is the heading as well — a rack filling under a label
               that has scrolled away is the thing the deck version got wrong. */
            trigger: section,
            pin: true,
            anticipatePin: 1,
            onRefresh: park,
            /* CENTRE ON CENTRE, which is where the pin has to catch it and is
               not the same line the un-pinned version started on. That one held
               everything parked until the grid's TOP reached 68 % of the window
               — a good moment to begin travelling, and the worst possible frame
               to freeze: at 940px of window the grid then runs 639 → 1237, so
               297px of the rack is below the fold and two of the six modules
               would arrive where nobody can see them. Pinning is only worth the
               reader's scroll if what is held still is the whole thing.
               Centre on centre frames it almost exactly at both sizes measured:
               the section is 1005px against 812 of window, so it sits at −96 and
               the grid lands at 214 → 812 — every module in frame with the
               heading above it. At 940 it sits at −33 with 65px to spare.

               THE RUN IS THE PIN'S LENGTH. 45 % of the window, which is the
               pace the un-pinned range already had (373px at 940) rather than a
               new number: the same wheel distance moves the same tween. This is
               the one knob here — longer and the reader is held staring at a
               finished rack, shorter and the modules pile in on top of each
               other. */
            start: "center center",
            end: "+=45%",
            /* Enough lag that the modules feel carried rather than dragged, not
               so much that they are still moving after the wheel has stopped. */
            scrub: 0.7,
            invalidateOnRefresh: true,
            /* Below the shelf's pin (2) and above everything else (0). Pinning
               inserts a spacer as tall as the run, so every section under this
               one moves down the document by 45 % of a window — and triggers are
               refreshed highest-priority first. The shelf's own note documents
               what happens when a pin is measured out of order: the reveals
               below it fired 1936px early, on content still far below the fold.
               Two pins on one page means the order has to be stated, not left to
               whichever component happened to mount first. */
            refreshPriority: 1,
            onRefreshInit: () => {
              cols = measureCols();
            },
          },
        });

        tl.fromTo(
          cards,
          { x: startX, y: startY, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 1,
            /* Inside a scrub, stagger is what spreads the modules across the
               range instead of landing them all on the same frame — it is the
               sequence, not a delay. */
            stagger: 0.18,
            ease: "power2.out",
          },
        );

        /* A beat of pin left over after the last module lands. The timeline is
           1 + 5 × 0.18 = 1.9 units long and the scrub trails the wheel by 0.7s,
           so without this the sixth module is still catching up in the frame the
           pin lets go — the page starts moving while the rack is not finished.
           0.3 units puts the last landing at 86 % of the run and leaves the rest
           for the scrub to settle. It is the same hold the deck version needed
           at its end, for the same reason. */
        tl.to({}, { duration: 0.3 }, 1.9);

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(cards, { clearProps: "transform,opacity" });
        };
      });

      /* Reduced motion and the phone get no driver at all — the grid is the
         designed static frame, and a module halfway in is missing information
         rather than missing decoration. */
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
