"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

/**
 * The capability modules are carried into the rack by the scroll itself.
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

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        /* The designed static frame M1 asks for: the rack full and readable. A
           module halfway in is missing information, not missing decoration. */
        gsap.set(cards, { opacity: 1, x: 0, y: 0 });
        return;
      }

      /* How many columns the grid actually resolved to. Read off the layout
         rather than off a breakpoint list, so this cannot drift from the CSS:
         every module on the first row shares the first module's offsetTop. */
      const firstTop = cards[0].offsetTop;
      const cols = Math.max(1, cards.filter((c) => c.offsetTop === firstTop).length);

      /* LAYOUT METRICS, NOT RECTS, and this is the bug that made the first
         scrubbed version look like a plain fade. getBoundingClientRect() reports
         the element WHERE IT IS DRAWN, which includes whatever transform is on
         it — so once these values had been applied, invalidateOnRefresh
         re-measured a module that was already displaced and fed its own offset
         back into the sum. Measured: five of six modules resolved to x = 0 and
         only cross-faded, which is precisely the thing this version exists to
         stop doing. offsetLeft/offsetWidth/offsetHeight are layout figures and
         a transform cannot touch them, so they give the same answer on every
         refresh no matter what state the effect is in. */
      const startX = (i: number, el: HTMLElement) => {
        if (cols === 1) return 0;
        const col = i % cols;
        // Clear of the edge by the module's own width plus a margin, so nothing
        // is ever caught peeking at the start of the range.
        if (col === 0) return -(el.offsetLeft + el.offsetWidth + 64);
        if (col === cols - 1) return window.innerWidth - el.offsetLeft + 64;
        return 0;
      };

      const startY = (i: number, el: HTMLElement) => {
        // Single column: everything rises. Otherwise only the middle stream does.
        const middle = cols === 1 || (cols === 3 && i % cols === 1);
        return middle ? el.offsetHeight * 0.6 + 80 : 0;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cards[0].parentElement || cards[0],
          /* The range is the rack's own approach: out of frame when the grid is
             still below the fold, fully seated by the time its top is 45% up the
             window — which is before the reader is reading it, not while. */
          start: "top bottom",
          end: "top 45%",
          /* Enough lag that the modules feel carried rather than dragged, not so
             much that they are still moving after the wheel has stopped. */
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        cards,
        {
          x: startX,
          y: startY,
          opacity: 0,
        },
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
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
