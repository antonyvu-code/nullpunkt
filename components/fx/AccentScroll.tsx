"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useFx } from "@/components/fx/FxProvider";

/**
 * FX.01 — the scroll wheel as the tuning dial, and FX.05 — the notes as a
 * continuous sweep rather than twelve stations.
 *
 * The site's one original idea is that it owns no colour: --accent is borrowed
 * from whatever work you point at. Until now "point at" meant the pointer, which
 * quietly meant desktop — on a phone there is no hover, so the entire signature
 * was invisible to a third of the people the page is for. Driving the same
 * borrow from scroll position fixes that and costs nothing: the work already
 * carries its colour, this only reads it at a different moment.
 *
 * One trigger, not one per card. Per-element triggers fight over a two-up shelf,
 * where both cards cross the line in the same frame and the winner is whichever
 * ScrollTrigger happened to be created last. Nearest-centre-to-the-line is
 * deterministic and reads the way the eye does.
 */

const MARK = "[data-accent]";
/** Where the page is measured. Slightly above centre: it is roughly where the
 *  eye sits while scrolling, and it puts a card on the dial a beat before it is
 *  fully in view. */
const LINE = 0.55;

const rgb = (hex: string): [number, number, number] => {
  const h = hex.trim().replace("#", "");
  const f =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) || 0) as [number, number, number];
};

