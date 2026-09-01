"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroRunway } from "@/lib/hero";
import { FRAME_MS } from "@/lib/motion";

/**
 * DER PASSER — the hero's material.
 *
 * SIGNATURE-STYLE.md registered `Der Passer` as this project's bespoke element
 * and `--passer` as its one controlling variable long before anything was built.
 * Eight hero candidates were sketched over 08.–09.08.2026 (`portfolio-concepts/
 * nullpunkt-material-studies*.html`) and the search came back to the entry that
 * was already written down. This is that entry, built.
 *
 * WHAT IT IS. Three printing plates made of particles, each sitting at its own
 * depth in a volume. At the top of the page they coincide EXACTLY — same x, same
 * y, same z — and the three additive colours sum back to something near --ink.
 * That coincidence is the zero point the site is named after, and it is a picture
 * rather than a claim: nothing needs explaining for a reader to see that this is
 * the state where everything lines up. Scroll pulls the plates apart along all
 * three axes at once. The viewing plane advances into the stack, and whichever
 * plate leaves the focal plane swells into a soft disc — losing register IS
 * losing focus, which is the one sentence this material exists to say.
 *
 * THE PLATES DO NOT ROTATE. Real misregistration on a press is a slip and a
 * fraction of a degree, not a skew. An earlier build rotated each plate by up to
 * 23° and read as a rendering fault rather than as a printing fault.
 *
 * WHY THE GRAIN IS PARTICLES AND NOT A HALFTONE GRID. A dot drawn at its cell is
 * a spreadsheet. Here the cell is not where a dot is DRAWN, it is where a dot
 * WANTS to be: every particle carries its own spring constant, so the swarm
 * settles out of step with itself, and that is the whole difference between a
 * material that is alive and one that is merely rendered. It is also why the
 * particles are not a particle field: they are governed by a raster that means
 * something, so the beauty belongs to the register, not to the dots.
 *
 * WHY CANVAS 2D AND NOT THREE.JS. P3 in the craft floor budgets 500KB for the
 * first load and this page already ships 703KB. Three.js would add ~170KB gzip
 * to the one screen that has to be right in 50ms. A cached radial sprite blitted
 * with `lighter` buys the same soft additive grain for nothing. The WebGPU/TSL
 * version belongs behind a case URL, where the reader has already chosen to pay
 * for it.
 *
 * THE MASK WAITS FOR THE FONT. `document.fonts.ready` first, always: the mask is
 * cut from the page's display face (Fira Sans since 13.08.2026, read from
 * --font-fira-sans rather than named here) and next/font resolves after first
 * paint, so building it eagerly rasterises the fallback face and the whole
 * material is cut from the wrong letterforms — silently, because it still looks
 * like a word.
 *
 * Reduced motion gets the composed frame: the plates slightly apart with the
 * swarm already settled, which is a picture of the material. The registered
 * state would be the calmer choice and the wrong one — it hides the only thing
 * the material is about.
 */

/** The three plates. `zk` is the depth rank, `dir` the direction each one slips.
 *
 * THE COLOURS ARE A PROCESS SET THAT SUMS TO --INK, and that replaced a
 * hand-picked orange / cyan / near-white triad on 10.08.2026. The old set had one
 * plate at (244,242,236) — full ink — so that plate ALONE drew the whole word:
 * register was not a coincidence of three things, it was one white word with two
 * coloured plates washing over it, and the additive sum at the zero point ran far
 * past white and blew out. Nothing to see at the exact moment the site is named
 * after, and a milky word everywhere else.
 *
 * These three sum to exactly (242,240,235) = --ink. In register the word is
 * therefore the page's own ink on the page's own black, at full contrast and
 * nothing on top of it; off register it separates into cyan, magenta and yellow —
 * the language a press actually misregisters in. Konvergenz.tsx separates --ink
 * the other way, into R/G/B, because a screen adds light and a title is drawn by
 * one; the material is a PLATE, so it comes apart in process colours. Two
 * separations, one ink, each in the medium it belongs to.
 */
const PLATES = [
  { col: [0, 120, 118] as const, dir: 0, zk: 1 },
  { col: [121, 0, 117] as const, dir: (Math.PI * 2) / 3, zk: -1 },
  { col: [121, 120, 0] as const, dir: (Math.PI * 4) / 3, zk: 0 },
];

