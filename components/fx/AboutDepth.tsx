"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { usePathname } from "next/navigation";
import { useFx } from "@/components/fx/FxProvider";
import { useLang } from "@/components/Lang";

/**
 * FX.08 — About is a volume, not a stack of blocks.
 *
 * S.06 is the one section on this page whose argument IS its typography: a
 * claim set large and narrowed, the evidence held at a reading measure, the
 * promise pulled back up in accent. Three settings, one after the other, and
 * until now they were three tall blocks the reader scrolled past. Here the
 * frame is held for the length of the argument and the three settings travel
 * THROUGH it — each one comes up out of the far end of the volume, stands
 * still at the plane of the page to be read, and passes the reader as the next
 * one arrives.
 *
 * WHY THIS SECTION AND NO OTHER. The hero already places its copy in a volume:
 * the eye travels forward through the plate stack and every part of the title
 * block comes up to size out of the middle of it (HeroIntro.tsx). That is the
 * page's one spatial idea, and it was spent on one screen. About is the only
 * other place that argues with type alone, so it is the only other place that
 * earns the same room. The gesture is deliberately NOT the hero's, though: the
 * hero assembles one plate out of the volume, this one carries the reader
 * through three. Same space, different journey.
 *
 * REAL PERSPECTIVE, NOT A SCALE TWEEN. The distance is `z` against a
 * `perspective` on the frame (globals.css, FX.08), so the projection is the
 * browser's and every beat is foreshortened the way something actually far
 * away is. Scaling a block from 0.5 to 1.5 gets to the same numbers and reads
 * as a block being resized — which is the difference between depth and a zoom.
 *
 * SCRUBBED, NOT TRIGGERED — the rule Rack.tsx and HeroIntro.tsx both state.
 * The wheel IS the eye's speed through the volume; rolling back up carries the
 * reader back out past the sentences they came through, rather than leaving a
 * spent animation standing.
 *
 * OPACITY, NEVER autoAlpha. Two of the three beats are transparent at any
 * moment and every one of them stays in the document and in the accessibility
 * tree — including the CV links, which live in the third. `visibility: hidden`
 * would take a screen reader's About section down to a third of itself, on a
 * page that prints WCAG 2.1 AA in its own capability list. What that costs is
 * the focus problem the shelf documents, and it is answered the same way, at
 * the foot of this file.
 */

/* ——— THE SCORE, in timeline units ——————————————————————————————————————
   Inside a scrub these are not durations, they are POSITIONS along the run —
   the sequence, not a delay. They are constants rather than literals in the
   tweens because the focus map at the bottom has to land a beat exactly where
   the score puts it; two hand-kept copies of the same number is how a keyboard
   reader ends up half a beat off the sentence they tabbed to. */
const AN = 0.6; // the far end → the plane
const HALT = 0.45; // held still at the plane, to be read
const AB = 0.45; // the plane → past the reader
/** Start to start. AN + HALT, which is what makes the one rule of this score
 *  true: a beat begins leaving in the same frame the next one begins arriving.
 *  The departure is the shorter move, so the outgoing sentence has cleared
 *  while the incoming one is still three quarters of the way down the volume —
 *  the two are never both legible, which is the whole risk of a cross-fade
 *  between two pieces of running text. */
const TAKT = AN + HALT;
/** A beat of run left after the last beat lands. The scrub trails the wheel by
 *  0.6s, so without this the promise is still coming up in the frame the pin
 *  lets go — the page would start moving while the argument is not finished.
 *  Same hold, same reason, as the one at the foot of Rack.tsx. */
const NACHLAUF = 0.4;

/* ——— THE VOLUME, in px of z ——————————————————————————————————————————
   Against the 1100px perspective in globals.css: −1150 projects to half size,
   +380 to one and a half. Far enough that a waiting beat reads as far away and
   not as small type; near enough that a departing one passes the reader
   without the glyphs tearing. */
