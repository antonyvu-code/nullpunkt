"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useFx } from "@/components/fx/FxProvider";

/**
 * FX.03 — the shelf runs as a carriage.
 *
 * The section holds still and the four specimens travel left under a fixed
 * measuring head, at the rate the wheel is turned. Borrowed mechanic, and worth
 * being honest about that: a pinned horizontal run is the most-copied agency
 * effect of the last few years. What makes it belong here rather than sit on top
 * is that this page is already an instrument, so a length of stock drawn past a
 * fixed head is a thing it can already say — and the card under that head is
 * what the page borrows its colour from, which is the FX.01 idea finally working
 * without a pointer. On a phone, where there is no hover at all, that is the
 * difference between the site's one original idea being visible and not.
 *
 * The layout switch is CSS (globals.css, FX.03). This file only pins and drives.
 * Nothing here writes a style the effect cannot take back: the track's x is the
 * single property it owns.
 */
export default function ShelfTransport() {
  const on = useFx("shelf-transport");
  const pathname = usePathname();

  useGSAP(
    () => {
      if (!on) return;
      gsap.registerPlugin(ScrollTrigger);

      const win = document.querySelector<HTMLElement>("[data-transport]");
      const track = win?.querySelector<HTMLElement>("[data-transport-track]");
      if (!win || !track) return;

      /* gsap.matchMedia, not a one-off test at mount. The layout this drives is
         CSS and can change underneath it — drag the window across the breakpoint
         and the shelf is a grid again — so a pin decided once would stay bolted
         to a layout that no longer exists, and a reader who had asked for less
         motion mid-session would keep the traverse. matchMedia builds the whole
         thing when the query starts matching and reverts it when it stops, which
         is the same contract the stylesheet is under.
         The motion query is safe to write here: this is the browser's own
         matchMedia. It is only the CSS compiler that eats no-preference — see
         the note on FX.03 in globals.css. */
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        /* THE PIN'S ONE HARD REQUIREMENT: no transformed ancestor.
           A pinned element is position: fixed, and position: fixed resolves
           against the nearest TRANSFORMED ancestor instead of the viewport.
           #selected carries data-reveal, and Reveal leaves
           `transform: translate(0px, 0px)` on it for good once its fade has
           run — visually nothing, and enough to make the section the containing
           block for its own pinned child. Measured through the traverse before
           this was here, the carriage's window sat at -124, -603, -1087, -1571
           instead of holding at 0: the section scrolled away while the track was
           still travelling, so the run ended with the page already moving on.
           Every geometric check passed the whole time, because the track and the
           travel distance were both correct — it was the thing they were
           measured against that would not stay still.
           Retiring the reveal here rather than dropping data-reveal keeps the
           fade for the phone, for reduced motion and for the switch turned off,
           and a section that is about to be pinned has no use for it anyway. */
        const section = win.closest<HTMLElement>("section");
        if (section) {
          ScrollTrigger.getAll()
            .filter((s) => s.trigger === section)
            .forEach((s) => {
              s.animation?.progress(1);
              s.kill();
            });
          gsap.set(section, { opacity: 1 });
          gsap.set(section, { clearProps: "transform,translate,rotate,scale" });
        }

        /* Measured, never assumed. Card width is a vw figure and the gaps are
           rem, so the only honest source for the distance to travel is the
           laid-out track itself — and it has to be re-read on every refresh,
           which is why both this and `end` are functions and invalidateOnRefresh
           is set.

           Deliberately NOT guarded with an early return on zero. It was, and
           that guard is what made this effect appear to do nothing at all: the
           layout is CSS gated on <html data-fx>, and for one beat at mount that
           attribute had not been written yet, so the shelf was still a grid and
           measured zero to travel. Returning there killed the effect for good —
           nothing re-runs a hook whose dependencies have not changed. The
           attribute now ships in the server HTML (lib/fx.ts), but a measurement
           that reads zero must in any case be a trigger that corrects itself on
           the next refresh, not a component that quietly gives up. */
        const travel = () => Math.max(0, track.scrollWidth - win.clientWidth);

        /* The run is exactly as long as the stock is wide. Any other number and
           the carriage either arrives early and then sits there, or is still
           moving when the pin lets go.

           This effect owns the SHELF and nothing else. Field Notes used to be
           dragged into it — first as a hand-over that slid the section in from
           the right once the pin released, later as a second phase on this same
           pin. Both are gone: the section below is an ordinary section, it
           arrives the way every other one does, and the pin ends when the last
           specimen reaches the head. Anything here that reaches past this
           section's own boundary is this effect deciding how the NEXT one gets
           to appear, which is not its business. */
        const tween = gsap.to(track, {
          x: () => -travel(),
          ease: "none",
          scrollTrigger: {
            trigger: win,
            start: "top top",
            end: () => "+=" + travel(),
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            /* THIS TRIGGER MUST BE MEASURED FIRST, and it is not a tuning knob.
               Pinning inserts a spacer as tall as the run, which pushes every
               section below this one down the document by that much. Triggers
               are refreshed in priority order, highest first, and at the default
               0 the order is creation order — so Reveal, which mounts above this
               in the tree, measured Field Notes against a page that did not yet
               contain the spacer.

               Measured: Field Notes reached full opacity at scroll 1482 with its
               top still 2536px below the fold, against a correct firing point of
               about 3224. Every section under the shelf was reading its own
               arrival 1936px early — the width of the run — which is to say the
               reveals below here were being spent on content nobody was looking
               at yet, and the sections then arrived already faded up.

               It was invisible until now only because this effect used to kill
               the reveal on the section below and drive it by hand. That is
               gone, so the underlying mis-measurement is no longer covered. */
            refreshPriority: 1,
          },
        });

        const st = tween.scrollTrigger;

        /* THE SECOND LAYER. The track carries the cards; the plates inside them
           run the other way, slower. Without it a carriage is a strip of card
           sliding past — correct, and flat, because every pixel on screen moves
           as one rigid thing and nothing tells the eye there is any depth to
           the frame. With it the plate sits BEHIND its own window: the frame,
           the brackets and the caption travel with the stock while the image
           lags inside its clip, which is what a specimen looks like when it is
           being carried past a fixed lens rather than painted onto a card.

           The lag is in two parts, and both are needed. The opposing xPercent
           is the parallax; the heavier scrub (1 against the track's 0.6) is the
           weight — the image keeps arriving a beat after the frame that holds
           it, and stops a beat later too.

           The scale is not decoration: an image translated inside an
           overflow-hidden box shows the edge it was translated away from. 1.12
           buys exactly the 6% of overhang each side that the travel spends.

           Its own trigger rather than a shared timeline, because the two need
           DIFFERENT scrubs and a timeline can only have one. Same trigger
           element and the same start/end expression, so the ranges cannot drift
           apart on a refresh; the pin stays on the track's trigger alone, since
           two triggers pinning one element is two pin-spacers. */
        const plates = gsap.utils.toArray<HTMLElement>("[data-plate] img", track);
        if (plates.length > 0) {
          gsap.set(plates, { scale: 1.12 });
          gsap.fromTo(
            plates,
            { xPercent: 6 },
            {
              xPercent: -6,
              ease: "none",
              scrollTrigger: {
                trigger: win,
                start: "top top",
                end: () => "+=" + travel(),
                scrub: 1,
                invalidateOnRefresh: true,
              },
            },
          );
        }

        /* Nothing is done to the section below, deliberately. It used to be
           taken over here — parked off the right edge, given a ground and a
           stacking context, its own reveal killed so the two would not write to
           y in the same frame — so that it could arrive sideways out of the
           shelf's run. All of that is gone. Field Notes is an ordinary section
           again: it keeps its [data-reveal] fade, it owns its own transform, and
           it arrives the way every other section on the page arrives. */

        /* Keyboard access, which is where this pattern usually breaks.
           The cards past the head are off-screen but still perfectly focusable,
           so tabbing into one leaves the browser to "scroll it into view" — and
           the only axis it can scroll is the one the pin has taken away, so it
           fights the pin and lands nowhere. Translating the card's position
           along the track back into a scroll position and going there directly
           means Tab traverses the shelf the same way the wheel does. Reveal
           solves the same class of problem with the same instrument (a focusin
           listener); this is that idea applied to an axis instead of to
           opacity. */
        const zeigen = (e: FocusEvent) => {
          if (!st) return;
          const card = (e.target as HTMLElement | null)?.closest<HTMLElement>(
            "[data-transport-card]",
          );
          if (!card) return;
          const t = travel();
          if (t === 0) return;
          // Where the run has to stand for this card to sit under the head.
          const p = gsap.utils.clamp(
            0,
            1,
            (card.offsetLeft - (win.clientWidth - card.offsetWidth) / 2) / t,
          );
          const y = st.start + (st.end - st.start) * p;
          // Lenis owns the scroll position while it is running; telling the
          // window instead would be overwritten on its next frame.
          const lenis = (
            window as unknown as { lenis?: { scrollTo: (v: number, o?: object) => void } }
          ).lenis;
          if (lenis) lenis.scrollTo(y, { immediate: true });
          else window.scrollTo({ top: y, behavior: "auto" });
        };
        win.addEventListener("focusin", zeigen);

        return () => win.removeEventListener("focusin", zeigen);
      });

      return () => mm.revert();
    },
    { dependencies: [on, pathname], revertOnUpdate: true },
  );

  return null;
}
