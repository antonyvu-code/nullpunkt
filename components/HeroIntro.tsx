"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroRunway } from "@/lib/hero";

/**
 * THE HERO IS REVEALED BY THE READER, NOT BY THE CLOCK.
 *
 * WHAT CHANGED, 10.08.2026. This used to be an entrance: a timeline with a 1.5s
 * delay that played itself out while the reader watched. The first screen is now
 * the material and nothing else — the wordmark in the chrome, NULLPUNKT standing
 * in particles, in register. Scroll is what develops the plate. The hero is
 * PINNED for one screen of wheel and the copy arrives across it, scrubbed; only
 * when the last operator cell has landed does the pin let go and the work below
 * come up. So the page opens on its own zero point and the reader is the one who
 * takes it off zero — which is the argument the whole site is built on, made
 * literal at the top of it.
 *
 * SCRUBBED, NOT TRIGGERED. Same rule Rack.tsx states: scroll position IS the
 * position. Rolling back up puts the hero back to the bare word rather than
 * leaving a spent animation behind.
 *
 * ONE RUNWAY, SHARED WITH THE MATERIAL. lib/hero.ts owns the length; Passer
 * separates the plates over exactly the same stretch, so the word comes apart as
 * the language arrives. One gesture, two hands.
 *
 * THE CHROME STEPS OUT OF THE WAY. `[data-chrome-off]` goes up the moment the
 * reveal starts and comes back down as it finishes (see globals.css, Chrome.tsx):
 * the header lifts off the top of the screen while the hero is being written and
 * returns when it is written. It is a fixed bar over the one screen the page is
 * asking to be looked at, and it is back before the reader needs it.
 *
 * OPACITY, never autoAlpha — the same rule Reveal.tsx states at length, and this
 * file is where breaking it cost the most. autoAlpha writes visibility:hidden,
 * which takes the <h1> and the "Operator readings" list out of the accessibility
 * tree entirely: no heading and no readings on the first screen, before any
 * interaction, on a site that prints "WCAG 2.1 AA" in its own capability list.
 * At opacity 0 the copy is in the document and in the tree the whole time — it is
 * a reader's first screen that is bare, not the page's. Nothing inside [data-hero]
 * is focusable, so Reveal's focusin escape hatch has nothing to catch and is not
 * repeated here; if a link ever lands in the hero, it has to come along.
 *
 * REDUCED MOTION GETS THE WRITTEN PAGE, not a bare one it has to earn. No pin, no
 * scrub, every part present — withholding the copy from someone who asked for
 * less motion would be withholding the content, which is a different thing.
 */

/** Every part of the hero the reveal touches, in the order it writes them. */
const TEILE = {
  coord: '[data-hero="coord"]',
  readout: '[data-hero="readout"]',
  kicker: '[data-hero="kicker"]',
  title: '[data-hero="title"]',
  manifesto: '[data-hero="manifesto"]',
  fig: '[data-hero="fig"]',
  grid: '[data-hero="grid"]',
  cells: "[data-hero-cell]",
} as const;

const ALLE = Object.values(TEILE).join(", ");