const FERN = -1150;
const NAH = 380;
/** Where the FIRST beat starts, and it is not FERN. The pin engages when the
 *  frame reaches the top of the window — so whatever the first beat is doing at
 *  progress 0 is what the reader sees WHILE the frame is still rising into
 *  place. Parked at the far end that is an empty screen scrolling up under a
 *  section heading, which is the "section that failed to load" the FX.03
 *  lead-in note names. It stands at −260 instead: on screen from the first
 *  frame, set back and undeveloped, and the opening of the run brings it up to
 *  size. 0.81 of full size at this perspective — the same setback the hero
 *  gives its own copy, and that is not a coincidence, it is the same volume. */
const ANSATZ = -260;

/* ——— THE TWO HAND-OFFS, AND THEY ARE NOT ONE HAND-OFF TWICE ——————————
   Added 18.08.2026 on Antony's call, and the shape of the ask is worth writing
   down because it constrains this hard: he did NOT ask for three different
   gestures. The journey stays the one journey — every beat still comes up out
   of the far end, stands at the plane, and passes — and what differs is the
   HAND-OFF, the moment one sentence gives the frame to the next. There are
   exactly two of those on a three-beat score, and they were identical.

   NOTHING HERE TOUCHES THE SCORE. Same AN, HALT, AB, same TAKT, so `mitte()`
   still returns the position it did and the keyboard focus map at the foot of
   this file still lands a beat exactly where the wheel would. That is the whole
   reason the difference is expressed as *how far* and *in what order* a beat
   leaves, rather than as *when* — a hand-off that changed the clock would be a
   second copy of the score to keep in step, which the note above TAKT already
   calls the way a keyboard reader ends up half a beat off.

   ONE · THE CLAIM IS PULLED BACK IN. Its lines retreat as it goes, LAST LINE
   FIRST — the sentence unwrites itself into the depth in the reverse of the
   order it wrote itself out in, while the evidence is writing itself out below.
   Two writings crossing, running opposite ways.

   TWO · THE EVIDENCE IS LIFTED OFF WHOLE. No line move at all: it leaves as one
   rigid plate and goes further, so the frame is emptied cleanly and the promise
   — the one beat that never departs — arrives into a frame nothing is still
   leaving. The argument's last step gets the cleanest air.

   Both stay inside AB, so neither outgoing sentence is legible any longer than
   before. That mattered: the note on TAKT names a cross-fade between two pieces
   of running text as the risk this whole score is arranged to avoid, and a
   hand-off that lingers is exactly how it would come back. */
const NAH_WEIT = 620;
const ZEILE_AB = -260;
const ABGANG = [
  { z: NAH, zeilenRueckwaerts: true },
  { z: NAH_WEIT, zeilenRueckwaerts: false },
] as const;
/** The hand-off leaving beat i. The last beat never departs, so this is only
 *  ever asked for i < beats.length - 1; clamped anyway, because a fourth beat
 *  added to page.tsx should get the last hand-off rather than a crash. */
const abgang = (i: number) => ABGANG[Math.min(i, ABGANG.length - 1)];

/* ——— AND THE LINES ON THE PLATE ————————————————————————————————————————
   The beat is the plate; these are the lines set on it. Each starts a little
   further back than the plate it rides and lands a little later than the one
   above it, so the sentence writes itself out of the depth rather than sliding
   in as one rigid block.
   ZEILE_AN + ZEILE_SPUR = AN exactly: the last line finishes settling in the
   same frame the plate reaches the plane, so a reader never begins on a
   sentence that is still assembling. Change one and change the other. */
const ZEILE_FERN = -420;
const ZEILE_AN = 0.38;
const ZEILE_SPUR = AN - ZEILE_AN;

/** Total length of the score for n beats. */
const dauer = (n: number) => (n - 1) * TAKT + AN + HALT + NACHLAUF;

/** Where in the run beat i stands at the plane, as a fraction of the whole. */
const mitte = (i: number, n: number) => (i * TAKT + AN + HALT / 2) / dauer(n);

/** The pin's run, written once: three ScrollTriggers share this range and a
 *  second copy of the number is a second effect waiting to drift off the
 *  first. See the note at the trigger for where 185 comes from. */
