"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/**
 * The hero's entrance — a designed sequence, not the uniform fade every other
 * section uses. Coordinates register, the kicker sets, the title wipes up from
 * a mask, the manifesto follows, and the operator cells come online one reading
 * at a time (staggered left to right, like an instrument warming up). Delayed to
 * land as the loader clears. Reduced motion: everything simply present.
 */
export default function HeroIntro() {
  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set("[data-hero]", { autoAlpha: 1, y: 0, x: 0, clipPath: "none", yPercent: 0 });
      return;
    }

    const tl = gsap.timeline({ delay: 1.5 }); // clears the loader
    tl.from('[data-hero="coord"]', { autoAlpha: 0, x: -14, duration: 0.5, ease: "power2.out" })
      .from('[data-hero="kicker"]', { autoAlpha: 0, y: 10, duration: 0.5, ease: "power2.out" }, "-=0.25")
      .fromTo(
        '[data-hero="title"]',
        { autoAlpha: 0, yPercent: 14, clipPath: "inset(0 0 100% 0)" },
        {
          autoAlpha: 1,
          yPercent: 0,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.95,
          ease: "power3.out",
        },
        "-=0.15",
      )
      .from('[data-hero="manifesto"]', { autoAlpha: 0, y: 12, duration: 0.6, ease: "power2.out" }, "-=0.45")
      .from(
        "[data-hero-cell]",
        { autoAlpha: 0, y: 16, duration: 0.5, stagger: 0.06, ease: "power2.out" },
        "-=0.3",
      );
  }, {});

  return null;
}