/** Where the word sits in the frame. 0.45, and it was 0.40 for the first builds
 *  — high enough to leave the hero copy the lower half, which was the right
 *  answer while the copy was bottom-anchored and filling that half from the
 *  first frame. It is not the answer now: the copy is centred and does not
 *  arrive until the reader scrolls, so the opening frame is the word ALONE in
 *  the window, and alone at 0.40 it sits 72px above the middle of a screen that
 *  has nothing else in it to balance against. Still above centre — a mark at
 *  the exact middle reads as low, which is why optical centring exists — but by
 *  36px rather than 72. */
const WORD_Y = 0.45;

/* ——— THE VOLUME, AND WHY THE EYE NOW TRAVELS THROUGH IT ————————————————
   The plates were laid out in depth from the first build and the reader never
   felt it, for one reason that is arithmetic rather than taste: with REF = 1 the
   projection sc = M0·REF/(REF+d) is bounded by M0 itself. Whatever the viewing
   plane did, the material could never be magnified past 1.9×, and it only ever
   used 0.97 → 1.22 of that. A page cannot show depth it has capped at a quarter
   of a doubling — the plates were AT different depths and nothing MOVED through
   them.

   REF is the focal length of this pinhole, and shortening it is what gives the
   volume a near field. At 0.32 the same travel spans 0.475 → 1.74, about 3.7×,
   and the three plates now arrive at that magnification at visibly different
   times: the near one rushes the frame while the far one is still gathering. The
   eye is passing THROUGH a stack, which is what a stack is for.

   AND THE REST FRAME IS UNCHANGED. A shorter focal length makes everything at
   rest smaller — the word would have opened the page at a third of its size,
   which is the one frame that must not move. The raster is therefore seeded
   PRE-DIVIDED by the rest scale (SC0 below), so p = 0 renders the mask at exactly
   its own size and the whole change is spent on the travel. */
const M0 = 1.9;
const REF = 0.32; // focal length: short, so the near field is steep
const ZC = 0.34; // where the plate stack sits
const SPREAD = 0.28; // how far apart the plates travel
const TRAVEL = 0.873; // how far the viewing plane advances
const PLANE0 = -0.62; // where the eye starts
const DMIN = 0.03; // nothing may reach the eye itself
/** Depth of every plate at rest, and the magnification that follows from it. */
const D0 = ZC - PLANE0;
const SC0 = (M0 * REF) / (REF + D0);

type Particle = {
  gx: number;
  gy: number;
  v: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  k: number;
  r: number;
};

type Plate = {
  col: readonly [number, number, number];
  dir: number;
  zk: number;
  sprite: HTMLCanvasElement;
  ps: Particle[];
  d: number;
  sc: number;
  blur: number;
};