const mix = (a: string, b: string, t: number) => {
  const [ar, ag, ab] = rgb(a);
  const [br, bg, bb] = rgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `#${[c(ar, br), c(ag, bg), c(ab, bb)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
};

export default function AccentScroll() {
  const tuned = useFx("accent-scroll");
  const sweeping = useFx("notes-sweep");
  const carrying = useFx("shelf-transport");
  const pathname = usePathname();

  useGSAP(
    () => {
      if (!tuned && !sweeping) return;
      gsap.registerPlugin(ScrollTrigger);

      const root = document.documentElement;
      const set = (hex: string) => root.style.setProperty("--accent", hex);

      /* The site's controlling variable — see the note in globals.css. This
         component is the only writer, because it is already the only thing on
         the page doing the measurement that answers it; anything else wanting
         the reading must take it from here rather than measure again and drift.
         Three decimals: the value is consumed inside calc() on a colour channel,
         where more precision buys nothing an eye can find. */
      const deflect = (v: number) => root.style.setProperty("--deflection", v.toFixed(3));

      /* Which card the page is currently reading, marked in the DOM so CSS can
         act on it — this is how a plate develops on a phone, where there is no
         hover to do it (see [data-probed] in globals.css, which is also where
         the decision to ignore this on pointer devices lives).
         Guarded on identity: apply() runs on every scroll update and, while the
         carriage is on screen, on every tick. Writing the same attribute onto
         the same element sixty times a second would invalidate style for a
         value that did not change. */
      let probed: HTMLElement | null = null;
      const probe = (el: HTMLElement | null) => {
        if (probed === el) return;
        probed?.removeAttribute("data-probed");
        el?.setAttribute("data-probed", "");
        probed = el;
      };

      /* The colour the page wears with nothing on the dial — read at apply time,
         not at mount. This component sits above <main> in the tree, so its effect
         runs BEFORE the page's own AccentSetter: reading --accent here on mount
         returned the stylesheet default, ink, and the whole lower half of the
         page (hood, about, contact) went colourless the moment you scrolled past
         the last card. --accent-rest is written only by AccentSetter, so asking
         for it later gets the real answer. */
      const rest = () =>
        getComputedStyle(root).getPropertyValue("--accent-rest").trim() ||
        getComputedStyle(root).getPropertyValue("--accent").trim() ||
        "#f2f0eb";

      const notes = document.querySelector<HTMLElement>("#field-notes");
      const noteMarks = notes ? gsap.utils.toArray<HTMLElement>(MARK, notes) : [];
      const stops = noteMarks.map((el) => el.dataset.accent || rest());

      /* The carriage (FX.03). Its cards are deliberately NOT removed from the
         station list below: away from the pinned run they are ordinary marks and
         should be measured like any other, and the branch in apply() returns
         before the list is ever consulted for the stretch where they are not.
         Leaving them in is also what keeps the phone correct, where the layout
         never becomes a track at all. */
      const carriage = carrying ? document.querySelector<HTMLElement>("[data-transport]") : null;
      const carriageMarks = carriage ? gsap.utils.toArray<HTMLElement>(MARK, carriage) : [];
      /* Read at apply time, not now: these are the same two conditions the
         stylesheet gates the carriage layout on, and a window that is resized
         across the breakpoint must change the measurement with it. */
      const breit = window.matchMedia("(min-width: 768px)");
      const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)");
      // With the sweep on, the notes are handled as one continuous run, so they
      // must not also compete as individual stations.
      const marks = tuned
        ? gsap.utils
            .toArray<HTMLElement>(MARK)
            .filter((el) => !(sweeping && notes && notes.contains(el)))
        : [];

      if (marks.length === 0 && !(sweeping && stops.length > 1)) return;

      const apply = () => {
        const line = window.innerHeight * LINE;

        /* The carriage owns the dial while it is under the head — the same rule
           the sweep follows below, that a section which has taken over the
           screen also takes over the borrow. The measurement, though, turns
           ninety degrees: the head is fixed at the middle of the window and the
           stock travels past it, so what the page is pointing at is whichever
           card's centre is nearest that VERTICAL line. Measured the usual way
           the effect would be dead here — a pinned shelf puts every card at the
           same height, "nearest to the horizontal line" stops discriminating,
           and the borrow would sit on whichever card the DOM happens to list
           first for the whole run. This is also the pointer-free probe the
           accent idea has been missing on touch. */
        if (tuned && carriage && carriageMarks.length > 0 && breit.matches && !ruhig.matches) {
          const r = carriage.getBoundingClientRect();
          if (r.top <= line && r.bottom >= line) {
            const head = window.innerWidth / 2;
            let unter: HTMLElement | null = null;
            let nah = Infinity;
            for (const el of carriageMarks) {
              const cr = el.getBoundingClientRect();
              const d = Math.abs(cr.left + cr.width / 2 - head);
              if (d < nah) {
                nah = d;
                unter = el;
              }
            }
            /* Full scale, and not as an approximation: a pinned carriage has
               put a specimen under the head and is holding it there. There is
               no "nearly" to express. */
            deflect(1);
            probe(unter);
            set(unter?.dataset.accent || rest());
            return;
          }
        }

        // The sweep owns the dial for as long as the notes straddle the line.
        if (sweeping && notes && stops.length > 1) {
          const r = notes.getBoundingClientRect();
          if (r.top <= line && r.bottom >= line) {
            const p = gsap.utils.clamp(0, 0.9999, (line - r.top) / r.height);
            const span = p * (stops.length - 1);
            const i = Math.floor(span);
            /* Same reasoning as the carriage: the notes have taken the screen,
               so the dial is fully deflected for the whole run. What varies
               inside the sweep is the hue, not how hard the page is reading. */
            deflect(1);
            /* The notes are a list of readings, not specimens — nothing in here
               carries a plate to develop, so the probe is parked rather than
               left pointing at whatever the last card was. */
            probe(null);
            set(mix(stops[i], stops[i + 1], span - i));
            return;
          }
        }

        if (marks.length === 0) {
          deflect(0);
          probe(null);
          set(rest());
          return;
        }

        let best: HTMLElement | null = null;
        let bestDist = Infinity;
        for (const el of marks) {
          const r = el.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - line);
          if (d < bestDist) {
            bestDist = d;
            best = el;
          }
        }
        /* Nothing near the line — the hero and the contact block have no work in
           them, and inventing a colour for them would be the page lying about
           where its colour comes from.

           REACH is the old cutoff, unchanged: past it the needle is at zero.
           What is new is FULL, and the gap between the two. The cutoff on its
           own was a step — the instrument read either nothing or everything,
           with the whole hero and the whole contact block on the far side of a
           single frame's worth of scroll. Ramping across the gap is what makes
           it a needle rather than a switch. FULL sits well clear of the line so
           that anything actually being looked at still reads full scale: the
           ramp lives in the empty stretches, and nowhere that already had a
           colour loses any of it. */
        const FULL = window.innerHeight * 0.25;
        const REACH = window.innerHeight * 0.9;
        const defl = gsap.utils.clamp(0, 1, (REACH - bestDist) / (REACH - FULL));
        deflect(defl);
        /* Off the ramp entirely means the page is reading nothing, and a plate
           left developed there would claim a specimen is under the probe when
           the needle is sitting on zero. */
        probe(defl === 0 ? null : best);
        set(defl === 0 ? rest() : best?.dataset.accent || rest());
      };

      const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: apply, onRefresh: apply });
      apply();

      /* The carriage is the one station that keeps moving after the scroll that
         moved it: its cards ride a scrubbed tween, which goes on easing for as
         long as the scrub asks once the wheel has stopped. Reading the dial on
         scroll alone therefore leaves it one card behind at the end of the run —
         measured, the page still wore card 03's orange with card 04 sitting
         squarely on the head. While the carriage is on screen the dial is read
         on the ticker instead, which is the same clock the cards move on.
         One rect per frame to decide whether to look; the full measurement only
         happens for the stretch where the carriage actually holds the screen. */
      let ticking: (() => void) | null = null;
      if (carriage) {
        ticking = () => {
          const r = carriage.getBoundingClientRect();
          const line = window.innerHeight * LINE;
          if (r.top <= line && r.bottom >= line) apply();
        };
        gsap.ticker.add(ticking);
      }

      return () => {
        if (ticking) gsap.ticker.remove(ticking);
        st.kill();
        set(rest());
        /* Back to zero, or the plate stays lit after the only thing that could
           dim it has gone — the switch would look broken in exactly the way the
           bench exists to rule out. */
        deflect(0);
        probe(null);
      };
    },
    // revertOnUpdate is not optional here. useGSAP only reverts on unmount by
    // default, so flipping a switch off left the old context — triggers, inline
    // transforms and all — running underneath a re-run that had already decided
    // to do nothing. The bench would have shown every effect as permanent.
    { dependencies: [tuned, sweeping, carrying, pathname], revertOnUpdate: true },
  );

  return null;
}
