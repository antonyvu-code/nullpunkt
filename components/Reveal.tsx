"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useFx } from "@/components/fx/FxProvider";

/**
 * Scroll reveals for every [data-reveal] block.
 *
 * Animates OPACITY, never autoAlpha. autoAlpha adds visibility:hidden, and
 * visibility:hidden takes an element out of the tab order AND out of the
 * accessibility tree: measured on the home page before any scroll, that hid
 * 18 of 23 links and 8 of 8 headings from a keyboard or a screen reader, on a
 * page that prints "WCAG 2.1 AA" in its own capability list. A reveal is a
 * presentation effect; it must not decide what exists.
 *
 * The other half of the problem is the mirror image: opacity:0 keeps content
 * focusable, so tabbing ahead of the scroll position would land focus on
 * something invisible. Hence the focusin escape hatch — focus reaching a block
 * shows it at once and retires its tween, so the trigger can't fade it back
 * from zero later.
 */
export default function Reveal() {
  const wipe = useFx("type-wipe");
  const pathname = usePathname();

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (els.length === 0) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(els, { opacity: 1, y: 0 });
        return;
      }

      const abwurf: (() => void)[] = [];

      els.forEach((el) => {
        const tween = gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );

        const zeigen = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(el, { opacity: 1, y: 0 });
        };
        el.addEventListener("focusin", zeigen, { once: true });
        abwurf.push(() => el.removeEventListener("focusin", zeigen));
      });

      /* FX.07 — display type arrives the one way.
         The hero title wipes up from a mask; every heading below it slid up on
         opacity instead, so the page had two ways of introducing the same role
         of type. This gives the sections the hero's way.

         clip-path, not visibility: a clipped heading is still in the
         accessibility tree and still found by find-in-page, which is the whole
         reason this file refuses autoAlpha two paragraphs up. The rule does not
         get a pass just because the property is prettier.

         No focusin hatch, unlike the blocks above: headings are not focusable,
         and the clip retires itself on first crossing. */
      /* Both markers, and that is the point of the second one. A block carrying
         data-reveal-pinned has opted out of the FADE — its own effect owns when
         it appears — but not out of the page's one way of introducing display
         type. Leaving it out here would make the capability heading the single
         h2 on the page that slides instead of wiping. */
      if (wipe) {
        gsap.utils.toArray<HTMLElement>("[data-reveal] h2, [data-reveal-pinned] h2").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(0 0 100% 0)", yPercent: 6 },
            {
              clipPath: "inset(0 0 0% 0)",
              yPercent: 0,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
          );
        });
      }

      return () => abwurf.forEach((ab) => ab());
    },
    // revertOnUpdate for the same reason AccentScroll needs it: without it,
    // switching FX.07 off would leave the clip-paths from the previous context
    // standing under a re-run that has decided to do nothing, and the bench
    // would report the effect as permanent.
    { dependencies: [pathname, wipe], revertOnUpdate: true },
  );

  return null;
}
