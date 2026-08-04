"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/**
 * The hero's entrance — a designed sequence, not the uniform fade every other
 * section uses. Coordinates register, the kicker sets, the title wipes up from
 * a mask, the manifesto follows, and the operator cells come online one reading
 * at a time (staggered left to right, like an instrument warming up). Delayed to
 * land as the loader clears. Reduced motion: everything simply present.
 *
 * OPACITY, never autoAlpha — the same rule Reveal.tsx states at length, and this
 * file is where breaking it cost the most. autoAlpha writes visibility:hidden,
 * and a `from()` tween renders its start values the moment it is created, not
 * when its delay expires: the hero therefore sat hidden for the whole 1.5s that
 * buys the loader its exit, and then for the tween on top. For that window the
 * page carried no <h1> and no "Operator readings" list in the accessibility tree
 * at all — first screen, before any interaction, on a site that prints
 * "WCAG 2.1 AA" in its own capability list. Nothing inside [data-hero] is
 * focusable, so Reveal's focusin escape hatch has nothing to catch and is not
 * repeated here; if a link ever lands in the hero, it has to come along.
 */
export default function HeroIntro() {
  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set("[data-hero]", { opacity: 1, y: 0, x: 0, clipPath: "none", yPercent: 0 });
      gsap.set("[data-hero-cell]", { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ delay: 1.5 }); // clears the loader
    tl.from('[data-hero="coord"]', { opacity: 0, x: -14, duration: 0.5, ease: "power2.out" })
      .from('[data-hero="kicker"]', { opacity: 0, y: 10, duration: 0.5, ease: "power2.out" }, "-=0.25")
      .fromTo(
        '[data-hero="title"]',
        { opacity: 0, yPercent: 14, clipPath: "inset(0 0 100% 0)" },
        {
          opacity: 1,
          yPercent: 0,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.95,
          ease: "power3.out",
        },
        "-=0.15",
      )
      .from('[data-hero="manifesto"]', { opacity: 0, y: 12, duration: 0.6, ease: "power2.out" }, "-=0.45")
      .from(
        "[data-hero-cell]",
        { opacity: 0, y: 16, duration: 0.5, stagger: 0.06, ease: "power2.out" },
        "-=0.3",
      );
  }, {});

  return null;
}
