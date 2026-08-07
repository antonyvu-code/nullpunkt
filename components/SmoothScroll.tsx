"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.12 });
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* REFRESH ON RESIZE OURSELVES, because ScrollTrigger's own resize refresh
       cannot land on a Lenis page and silently stops running after the first
       scroll. Its refreshAll defers while `_lastScrollTime` is set and waits for
       a `scrollEnd`, which is dispatched from `_updateAll` 200 ms after the last
       scroll — but here `_updateAll` only runs when Lenis emits `scroll`, and
       Lenis stops emitting the moment the page settles. So `_lastScrollTime`
       stays set, the deferred refresh waits for an event that never comes, and
       every ScrollTrigger on the site keeps the start/end positions and
       measurements of the layout it was born in.

       Measured before this: at 1280 the capability rack seated correctly; after
       resizing to 375 the modules still started from a three-column layout that
       no longer existed, and neither the trigger's onRefresh nor its
       onRefreshInit fired at all. ScrollTrigger.refresh() passes force = true,
       which is the one path that skips the deferral. Debounced, because a drag
       resize fires this continuously and a refresh re-measures every trigger. */
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      gsap.ticker.remove(raf);
      lenis.destroy();
      (window as unknown as { lenis?: Lenis }).lenis = undefined;
    };
  }, []);
  return null;
}