const LAUF = "+=185%";

export default function AboutDepth() {
  const on = useFx("about-depth");
  /* Read for its CHANGES, not its value — nothing here renders. A language
     switch replaces the seam spans (components/Lang.tsx), so every SplitText
     built on the old ones has to be built again on the new ones. */
  const { lang } = useLang();
  const pathname = usePathname();

  useGSAP(
    () => {
      if (!on) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);

      const stack = document.querySelector<HTMLElement>("[data-about-stack]");
      if (!stack) return;
      const beats = gsap.utils.toArray<HTMLElement>("[data-about-beat]", stack);
      if (beats.length === 0) return;
      /* The three sentences themselves. The beats are the boxes that travel;
         these are what develops from --muted-dim to --ink inside them, and the
         third beat carries other things (a label, the CV links) that are not
         part of that. */
      const saetze = gsap.utils.toArray<HTMLElement>("[data-satz]", stack);

      /* gsap.matchMedia rather than a test at mount, for the reason FX.03
         states at length: this drives a CSS layout that can change underneath
         it, and a reader who asks for less motion mid-session has to get the
         plain page back, not a pin nobody is driving.
         No width condition. Every other pinned effect on this page has one
         because it lays something out sideways; this frame is a single centred
         column of type at every width, and a phone is where a held frame reads
         best of all. */
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* ——— THE LAYOUT SWITCH IS WRITTEN HERE, and that is the opposite of
           what ShelfTransport does — worth the difference in writing, since the
           two now sit on the same page doing the same kind of thing.

           FX.03's layout is gated on <html data-fx> because its driver MEASURES
           that layout: the traverse is the laid-out width of the track, so the
           stylesheet has to have run before the driver reads it, which means
           the attribute has to ship in the server HTML. Nothing here is
           measured — the beats travel between two constant z positions — so
           this switch can be owned by the one thing that also knows whether
           anything is actually driving it.

           Which matters, because of what the two layouts are. The plain one is
           three sentences down the page; the stacked one is three sentences ON
           TOP OF EACH OTHER, legible only while something is moving them apart
           in depth. Gated in CSS, a reader with JavaScript off — or any reader
           at all, for the beat before the bundle lands — would get that pile.
           The page without its driver has to be the page, not a broken version
           of the effect. useGSAP writes this inside a layout effect, so the
           flat layout is never painted either. */
        stack.dataset.aboutStack = "on";

        const letzte = beats.length - 1;
        const gesamt = dauer(beats.length);

        /* What the line layer is currently made of, per beat. Not const: every
           re-split throws the line elements away and builds new ones, so
           anything holding them has to be re-pointed rather than remembered. */
        const zeilenZiele: HTMLElement[][] = [];
        const zeilenSaetze: HTMLElement[][] = [];
        const parkZeilen = (i: number) => {
          if (zeilenZiele[i]) gsap.set(zeilenZiele[i], { z: ZEILE_FERN });
          if (zeilenSaetze[i]) gsap.set(zeilenSaetze[i], { backgroundSize: "16% 16%" });
        };

        /* PARK ON EVERY REFRESH, for the reason Rack.tsx documents: until a
           tween has begun, an element renders at its stylesheet state — and the
           stylesheet state of this frame is all three sentences stacked in one
           cell at full opacity. */
        const park = () => {
          beats.forEach((el, i) => {
            gsap.set(el, { z: i === 0 ? ANSATZ : FERN, opacity: i === 0 ? 1 : 0 });
            parkZeilen(i);
          });
          /* The unsplit case only. Once a beat is split the field lives on its
             lines (globals.css) and the line layer parks itself — but between
             mount and the first split, and in any browser where SplitText
             cannot measure lines, this is what keeps the sweep from standing at
             full development. */
          gsap.set(saetze, { backgroundSize: "16% 16%" });
        };
        park();

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stack,
            /* The frame is exactly one screen (globals.css gives every beat
               100svh), so the top of it at the top of the window IS the frame
               filling the window. */
            /* BELOW THE FIXED BAR, not behind it. `top top` put the frame's top
               edge at the window's top edge, which is where the header already
               is — so a frame that is "exactly one screen" was one screen inside
               a screen that has 57px of chrome across it, and the beats centred
               in a box whose top the reader cannot see. Same correction, same
               measurement, as the shelf's pin (OFFEN §21); the beats' own
               min-height subtracts the same --kopf so the frame and its contents
               agree about how tall a screen is. */
            start: () =>
              "top top+=" +
              Math.round(document.querySelector("[data-chrome]")?.getBoundingClientRect().height ?? 0),
            /* 185 % of the frame — and the frame is a screen, so this is
               185 % of the window either way the percentage is read.
               Where the number comes from: the three beats were 92 + 80 + 80 =
               252svh of document before this, and they are 100svh of frame plus
               this run after it. 185 keeps the section within about a tenth of
               the scroll it already cost, which is the constraint the beats'
               own note in page.tsx sets out — this page's measured problem is
               that its length is bought with motion rather than content, and an
               effect that holds the reader still has no business also making
               them scroll further. It buys roughly half a screen of wheel per
               beat, which is the pace the shortest of them can be read at. */
            end: LAUF,
            pin: true,
            /* TRANSFORM, NOT position: fixed. ShelfTransport.tsx measured this
               one: a default pin switches the element to position: fixed at
               both ends of the run and the layout-shift observer scores the box
               vanishing and reappearing against the full viewport — 98.7 % of
               the site's entire CLS came from one such pin. Transform pinning
               keeps the element in flow and translates it, and transforms are
               excluded from layout shift by definition.
               What it costs there is what it costs here: the pinned element
               carries a transform and is therefore the containing block for any
               position: fixed descendant. Checked — nothing inside About is
               fixed; the header and the progress rule are siblings of #main. */
            pinType: "transform",
            anticipatePin: 1,
            /* The same 0.6 the hero's copy travels on. Two volumes on one page
               that lag the wheel by different amounts would be two different
               spaces. */
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefresh: park,
            /* THE DEFAULT, AND STATED. The other three pins on this page carry
               3 (hero), 2 (shelf) and 1 (rack) so that each is measured before
               the ones below it — a pin inserts a spacer as tall as its run and
               moves everything under it down the document. This is the lowest
               pin on the page: everything that can move it is above it, so it
               has to be measured LAST, which is what 0 means. Written out
               because an unexplained absence here reads as an oversight. */
            refreshPriority: 0,
          },
        });

        const splits: SplitText[] = [];

        beats.forEach((el, i) => {
          const t = i * TAKT;

          /* ease "none", and it is the only honest ease for this move. The
             reader's wheel is the speed the eye travels at; easing the distance
             would put a hand on the volume that the reader can feel but cannot
             account for. Rack and the hero ease because things are ARRIVING at
             a place; nothing arrives here, it passes. */
          tl.to(el, { z: 0, opacity: 1, duration: AN, ease: "none" }, t);

          /* The last beat does not leave. It carries the promise and the two CV
             links under it, it is the last thing the section says, and the pin
             lets go with it standing at the plane — so the reader scrolls on
             from a finished statement rather than watching the argument fly
             past their head. */
          if (i !== letzte) {
            tl.to(el, { z: abgang(i).z, opacity: 0, duration: AB, ease: "none" }, t + AN + HALT);
          }

          /* ——— THE LINE LAYER ——————————————————————————————————————————
             The plate carries the beat through the volume; this carries the
             LINES across the plate, each from a little further back and a
             little later than the one above it.

             A CHILD OF THE MASTER TIMELINE, NOT ITS OWN SCROLLTRIGGER, and that
             is the second version of this file. The first gave each beat's
             lines a trigger of their own on the same element and the same
             `start: "top top" / end: LAUF` expression — the shape
             ShelfTransport.tsx uses for its parallax layer, and it does not
             carry over, because there NEITHER trigger is created against an
             element that is ALREADY PINNED. Here the pin exists by the time
             SplitText runs, so a trigger measuring the same element measured it
             where the pin leaves it, not where it starts. Measured on a phone
             viewport: the master ran from 10068 to about 10630 while the lines
             did not begin until 11500 — a full run late, three sentences
             arriving as flat plates and then assembling themselves a screen
             after nobody was looking at them any more.

             As a child there is no second measurement to disagree: the lines
             sit on the master's own clock, at the same positions the plates do.
             `autoSplit` still owns the lifecycle — GSAP reverts whatever onSplit
             returned before re-splitting, and reverting a child timeline takes
             it out of its parent, so the next onSplit adds a fresh one at the
             same position. The pin is never rebuilt.

             tag "span": the seam this splits inside is an inline span (see
             components/Lang.tsx), and divs inside a span is invalid nesting.
             globals.css makes the line a block. */
          const naht = el.querySelector<HTMLElement>("[data-satz-text]");
          if (!naht) return;
          const satz = naht.closest<HTMLElement>("[data-satz]");

          splits.push(
            SplitText.create(naht, {
              type: "lines",
              tag: "span",
              linesClass: "np-zeile",
              autoSplit: true,
              onSplit: (self) => {
                /* Written here rather than in the markup because it is only
                   true once the split has actually happened — globals.css hands
                   the development field from the block down to the lines on
                   exactly this attribute, and doing it a frame early is a frame
                   of transparent glyphs with nothing clipped to them. */
                if (satz) satz.dataset.satzGeteilt = "";

                /* Everything on the plate, in reading order — for the promise
                   that is the label above the sentence and the two documents
                   below it as well, because a beat that assembles line by line
                   around a rigid label and a rigid list is a beat that assembles
                   in two different ways at once.
                   The development staggers over the LINES only, so on the third
                   beat the two spreads are distributed over different counts.
                   Measured at a few frames of difference at the crossing; the
                   alternative is a label that develops, which is not a thing the
                   page does to its instrument type. */
                const ziele: HTMLElement[] = [];
                el.querySelectorAll<HTMLElement>(":scope > *, .np-zeile").forEach((n) => {
                  if (!n.contains(naht) || n.classList.contains("np-zeile")) ziele.push(n);
                });

                /* Handed to park() so a refresh re-states the line layer the
                   same way it re-states the plates — and REPLACED, not appended
                   to, because a re-split leaves the previous split's elements
                   detached and parking a detached element is work spent on
                   nothing. */
                zeilenZiele[i] = ziele;
                zeilenSaetze[i] = self.lines as HTMLElement[];
                parkZeilen(i);

                const ztl = gsap.timeline();

                ztl.to(
                  ziele,
                  {
                    z: 0,
                    duration: ZEILE_AN,
                    ease: "power2.out",
                    /* amount, not a per-target delay: the spread is fixed at
                       ZEILE_SPUR however many lines the sentence breaks into,
                       so a beat that wraps to nine lines on a phone lands in
                       the same stretch of run as one that wraps to three. */
                    stagger: { amount: ZEILE_SPUR },
                  },
                  t,
                );

                /* THE DEVELOPMENT, taken off the CSS scroll timeline and put
                   here — see globals.css for why view() cannot survive a pin,
                   and why the field sits on the line rather than on the block.
                   It is the same two-tone sweep, driven by distance instead of
                   by the window: a line is undeveloped exactly as long as it is
                   far away, and is finished by the time it stands still.
                   Eased where the travel is not, because this one IS an arrival
                   — the tone should be there before the movement stops, not
                   still resolving under a line already being read. */
                ztl.to(
                  self.lines,
                  {
                    backgroundSize: "320% 320%",
                    duration: ZEILE_AN,
                    ease: "power2.out",
                    stagger: { amount: ZEILE_SPUR },
                  },
                  t,
                );

                /* ——— AND THE FIRST HAND-OFF UNWRITES THE SENTENCE ————————
                   Only where the score says so (see ABGANG at the head of this
                   file). `from: "end"` is the whole gesture: the last line
                   retreats first, so the claim goes back into the depth in the
                   reverse of the order it came out of it.
                   Inside AB and inside the plate's own fade, so it adds no time
                   and cannot leave an outgoing line legible for longer.
                   ease "none" for the same reason the plate's travel is: this
                   is a departure, not an arrival, and nothing is landing. */
                if (i !== letzte && abgang(i).zeilenRueckwaerts) {
                  ztl.to(
                    ziele,
                    {
                      z: ZEILE_AB,
                      duration: AB,
                      ease: "none",
                      stagger: { amount: AB * 0.55, from: "end" },
                    },
                    t + AN + HALT,
                  );
                }

                /* Position 0 — the tweens inside already carry their own `t`,
                   which is the master's clock. A child added at anything else
                   would shift the whole beat's lines off the plate they belong
                   to. */
                tl.add(ztl, 0);

                return ztl;
              },
            }),
          );
        });

        /* An empty tween that owns NACHLAUF, so the timeline is as long as the
           score says it is rather than ending on the last real move. */
        tl.to({}, { duration: NACHLAUF }, gesamt - NACHLAUF);

        const st = tl.scrollTrigger;

        /* ——— KEYBOARD ACCESS, which is where this pattern breaks ————————
           Two of the three beats are at opacity 0 at any moment and all of them
           are focusable — the third holds the CV links. Tabbing to a link the
           reader cannot see leaves the browser to scroll it into view, and the
           only axis it can scroll is the one the pin has taken away: it fights
           the pin and lands nowhere.
           Translating a beat's position in the SCORE back into a scroll
           position and going there directly means Tab travels the volume the
           same way the wheel does. Same instrument, same reasoning, as the
           focusin listener in ShelfTransport.tsx — that one maps a card's place
           along a track, this one maps a sentence's place along a run. */
        const zeigen = (e: FocusEvent) => {
          if (!st) return;
          const beat = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-about-beat]");
          if (!beat) return;
          const i = beats.indexOf(beat);
          if (i < 0) return;
          const y = st.start + (st.end - st.start) * mitte(i, beats.length);
          // Lenis owns the scroll position while it is running; telling the
          // window instead would be overwritten on its next frame.
          const lenis = (window as unknown as { lenis?: { scrollTo: (v: number, o?: object) => void } })
            .lenis;
          if (lenis) lenis.scrollTo(y, { immediate: true });
          else window.scrollTo({ top: y, behavior: "auto" });
        };
        stack.addEventListener("focusin", zeigen);

        return () => {
          stack.removeEventListener("focusin", zeigen);
          tl.scrollTrigger?.kill();
          tl.kill();
          /* Reverting a SplitText restores the seam span's original innerHTML
             AND kills the line timeline it returned from onSplit — one call for
             both, which is the reason the line layer is built in there rather
             than beside it. The attribute has to go with it: left standing, the
             stylesheet would keep the development field on lines that no longer
             exist and take it off the block that has the text back. */
          splits.forEach((s) => s.revert());
          saetze.forEach((s) => delete s.dataset.satzGeteilt);
          gsap.set(beats, { clearProps: "transform,opacity,willChange" });
          /* Handing the sweep back to the stylesheet: with the inline size gone
             and the attribute below removed, np-entwickeln runs on view() again
             exactly as it does with this switch off. */
          gsap.set(saetze, { clearProps: "backgroundSize" });
          /* BACK TO EMPTY, NOT DELETED. `delete` was the obvious way to write
             this and it takes the markup's own hook with it: [data-about-stack]
             ships empty in the server HTML and is what this effect finds itself
             by, so removing it made the switch one-way — turned off, the frame
             could never be found again and turning it back on did nothing at
             all. Measured in the panel. The attribute is the anchor; only its
             VALUE is the switch. */
          stack.dataset.aboutStack = "";
        };
      });

      return () => mm.revert();
    },
    { dependencies: [on, pathname, lang], revertOnUpdate: true },
  );

  return null;
}
