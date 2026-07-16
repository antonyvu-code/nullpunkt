"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

export default function Reveal() {
  const pathname = usePathname();

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (els.length === 0) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(els, { autoAlpha: 1, y: 0 });
        return;
      }
      els.forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });
    },
    { dependencies: [pathname] },
  );

  return null;
}
