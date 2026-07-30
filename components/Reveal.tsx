"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

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

      return () => abwurf.forEach((ab) => ab());
    },
    { dependencies: [pathname] },
  );

  return null;
}