export default function HeroIntro() {
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(ALLE, { opacity: 1, x: 0, y: 0, scale: 1 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const section = document.querySelector<HTMLElement>("[data-hero-section]");
      if (!section) return;

      /* ——— EVERYTHING COMES OUT OF THE CENTRE OF THE SCREEN ———————————————
         The copy used to arrive on small per-element offsets — the kicker from
         10px below, the title on a clipPath wipe, the readings from 16. Six
         little entrances that had nothing to do with each other and, worse,
         nothing to do with what the material was doing on the same screen.
         The eye is travelling forward through the plate stack: seen from inside
         that movement, everything in the volume streams OUTWARD from the point
         straight ahead. So the copy is placed in the volume too. Each part starts
         pulled toward the hero's centre and scaled back, and comes out to its own
         place as the eye arrives — the type was always there, at the far end of
         the same volume, and the approach is what brings it up to size.

         LAYOUT METRICS, NOT RECTS, and this is the trap Rack.tsx documents at
         length: getBoundingClientRect() reports an element WHERE IT IS DRAWN,
         transform included, so re-measuring on refresh would feed a displaced
         element's own offset back into its start value. offsetLeft/offsetTop up
         the offsetParent chain are layout figures a transform cannot touch. */
      const ZUG = 0.6; // how far toward the centre a part starts
      const mitte = (el: HTMLElement, achse: "x" | "y") => {
        let x = 0;
        let y = 0;
        let n: HTMLElement | null = el;
        while (n && n !== section) {
          x += n.offsetLeft;
          y += n.offsetTop;
          n = n.offsetParent as HTMLElement | null;
        }
        return achse === "x"
          ? (section.offsetWidth / 2 - (x + el.offsetWidth / 2)) * ZUG
          : (section.offsetHeight / 2 - (y + el.offsetHeight / 2)) * ZUG;
      };
      const zugX = (_: number, el: HTMLElement) => mitte(el, "x");
      const zugY = (_: number, el: HTMLElement) => mitte(el, "y");

      /* PARK ON EVERY REFRESH, for the reason Rack.tsx documents: until a tween
         has begun, the element renders at its stylesheet state — fully written,
         on the screen that is supposed to hold nothing but the word. */
      const park = () => {
        gsap.set(
          [TEILE.coord, TEILE.readout, TEILE.kicker, TEILE.title, TEILE.manifesto, TEILE.fig, TEILE.grid].join(", "),
          { opacity: 0, x: zugX, y: zugY, scale: 0.82 },
        );
        /* The readings do NOT get their own pull. The grid they sit in is already
           carrying the whole block out of the centre, and a cell travelling on
           top of that would leave the frame it is ruled into — five readings
           arriving from five directions inside a box that is itself moving. They
           light up in sequence where they already are; the row travels as a row. */
        gsap.set(TEILE.cells, { opacity: 0, y: 10 });
      };
      /* Runs inside useGSAP's layout effect, i.e. before the browser paints, so
         there is no frame in which the written hero is on screen. */
      park();

      /* THE PIN NEEDS THE HERO TO FIT THE SCREEN. Pinning is what holds the page
         still while the copy is written, and it holds the section AT THE TOP OF
         THE WINDOW — so a hero taller than the window would spend the whole pin
         with its lower half, readings included, below a fold the reader is not
         allowed to cross. On a narrow phone the title alone takes four lines and
         that is exactly what happens. There the reveal still runs on the same
         runway, unpinned: the copy is written as the hero scrolls, which is the
         same gesture with the page moving. Measured at creation and not on every
         refresh — a rotation is a resize, and SmoothScroll refreshes on those. */
      const passt = section.offsetHeight <= window.innerHeight + 2;

      /* The chrome is out of the way for the writing and back for the reading.
         ONE ATTRIBUTE, and nothing else: how far the bar travels and how long it
         takes are in globals.css, next to the rest of the site's motion tiers.
         Found in the DOM rather than owned here, the same way Passer takes the
         hero's readout — the header is the layout's, not this effect's.
         0.92 rather than 1 so the bar is already down when the pin lets go,
         instead of arriving on top of the section that follows. */
      const bar = document.querySelector<HTMLElement>("[data-chrome]");
      const chrome = (p: number) => {
        if (bar) bar.dataset.chromeOff = p > 0.015 && p < 0.92 ? "1" : "0";
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${heroRunway()}`,
          pin: passt,
          anticipatePin: 1,
          /* Enough lag that the copy feels carried by the wheel rather than
             dragged behind it — the same 0.6 the material runs on, so the two do
             not trail each other. */
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefresh: park,
          /* HIGHEST ON THE PAGE. Pinning inserts a spacer as tall as the run, so
             every section below moves down by a screen — and ScrollTrigger
             refreshes highest priority first. This pin is above the shelf's (2)
             and the rack's (1) because it is above them on the page: measure the
             top one last and the two below it are measured against a document
             that is about to grow under them. */
          refreshPriority: 3,
          onUpdate: (self) => chrome(self.progress),
          onLeave: () => chrome(1),
          onLeaveBack: () => chrome(0),
        },
      });

      /* The order is the plate's own: located, then labelled, then said, then
         measured. Positions are absolute rather than relative, because inside a
         scrub the numbers are the SEQUENCE across the run and not delays — the
         overlaps have to be readable as a score.
         ONE ARRIVAL, SIX TIMES. Every part now makes the same move — out of the
         centre, up to size — so the only thing that distinguishes them is WHEN
         and HOW LONG. The title's clipPath wipe went with the rewrite: a wipe is
         a second idea about how a heading appears, on the one screen that can
         least afford two. */
      const kommt = { opacity: 1, x: 0, y: 0, scale: 1, ease: "power2.out" };

      tl.to(TEILE.coord, { ...kommt, duration: 0.6 }, 0)
        .to(TEILE.readout, { ...kommt, duration: 0.6 }, 0.08)
        .to(TEILE.kicker, { ...kommt, duration: 0.6 }, 0.2)
        .to(TEILE.title, { ...kommt, duration: 1.1, ease: "power3.out" }, 0.4)
        .to(TEILE.manifesto, { ...kommt, duration: 0.7 }, 1.05)
        .to(TEILE.fig, { ...kommt, duration: 0.5 }, 1.35)
        /* The ruled frame arrives a beat before the readings that sit in it —
           the instrument's grid, then what it reads. The cells stagger INSIDE
           this, so the two opacities multiply and the first cell is carried in
           by both. */
        .to(TEILE.grid, { ...kommt, duration: 0.55 }, 1.42)
        .to(
          TEILE.cells,
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" },
          1.5,
        )
        /* A beat of run left over after the last cell lands. The score ends at
           2.42 and the scrub trails the wheel by 0.6s, so without this the last
           readings are still catching up in the frame the pin lets go — the page
           starts moving while the hero is not finished. Same hold, same reason,
           as the one at the foot of Rack.tsx. */
        .to({}, { duration: 0.35 }, 2.42);

      /* ——— AND EVERY TRIGGER BELOW HAS TO BE MEASURED AGAIN ————————————————
         This pin inserts a spacer 2.4 screens tall at the TOP of the document,
         which moves every section under it down by that much. refreshPriority
         orders a refresh; it does not cause one — and nothing here caused one.
         Triggers are measured as they are created, and creation order is mount
         order: SmoothScroll, Reveal and ShelfTransport all live in the root
         layout and mount before anything inside `main`, so they had already
         measured a document that did not yet contain this spacer. FxProvider
         deliberately does not refresh at mount either.

         Measured, and this is not a cosmetic drift: the shelf's pin started at
         scroll 1235 against a correct 2963 — 1728 early, exactly this runway —
         so the carriage ran its whole traverse before the pin could catch it and
         then sat at 100 % while the section scrolled past unpinned. The four
         specimens travelled where nobody was looking, which is the same failure
         ShelfTransport.tsx documents against Field Notes, arriving from a new
         direction. It predates the lead-in; the lead-in is only what made it
         visible.

         A MICROTASK, NOT requestAnimationFrame. It has to run after React has
         committed every sibling effect — otherwise Rack, which mounts after this
         one, is refreshed before it exists — and rAF does not run in a tab that
         is not being composited, which is the trap FxProvider names in full.
         Only when a pin was actually created: with no spacer there is nothing
         below to correct. */
      if (passt) {
        queueMicrotask(() => ScrollTrigger.refresh());
      }

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(ALLE, { clearProps: "opacity,transform" });
        if (bar) delete bar.dataset.chromeOff;
      };
    });
  }, {});

  return null;
}
