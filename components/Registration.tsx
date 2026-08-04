"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

/**
 * The shelf is acquired, not faded in.
 *
 * Every other section on this page arrives the same way: opacity up, y down,
 * done. On a shelf whose own copy says POINT TO PROBE and calls its cards
 * specimens, that entrance said nothing — it was the arrival any block on any
 * site makes. So the cards now register instead: four brackets strike in from
 * outside each card and settle on its corners, one card after the next, the way
 * an instrument takes hold of a specimen before it reads it.
 *
 * The geometry is entirely in globals.css ([data-reg]); this only moves the one
 * number the brackets hang off. That split matters — --reg is also read by the
 * probe rules, so acquisition and reading stay two beats of one gesture rather
 * than two effects that happen to touch the same element.
 *
 * A CUSTOM PROPERTY, NOT A TRANSFORM, and not by preference. FX.03 pins this
 * section, a pinned element resolves against its nearest transformed ancestor
 * instead of the viewport, and ShelfTransport already documents what that cost
 * to find. Animating a number cannot create a containing block, so the
 * acquisition and the carriage can never fight over the same property.
 *
 * Reduced motion gets the frame outright. The brackets are the card's frame —
 * withholding them would leave a plainer page, not a calmer one, which is the
 * distinction M1 is asking for.
 */
export default function Registration() {
  const pathname = usePathname();

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      if (cards.length === 0) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(cards, { "--reg": 1 });
        return;
      }

      /* Triggered off the shelf as a whole, not off each card. Per-card
         triggers would fire the two cards of a row at slightly different scroll
         positions — the grid puts them at the same height, so any difference
         between them is noise rather than sequence. One trigger and an explicit
         stagger is the sequence actually wanted: left to right, top to bottom,
         in the order the shelf is read. */
      const shelf = cards[0].closest<HTMLElement>("[data-transport]") || cards[0];

      gsap.fromTo(
        cards,
        { "--reg": 0 },
        {
          "--reg": 1,
          duration: 0.45,
          /* Faster than a reveal and slower than a click. The mark should land
             rather than drift — it is a bracket closing on a corner, and there
             is nothing elastic about that. */
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: shelf, start: "top 80%", once: true },
        },
      );
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