export default function Passer() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* READ LIVE, NOT ONCE AT MOUNT, and that distinction is the whole bug this
     state exists to fix.
     `gsap.matchMedia()` — which Rack, ShelfTransport and AboutDepth all run on —
     re-evaluates whenever the setting changes and enables or reverts its context
     there and then. This component used to read `matchMedia(...).matches` a
     single time inside the effect below. So toggling the OS setting with the tab
     open left the page HALF REDUCED: measured 14.08.2026, `--passer` stuck at
     the reduced still's 0.18 while `data-about-stack` flipped to "on" and four
     pin-spacers appeared, document height 11176 -> 17282. The hero froze in a
     still frame that no longer matched a page running at full motion — which is
     a state neither mode was designed for, and the one an assistive-tech user
     reaches by changing the setting to see what happens.
     `null` until the first client effect: there is no window during the
     prerender, and the effect below refuses to build until the answer is known
     rather than building twice. */
  const [reduce, setReduce] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduce === null) return;
    const host = hostRef.current;
    const cv = canvasRef.current;
    if (!host || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    /* THREE, AND IT IS AN EXPERIMENT RATHER THAN A SETTLED NUMBER — 01.09.2026.
       This was `Math.min(dpr, 2)`, commented "craft floor: cap at 2". The 2 came
       from a DevTools trace on a 360Hz desktop whose DPR is 2 — so on that
       machine the cap never bound, and it was never once measured on a screen
       where it did. On Antony's iPhone 16e it binds hard: the plate lattice is
       rendered at 2 and upscaled 1.5×, which is what "the NULLPUNKT lettering is
       not readable" is a description of.

       WHAT IT COSTS, so the measurement has a hypothesis to beat: 3 is 2.25× the
       device pixels of 2, on a full-screen canvas carrying 4545 particles. The
       thermal case §15 names — fifteen minutes of continuous scrolling — is
       exactly where this will show if it is going to.

       TO REVERT: put the 3 back to 2. Nothing else here depends on it; the plate
       geometry is all CSS-pixel arithmetic scaled by DPR at draw time. If it does
       have to come back to 2, the fix is a coarser lattice that survives being
       upscaled, NOT a finer one — and that is a decision for the eye on the
       device, per QUY-TRINH stage 4. */
    const DPR = Math.min(window.devicePixelRatio || 1, 3);

    let w = 0;
    let h = 0;
    let plates: Plate[] = [];
    let live = false;
    let raf = 0;
    let last = 0;
    let p = 0;
    let plane = -0.62;
    let reg = 0;
    let shx = 0;
    let shy = 0;
    let mx = -9999;
    let my = -9999;
    let bx = 0;
    let by = 0;
    let hot = false;
    let disposed = false;

    /* One soft disc per plate, drawn once. Blitting this is what stops the grain
       being square-edged; a fillRect per particle cannot be made to glow.
       A DOT WITH AN EDGE, not a smudge. The first profile fell to 55 % alpha by
       a third of the radius and to 13 % by two thirds, which is almost all halo
       and almost no dot: at the pitch this raster runs at, the halos of
       neighbouring particles overlap long before their cores do, so the word was
       drawn by the overlap rather than by the grain and read as fog. The core is
       now held near full to 40 % of the radius and the falloff spent in the outer
       third — a printed dot has an edge, and this is where the material stopped
       being sharp. */
    const makeSprite = ([r, g, b]: readonly [number, number, number]) => {
      const n = 64;
      const c = document.createElement("canvas");
      c.width = c.height = n;
      const x = c.getContext("2d")!;
      const gr = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
      gr.addColorStop(0.4, `rgba(${r},${g},${b},0.94)`);
      gr.addColorStop(0.64, `rgba(${r},${g},${b},0.32)`);
      gr.addColorStop(0.84, `rgba(${r},${g},${b},0.07)`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = gr;
      x.fillRect(0, 0, n, n);
      return c;
    };

    const build = () => {
      const rect = cv.getBoundingClientRect();
      w = cv.width = Math.round(rect.width * DPR);
      h = cv.height = Math.round(rect.height * DPR);
      /* A zero-width canvas makes getImageData throw IndexSizeError, which kills
         the whole effect rather than skipping one frame. It happens for real:
         the hero can be laid out before it has a width. */
      if (w < 2 || h < 2) return false;

      // Word mask. Read once into a closure; every plate is cut from this.
      const mc = document.createElement("canvas");
      mc.width = w;
      mc.height = h;
      const mx2 = mc.getContext("2d", { willReadFrequently: true })!;
      let size = Math.min(w * 0.19, h * 0.42);
      mx2.fillStyle = "#fff";
      /* THE FACE IS READ, NOT NAMED. This used to be the string "Bricolage
         Grotesque" written twice, which meant the one place on the site that
         cuts a material out of letterforms was also the one place that would not
         follow a change of display face — it would have gone on cutting the word
         from a face the page no longer sets, silently, because it still looks
         like a word. next/font publishes the family (with its own fallback) into
         this variable, so asking the document is asking the same source the h1
         is set from. */
      const face =
        getComputedStyle(document.documentElement).getPropertyValue("--font-fira-sans").trim() ||
        '"Fira Sans", sans-serif';
      mx2.font = `500 ${size}px ${face}`;
      mx2.textAlign = "center";
      mx2.textBaseline = "middle";
      /* THE WORD HAS TO FIT THE FRAME. The size above is a cap read off the
         frame's proportions, not a measurement of the word — ten characters at
         0.19w each run about 1.15 frames wide, so on anything but a tall window
         the N and the T were cut off by the canvas edge and the material was
         built from a mask of "ULLPUNK". Measured once, at the real face, and only
         ever scaled DOWN: where the cap already fits, nothing changes. */
      const maxW = w * 0.84;
      const gemessen = mx2.measureText("NULLPUNKT").width;
      if (gemessen > maxW) {
        size *= maxW / gemessen;
        mx2.font = `500 ${size}px ${face}`;
      }
      mx2.fillText("NULLPUNKT", w / 2, h * WORD_Y);
      const md = mx2.getImageData(0, 0, w, h).data;
      const inWord = (px: number, py: number) => {
        const ix = px | 0;
        const iy = py | 0;
        if (ix < 0 || iy < 0 || ix >= w || iy >= h) return false;
        return md[(iy * w + ix) * 4 + 3] > 40;
      };

      /* Pitch scales with the frame instead of being a fixed device pixel count,
         so a 4K display gets a coarser raster rather than eight times the
         particles. The grain reads the same; the frame budget does not move. */
      const S = Math.max(10 * DPR, Math.sqrt(w * h) / 150);
      const F = S * 5.0; // backing grain, so the plate is not only the word
      const cx = w * 0.5;
      const cy = h * 0.5;

      /* ——— THE PLATE HAS TO BE BIGGER THAN THE FRAME ————————————————————
         The backing grain was seeded across the canvas and no further, which is
         correct for a plate that never moves and wrong for this one. The
         pointer carries a plate by shx = (bx − cx)·0.24·d: measured at a 1265px
         frame, the cursor in a corner displaces it about 152px across and 65
         down. Everything it uncovers on the trailing side was never seeded, so
         what the reader sees is not grain moving, it is grain ENDING — a hard
         black margin sliding in from the edge the word was dragged away from.
         The magnification does the same thing more slowly: at p = 1 the near
         plate is at sc 1.74 and its lattice has walked its own outermost cells
         well past the frame.
         Seeded one displacement wider on every side, so there is always plate
         where the plate is going. Costs cells only in the margin. */
      const RAND = Math.max(w, h) * 0.16;

      /* ONE RASTER, CUT THREE TIMES — and this is the second half of the
         sharpness fix. Each plate used to seed its OWN particles, so the same
         cell carried three different radii and three different springs: at the
         zero point the three colours never landed on the same disc, and what was
         supposed to be one ink dot was a small colour rosette. Every edge in the
         word therefore fringed even in perfect register, which is exactly the
         thing register means there ISN'T.
         The variation the plate is alive because of is per CELL, not per plate:
         within one plate the swarm still settles out of step with itself, and
         all three plates settle identically, so in register they coincide to the
         pixel and the word is --ink with a hard raster edge. Off register they
         separate as three copies of one grain, which is what a press does. */
      type Zelle = { gx: number; gy: number; v: number; k: number; r: number };
      const raster: Zelle[] = [];
      /* PRE-DIVIDED BY THE REST SCALE — see the note on REF. These are the
         coordinates the projection multiplies, so dividing them here is what
         makes p = 0 render the mask at 1:1 no matter how steep the near field is
         made. The radius goes through the same division for the same reason: a
         dot that did not scale with its own lattice would break the raster the
         moment the eye started moving. */
      /* `korn` is the one thing the two rasters do NOT share. The word is a
         printed dot and keeps the edge the sprite note argues for; the backing
         is not a dot at all, it is how much plate there is between the letters,
         and at the word's radius there was almost none — 286 cells covering
         2.52 % of the frame, which is one speck every 57px in a volume the
         reader is being flown through. That is why displacing the material
         showed black: there was nothing behind the word to displace.
         BIGGER, NOT MORE, and that is the whole reason this is a radius and not
         a pitch. Coverage goes as r², so 3× the radius is 9× the body for the
         same number of drawImage calls — measured out, 2.5 % → 29 % of the
         frame carrying material, against a pitch change that would have had to
         triple the cell count to reach the same figure. What it does cost is
         fill: 726 discs at ~15px mean radius over three plates is about 1.6
         megapixels of `lighter` blending a frame, i.e. 1.8× overdraw on this
         canvas. The twelve backing planes that once put this page at 2 FPS were
         near 100 megapixels, so this sits two orders of magnitude under the
         thing that made backdrop material unaffordable — but it is not free,
         and it is the number to come back to if the hero's frame time moves. */
      const zelle = (gx: number, gy: number, v: number, korn = 1): Zelle => ({
        gx: gx / SC0,
        gy: gy / SC0,
        v,
        k: 12 + Math.random() * 26, // own spring, so the swarm settles out of step
        r: (S * korn * (0.36 + Math.random() * 0.3)) / SC0, // under the pitch, or it smears
      });
      for (let y = S * 0.5; y < h; y += S)
        for (let x = S * 0.5; x < w; x += S) if (inWord(x, y)) raster.push(zelle(x - cx, y - cy, 1));
      for (let y = F * 0.5 - RAND; y < h + RAND; y += F)
        for (let x = F * 0.5 - RAND; x < w + RAND; x += F) {
          const v = 0.16 + 0.13 * Math.sin((x * 0.0027) / DPR + (y * 0.0016) / DPR);
          /* 0.62, down from 0.95. The falloff took the grain to 5 % of its
             value at the top and bottom of the frame — and the canvas already
             carries a radial mask that fades those same edges, so the material
             was being attenuated twice and died well before the mask had
             finished with it. One statement of "the plate ends softly" is the
             mask's; this one only has to keep the field from being even. */
          raster.push(zelle(x - cx, y - cy, v * (1 - Math.abs(y / h - 0.5) * 0.62), 3.0));
        }

      plates = PLATES.map((pl) => ({
        ...pl,
        sprite: makeSprite(pl.col),
        // Starts at centre-relative coordinates, i.e. half a frame off: the swarm
        // flies in and assembles the plate. That entrance is deliberate.
        ps: raster.map((z) => ({ ...z, x: z.gx, y: z.gy, vx: 0, vy: 0 })),
        d: 1,
        sc: 1,
        blur: 0,
      }));

      /* THE LATTICE OF BACKING PLANES IS GONE, 10.08.2026. Twelve dot-field
         planes were drawn behind the plates to say "this is a volume", each one a
         rectangle at its own depth, stroked at its own edge. On the first screen —
         the one screen this page now holds still and asks to be looked at —
         that read as exactly what it was: grey rectangles stacked behind the
         word. It was also the single biggest thing standing between the material
         and its contrast, because twelve near-ink fields blended with `lighter`
         over the whole frame turn a #050505 ground into a light box.
         The volume did not need it. Depth is already carried by the two things
         that mean it: the plates scale in perspective as the viewing plane
         advances, and whichever plate leaves the focal plane goes soft. A
         backdrop was a THIRD statement of depth, and the weakest — it said
         "there is space here" instead of showing anything moving through it.
         Going with it: the half-resolution buffer it needed, and about 100
         megapixels a frame of blending that once put this page at 2 FPS. */
      bx = cx;
      by = h * WORD_Y;
      return true;
    };

    const step = (dt: number) => {
      const cx = w * 0.5;
      const cy = h * 0.5;
      /* THE APPROACH IS FRONT-LOADED. Linear travel spends its magnification at
         the end of the run, and the end of the run is where the material is
         already fading out for the copy — the fly-through would have happened
         behind a curtain that was closing. Eased out, the eye has covered three
         quarters of the distance by half the wheel, so the plates do their
         rushing while there is still material to rush. */
      const f = 1 - Math.pow(1 - p, 2);
      plane = PLANE0 + f * TRAVEL;
      reg = p * p * 16 * DPR;
      shx = hot ? (bx - cx) * 0.24 : 0;
      shy = hot ? (by - cy) * 0.18 : 0;
      const dKey = ZC - plane; // the key plate is the focal plane
      const rr = 260 * DPR;
      const rr2 = rr * rr;
      const damp = Math.pow(0.0009, dt);

      for (const pl of plates) {
        const z = ZC + pl.zk * SPREAD * p; // at p=0 all three coincide in depth too
        const d = Math.max(DMIN, z - plane);
        pl.d = d;
        pl.sc = (M0 * REF) / (REF + d);
        pl.blur = Math.abs(d - dKey) * 2.6;
        const ox = Math.cos(pl.dir) * reg;
        const oy = Math.sin(pl.dir) * reg;
        const px0 = cx + ox + shx * d;
        const py0 = cy + oy + shy * d;
        for (const q of pl.ps) {
          // No rotation. Perspective scale and slip, nothing else.
          let tx = px0 + q.gx * pl.sc;
          let ty = py0 + q.gy * pl.sc;
          if (hot) {
            const ex = q.x - bx;
            const ey = q.y - by;
            const d2 = ex * ex + ey * ey;
            if (d2 < rr2) {
              const dist = Math.sqrt(d2) + 1;
              const f = 1 - dist / rr;
              const g = f * f * 96 * DPR;
              tx += (ex / dist) * g;
              ty += (ey / dist) * g;
            }
          }
          q.vx += (tx - q.x) * q.k * dt;
          q.vy += (ty - q.y) * q.k * dt;
          q.vx *= damp;
          q.vy *= damp;
          q.x += q.vx * dt;
          q.y += q.vy * dt;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      /* globalAlpha is only written when it actually changes. Every particle in
         the word carries v = 1, so within one plate they all want the same alpha
         — assigning it per particle was thousands of redundant state changes a
         frame, and a state change between two draws is what stops the canvas
         batching them. */
      for (const pl of [...plates].sort((a, b) => b.d - a.d)) {
        const grow = 1 + pl.blur * 1.25;
        const dim = 1 / (1 + pl.blur * 5.5);
        let alpha = -1;
        for (const q of pl.ps) {
          const a = q.v * dim;
          if (a < 0.012) continue;
          const s = q.r * pl.sc * grow;
          if (a !== alpha) {
            ctx.globalAlpha = a;
            alpha = a;
          }
          ctx.drawImage(pl.sprite, q.x - s, q.y - s, s * 2, s * 2);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    /* Found in the DOM rather than owned here, the same way Konvergenz used to
       take it: the readout belongs at the top-right corner of the HERO, opposite
       the coordinates. Inside this component it would anchor to the material's
       own box. It used to print CONVERGENCE, which stopped being true the moment
       the hero became a press instead of a CRT. */
    const readout = document.querySelector<HTMLElement>('[data-hero="readout"]');
    const writeReadout = () => {
      if (!readout) return;
      const px = reg / DPR;
      readout.textContent = `REGISTER ▸ ${px.toFixed(1)} px · ${
        px < 0.4 ? "IN REGISTER" : "OFF REGISTER"
      }`;
    };

    const tick = (ts: number) => {
      if (!live || disposed) return;
      /* CAPPED, and the swarm does not notice: every quantity below integrates
         `dt`, so running this less often samples the same motion less finely
         rather than slowing it down. On a 360Hz panel this was redrawing the
         canvas 360 times a second for a material whose particles move a
         fraction of a pixel between frames. lib/motion.ts has the trace. */
      if (last && ts - last < FRAME_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016; // P2: delta time
      last = ts;
      const tx = mx > -9000 ? mx : w * 0.5;
      const ty = my > -9000 ? my : h * WORD_Y;
      const lerp = 1 - Math.pow(0.0015, dt);
      bx += (tx - bx) * lerp;
      by += (ty - by) * lerp;
      step(dt);
      draw();
      writeReadout();
      raf = requestAnimationFrame(tick);
    };

    /* THE MATERIAL CLEARS FOR THE TYPE IT IS STANDING IN FRONT OF.
       The plates print OVER the hero copy now (see app/page.tsx), so the title
       arrives behind the grain and is read through it — which is the depth the
       flat version never had, and it is only payable if the grain then goes.
       Not a straight 1 − p, and the window is set BY THE TRAVEL rather than by
       taste. The eye covers its distance on an eased curve, so the plates are at
       1.4× by a fifth of the run, 2.6× by half, and only reach the near field in
       the last third — measured off the projection, not guessed. The first fade
       tried started clearing at 18 % and had the material at 4 % by the time
       anything got big: the fly-through happened behind a curtain that was
       already closed. Held flat to 30 %, gone by 92 %, so the steep part of the
       approach and the visible part of the material are the same stretch of
       wheel. Smoothstep rather than a line, so neither end has a corner in it.
       The plates keep separating underneath — the material comes apart AND
       clears. One says the register is lost, the other hands the screen over. */
    const schleier = (x: number) => {
      const t = Math.min(1, Math.max(0, (x - 0.3) / 0.62));
      return 1 - t * t * (3 - 2 * t);
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mx = (e.clientX - r.left) * DPR;
      my = (e.clientY - r.top) * DPR;
      hot = true;
    };
    const onLeave = () => {
      mx = my = -9999;
      hot = false;
    };

    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let tween: gsap.core.Tween | null = null;

    /* The font has to be resolved before the mask is rasterised — see the note
       at the top. Everything else hangs off this promise. */
    document.fonts.ready.then(() => {
      if (disposed || !build()) return;

      if (reduce) {
        /* AND IT GOES BACK BEHIND THE COPY. The material prints over the type
           because scroll then clears it; with no scroll driving anything there is
           nothing to clear it, and a still frame of grain sitting on top of the
           manifesto is not a calmer page, it is an unreadable one. Reduced motion
           gets the layering the flat version had. */
        host.style.zIndex = "-10";

        /* A composed still: plates apart, swarm already settled. Sixty fixed
           steps rather than one, because a single step would draw the swarm
           mid-flight, which is a smear, not a frame.

           HOW FAR APART IS THE WHOLE QUESTION, and it was 0.38 until 14.08.2026
           without anyone having looked at the result. Three stills were rendered
           and compared; 0.18 is Antony's call, and the two it beat are worth
           writing down because neither is obviously wrong:

             0     the plates converge and the wordmark becomes LEGIBLE — which
                   is the trouble, not the prize. It then sits behind the h1 and
                   the two lines of type compete. This is the real reason the
                   still was never at 0, and the old comment here did not say it.
             0.38  no collision, but the dot field separates into saturated
                   magenta/yellow/cyan and the HUD reads 2.3 px OFF REGISTER —
                   loud, on the one frame a reduced-motion reader ever sees.
             0.18  the wordmark has dissolved enough not to compete, the field
                   stays close to mono, and the material is still visible as
                   material. The HUD still reads OFF REGISTER, at 0.5 px.

           SO THE NAME IS STILL NOT ILLUSTRATED IN THIS FRAME, and that is a
           knowing trade rather than an oversight: only 0 reads IN REGISTER, and
           0 costs the headline. If the collision is ever solved another way —
           the material sitting further back in the still — 0 becomes available
           again and this number should be revisited, not defended. */
        p = 0.18;
        root.style.setProperty("--passer", "0.18");
        root.style.setProperty("--schleier", schleier(0.18).toFixed(4));
        for (let i = 0; i < 60; i++) step(0.05);
        draw();
        writeReadout();
        return;
      }

      /* Published before the first scroll event, not from the first onUpdate.
         `--passer` is this project's one controlling variable; anything else that
         reads it has to find a number there on the very first frame, not an
         empty string that resolves to the fallback. */
      root.style.setProperty("--passer", "0");
      root.style.setProperty("--schleier", "1");

      const host2 = host.parentElement || host;
      host2.addEventListener("pointermove", onMove, { passive: true });
      host2.addEventListener("pointerleave", onLeave, { passive: true });

      // SC3: the loop stops when the hero leaves the viewport.
      io = new IntersectionObserver(([entry]) => {
        live = entry.isIntersecting;
        if (live) {
          last = 0;
          raf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf);
        }
      });
      io.observe(cv);

      ro = new ResizeObserver(() => {
        if (!disposed) build();
      });
      ro.observe(cv);

      /* Driven through a tween so `scrub` has something to smooth. The same
         correction Konvergenz documents: ScrollTrigger.create() links no
         animation, so the plates would separate exactly as abruptly as the wheel
         turns.
         THE RUNWAY IS lib/hero.ts, NOT A NUMBER OF ITS OWN. It was 62 % of a
         window, chosen so the separation finished before the hero scrolled off
         the fold. The hero is pinned now — it cannot scroll off while this runs —
         and the copy is revealed over the same stretch of wheel, so the plates
         coming apart and the type arriving are one movement with one length. Two
         numbers here would put the material at rest while the reader is still
         being handed sentences. */
      gsap.registerPlugin(ScrollTrigger);
      const drive = { p: 0 };
      tween = gsap.to(drive, {
        p: 1,
        ease: "none", // scroll position IS the position
        scrollTrigger: {
          start: 0,
          end: heroRunway,
          scrub: 0.6,
        },
        onUpdate: () => {
          p = drive.p;
          const s = schleier(p);
          root.style.setProperty("--passer", p.toFixed(4));
          /* PUBLISHED, because the title is now standing inside this material and
             has to know how much of it is still in front of it. --passer says how
             far out of register the plates are; this says how much plate there
             still IS. They were the same number while the material never left,
             and they stopped being the same the moment it started clearing.
             Konvergenz reads this one. */
          root.style.setProperty("--schleier", s.toFixed(4));
          cv.style.opacity = String(s);
        },
      });
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro?.disconnect();
      tween?.scrollTrigger?.kill();
      tween?.kill();
      const host2 = host.parentElement || host;
      host2.removeEventListener("pointermove", onMove);
      host2.removeEventListener("pointerleave", onLeave);
      // Handed back at full strength, so the next mount reads the element's own
      // stylesheet state instead of a value this run happened to stop on.
      cv.style.opacity = "";
      host.style.zIndex = "";
      root.style.removeProperty("--passer");
      root.style.removeProperty("--schleier");
    };
  }, [reduce]);

  return (
    /* z-10, i.e. IN FRONT OF THE COPY — the flip that gives the hero its depth.
       It sat at -z-10 and the type was simply laid on a background. Now the
       title arrives BEHIND the grain and is read through it while the plates
       come apart, and the material clears as the sentences land (see `schleier`
       above). pointer-events-none throughout, so nothing here is between the
       reader and text they might want to select. */
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-10 overflow-hidden"
      style={{
        // The hero now pulls itself up under the header (see app/page.tsx), so
        // the section's own top IS the top of the page — the -7rem that used to
        // cancel main's pt-28 would now hang the material above the document.
        top: 0,
        bottom: 0,
        /* ——— / 0.84, AND IT IS NOT A FUDGE ————————————————————————————————
           This was `calc(var(--gutter) * -1)` and the material never reached the
           screen. Measured at a 1265px viewport: the canvas ran 16px short of
           both edges, so the raster grid stopped in mid-air on a left and right
           margin nothing else on the page has.
           It is the trap globals.css states outright next to --gutter: the
           variable is 8 PERCENT, and a percentage in `left` resolves against the
           containing block — which here is the hero, not the page. main's own
           padding is 8% of the PAGE, but 8% measured from inside a column that
           is only 84% of the page is 8% of 84%, i.e. 16px too little at this
           width and wrong by a different amount at every other.
           The section is exactly 84% of the page (100 − 2 × 8), so dividing by
           0.84 converts the column's percentage back into the page's. Exact by
           construction at every width, and it counts no scrollbar, which is the
           reason --gutter is a percentage rather than a vw in the first place. */
        left: "calc(var(--gutter) / 0.84 * -1)",
        right: "calc(var(--gutter) / 0.84 * -1)",
      }}
    >
      {/* The material has to end by fading, not by being cut off at the viewport
          edge — without it the canvas reads as a rectangle laid on the page
          rather than as the ground the page is printed on.
          A MASK, NOT A DARK SHEET OVER THE TOP, and the layer flip is what forced
          the change. This was a radial gradient of --bg painted on top of the
          canvas, which was harmless while the material was BEHIND the copy and
          is not now: on top, that sheet would have printed a black vignette over
          the manifesto and the operator readings and dimmed the corners of the
          hero's own text. A mask removes material instead of adding ground, so
          the same shape now costs the copy nothing. */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        style={{
          maskImage:
            "radial-gradient(120% 96% at 50% 45%, #000 44%, rgba(0,0,0,.5) 76%, rgba(0,0,0,.05) 100%)",
          WebkitMaskImage:
            "radial-gradient(120% 96% at 50% 45%, #000 44%, rgba(0,0,0,.5) 76%, rgba(0,0,0,.05) 100%)",
        }}
      />
    </div>
  );
}
