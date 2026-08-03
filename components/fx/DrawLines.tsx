"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useFx } from "@/components/fx/FxProvider";

/**
 * FX.04 — the section rails draw, and FX.06 — the Werdegang axis fills.
 *
 * Same mechanism, so they share a file: a hairline that already exists is given
 * a transform origin at the top and scrubbed from scaleY 0 to 1. Nothing is
 * added to the page, nothing moves, no layout is touched — the rule is simply
 * drawn instead of being there from the start, the way a plotter puts one down.
 *
 * The cheapest thing on the bench, and the only one that costs no bundle beyond
 * this file: ScrollTrigger is already loaded for the reveals.
 *
 * Reduced motion gets the finished drawing. A rule that has not been drawn yet
 * is missing structure, not a missing flourish, so it must never be the state
 * someone is left in.
 */
export default function DrawLines() {
  const rails = useFx("rail-draw");
  const axis = useFx("werdegang-axis");
  const pathname = usePathname();

  useGSAP(
    () => {
      if (!rails && !axis) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.registerPlugin(ScrollTrigger);

      /* Nothing is shown or hidden here. Both rules are ordinary elements that
         are always in the page; this only takes hold of their scaleY. An earlier
         version toggled visibility as well and cost two bugs for it — see the
         note on Rail in page.tsx. An effect that only ever animates is an effect
         that can only ever be reverted. */
      /* The two share a mechanism, not a tempo. One window for both is what made
         them read as the same effect happening twice: a rail is drawn across a
         whole section, a station's tick across that station alone, and those are
         different lengths of time by an order of magnitude. */
      const draw = (
        selector: string,
        scope: string,
        start: string,
        end: string,
        scrub: number,
      ) =>
        gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
          gsap.fromTo(
            el,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              transformOrigin: "top center",
              scrollTrigger: { trigger: el.closest(scope) || el, start, end, scrub },
            },
          );
        });

      /* The pen should still be moving while the section is being read. Starting
         as the top clears the fold and not finishing until the section is most
         of the way out spreads the draw across the reading rather than getting it
         over with in the first screen. The heavier scrub is the arm's weight — a
         plotter does not stop dead when the paper does. */
      if (rails) draw('[data-fx-line="rail"]', "section", "top 95%", "bottom 40%", 0.7);
      /* The axis is the opposite instruction: each date should LAND. A short
         window closing at the station's own centre and a crisp scrub make the
         tick arrive with the row it belongs to, so the axis grows in steps as
         the years go by instead of drifting behind them. */
      if (axis) draw('[data-fx-line="axis"]', "li", "top 85%", "center 55%", 0.25);
    },
    { dependencies: [rails, axis, pathname], revertOnUpdate: true },
  );

  return null;
}
