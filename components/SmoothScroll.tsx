"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION_FPS } from "@/lib/motion";

export default function SmoothScroll() {
  /* THE CAP IS NOT PART OF THE SMOOTH SCROLL, and putting it there was a bug
     that lasted one commit. GSAP's ticker runs whether or not this component
     starts Lenis — AccentScroll's sweep is added to it, and so is anything else
     gsap drives — so a cap written below the reduced-motion bail-out is a cap
     that never applies in reduced motion. Measured: 281 rAF callbacks a second
     still running with the setting on, the heaviest of them this very ticker.
     That is the mode Antony reported as janky, and the one the cap was missing.

     It also runs before registerPlugin and before any Lenis exists, because the
     ticker is a global that other components have already added work to by the
     time this effect runs. */
  useEffect(() => {
    gsap.ticker.fps(MOTION_FPS);
    gsap.ticker.lagSmoothing(0);
  }, []);

  /* Read live, for the same reason Passer.tsx does — see the note there. A
     one-time read here left Lenis absent on a page whose ScrollTriggers had
     since been switched on by gsap.matchMedia, so the scrubs ran against raw
     native scroll with nothing smoothing them. */
  const [reduce, setReduce] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduce !== false) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.12 });
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);

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
  }, [reduce]);
  return null;
}
