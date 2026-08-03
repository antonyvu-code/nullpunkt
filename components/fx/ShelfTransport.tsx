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

        const tween = gsap.to(track, {
          x: () => -travel(),
          ease: "none",
          scrollTrigger: {
            trigger: win,
            start: "top top",
            /* The run is exactly as long as the stock is wide. Any other number
               and the carriage either arrives early and then sits there, or is
               still moving when the pin lets go. */
            end: () => "+=" + travel(),
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        const st = tween.scrollTrigger;

        /* THE HAND-OVER — the next section arrives from the right rather than
           from below.

           Done with transforms only, and that is the whole trick. The obvious
           implementation is to fix the incoming section over the viewport, but
           taking a 1287px section out of flow shortens the document by that
           much, which moves every scroll position ScrollTrigger has already
           measured — the effect would be fighting its own trigger. A transform
           changes nothing about layout, so the page underneath stays exactly as
           long as it was.

           The window is Field Notes' own approach: from the moment its top
           would touch the bottom of the screen to the moment it would touch the
           top. That is one viewport, and it begins AFTER the carriage has
           unpinned and the shelf's closing line has had a screen to be read —
           the door to the archive lives in that line, so it must not be covered
           on its way past. */
        const notes = document.querySelector<HTMLElement>("#field-notes");
        if (notes) {
          /* Opaque and above: without a ground of its own the carriage would
             show straight through the arriving section, and without the stacking
             context a later sibling still paints under a transformed earlier
             one. Both are reverted with everything else when the media query
             stops matching. */
          gsap.set(notes, { position: "relative", zIndex: 1, backgroundColor: "var(--bg)" });

          /* Reveal owns [data-reveal] and fades it up by animating y. This owns
             y on the same element for the length of the hand-over, and the two
             ranges overlap: measured at 1440×900 the reveal fires at scroll
             3250, which is 108px INSIDE the hand-over. Two writers on one
             transform, once per frame, and the winner is whichever tween the
             ticker reached last — a flicker, not a crash, which is the kind that
             survives review.
             Retiring it here rather than removing data-reveal keeps the fade for
             every state this effect is not in: the phone, reduced motion, and
             the switch turned off. A section that arrives sideways does not also
             need to arrive from below. */
          gsap.utils
            .toArray<ScrollTrigger>(ScrollTrigger.getAll())
            .filter((s) => s.trigger === notes)
            .forEach((s) => {
              s.animation?.progress(1);
              s.kill();
            });
          gsap.set(notes, { opacity: 1, y: 0 });

          const hand = { q: 0 };
          gsap.to(hand, {
            q: 1,
            ease: "none",
            scrollTrigger: {
              trigger: notes,
              start: "top bottom",
              end: "top top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
            onUpdate: () => {
              const q = hand.q;
              /* The section's own upward travel is cancelled for the length of
                 the hand-over, so it sits still at the top of the window and the
                 only movement the eye is given is the horizontal one. At q = 1
                 the cancellation is zero — which is exactly where the section
                 naturally is — so the effect hands back to ordinary scrolling
                 without a seam to hide. */
              const y = -window.innerHeight * (1 - q);
              /* In over the first three quarters, then still. Arriving and being
                 scrolled away in one continuous motion reads as one event that
                 went wrong rather than two that went right. */
              const inward = gsap.utils.clamp(0, 1, q / 0.75);
              gsap.set(notes, { x: window.innerWidth * (1 - inward), y });
            },
          });
        }

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
