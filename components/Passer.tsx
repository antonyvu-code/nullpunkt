"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
 * drawn with Bricolage Grotesque and next/font resolves after first paint, so
 * building it eagerly rasterises the fallback face and the whole material is cut
 * from the wrong letterforms — silently, because it still looks like a word.
 *
 * Reduced motion gets the composed frame: the plates slightly apart with the
 * swarm already settled, which is a picture of the material. The registered
 * state would be the calmer choice and the wrong one — it hides the only thing
 * the material is about.
 */

/** The three plates. `zk` is the depth rank, `dir` the direction each one slips. */
const PLATES = [
  { col: [255, 96, 44] as const, dir: 0, zk: 1 },
  { col: [46, 196, 255] as const, dir: (Math.PI * 2) / 3, zk: -1 },
  { col: [244, 242, 236] as const, dir: (Math.PI * 4) / 3, zk: 0 },
];

/** Where the word sits in the frame — high, so the hero copy has the lower half. */
const WORD_Y = 0.4;
const VIS = 1.55; // how far into the volume the eye reaches
const GAP = VIS / 12; // spacing of the fixed lattice of backing planes
const M0 = 1.9; // magnification, so near planes overflow the frame
const REF = 1.0;
const ZC = 0.34; // where the plate stack sits
const SPREAD = 0.28; // how far apart the plates travel
const TRAVEL = 0.4; // how far the viewing plane advances

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

  useEffect(() => {
    const host = hostRef.current;
    const cv = canvasRef.current;
    if (!host || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2); // craft floor: cap at 2

    let w = 0;
    let h = 0;
    let plates: Plate[] = [];
    let tiles: HTMLCanvasElement[] = [];
    let backdrop: HTMLCanvasElement | null = null;
    let bctx: CanvasRenderingContext2D | null = null;
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
       being square-edged; a fillRect per particle cannot be made to glow. */
    const makeSprite = ([r, g, b]: readonly [number, number, number]) => {
      const n = 64;
      const c = document.createElement("canvas");
      c.width = c.height = n;
      const x = c.getContext("2d")!;
      const gr = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
      gr.addColorStop(0.32, `rgba(${r},${g},${b},0.55)`);
      gr.addColorStop(0.68, `rgba(${r},${g},${b},0.13)`);
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
      const size = Math.min(w * 0.19, h * 0.42);
      mx2.fillStyle = "#fff";
      mx2.font = `500 ${size}px "Bricolage Grotesque", sans-serif`;
      mx2.textAlign = "center";
      mx2.textBaseline = "middle";
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
      const F = S * 5.7; // sparse backing grain, so the plate is not only the word
      const cx = w * 0.5;
      const cy = h * 0.5;
      const seed = (gx: number, gy: number, v: number): Particle => ({
        gx,
        gy,
        v,
        // Starts at centre-relative coordinates, i.e. half a frame off: the swarm
        // flies in and assembles the plate. That entrance is deliberate.
        x: gx,
        y: gy,
        vx: 0,
        vy: 0,
        k: 12 + Math.random() * 26, // own spring, so the swarm settles out of step
        r: S * (0.4 + Math.random() * 0.34), // under the pitch, or the grain smears
      });

      plates = PLATES.map((pl) => {
        const ps: Particle[] = [];
        for (let y = S * 0.5; y < h; y += S)
          for (let x = S * 0.5; x < w; x += S) if (inWord(x, y)) ps.push(seed(x - cx, y - cy, 1));
        for (let y = F * 0.5; y < h; y += F)
          for (let x = F * 0.5; x < w; x += F) {
            const v = 0.16 + 0.13 * Math.sin((x * 0.0027) / DPR + (y * 0.0016) / DPR);
            ps.push(seed(x - cx, y - cy, v * (1 - Math.abs(y / h - 0.5) * 0.95)));
          }
        return { ...pl, sprite: makeSprite(pl.col), ps, d: 1, sc: 1, blur: 0 };
      });

      // Backing planes: a lattice fixed in space, so the volume never runs out.
      tiles = [];
      for (let s = 0; s < 6; s++) {
        const c = document.createElement("canvas");
        c.width = Math.round(w / 2);
        c.height = Math.round(h / 2);
        const x = c.getContext("2d")!;
        x.fillStyle = "rgba(242,240,235,0.95)";
        for (let y = 0; y < c.height; y += 22)
          for (let px = 0; px < c.width; px += 22) {
            const v =
              Math.sin(px * 0.021 + s * 2.1) * Math.cos(y * 0.017 - s * 1.7) +
              0.5 * Math.sin((px + y) * 0.009 - s);
            if (v > 0.52) x.fillRect(px, y, 1.7, 1.7);
          }
        tiles.push(c);
      }

      /* The lattice is composited into a HALF-RESOLUTION buffer and blitted once,
         not drawn straight onto the frame. Measured on a real 1440×900 screen at
         DPR 2: twelve full-frame `lighter` blits at 2806×1803 — the near ones
         1.9× the canvas — cost about 100 megapixels of blending per frame and
         put the page at 2 FPS. The site prints its own FPS in the chrome, so
         this was visible in the first screenshot. Half resolution is a quarter of
         the fill, and the lattice is a soft dot field where nobody can see the
         difference. The plates keep full resolution: they are the material. */
      backdrop = document.createElement("canvas");
      backdrop.width = Math.max(2, Math.round(w / 2));
      backdrop.height = Math.max(2, Math.round(h / 2));
      bctx = backdrop.getContext("2d");

      bx = cx;
      by = h * WORD_Y;
      return true;
    };

    const step = (dt: number) => {
      const cx = w * 0.5;
      const cy = h * 0.5;
      plane = -0.62 + p * TRAVEL;
      reg = p * p * 16 * DPR;
      shx = hot ? (bx - cx) * 0.24 : 0;
      shy = hot ? (by - cy) * 0.18 : 0;
      const dKey = ZC - plane; // the key plate is the focal plane
      const rr = 260 * DPR;
      const rr2 = rr * rr;
      const damp = Math.pow(0.0009, dt);

      for (const pl of plates) {
        const z = ZC + pl.zk * SPREAD * p; // at p=0 all three coincide in depth too
        const d = Math.max(0.05, z - plane);
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
      ctx.lineWidth = Math.max(1, DPR * 0.7);

      if (backdrop && bctx) {
        const bw = backdrop.width;
        const bh = backdrop.height;
        bctx.clearRect(0, 0, bw, bh);
        bctx.globalCompositeOperation = "lighter";
        bctx.lineWidth = 1;
        const k0 = Math.ceil((plane + 0.02) / GAP);
        const k1 = Math.floor((plane + VIS) / GAP);
        for (let k = k1; k >= k0; k--) {
          const d = k * GAP - plane;
          const fade = Math.pow(1 - d / VIS, 1.7);
          if (fade < 0.06) continue; // nothing a reader could see, at full blit cost
          const sc = (M0 * REF) / (REF + d);
          const x = bw * 0.5 + shx * 0.5 * d - (bw * sc) / 2;
          const y = bh * 0.5 + shy * 0.5 * d - (bh * sc) / 2;
          bctx.globalAlpha = fade * 0.26;
          bctx.drawImage(tiles[((k % 6) + 6) % 6], x, y, bw * sc, bh * sc);
          bctx.globalAlpha = fade * 0.13;
          bctx.strokeStyle = d < 0.5 ? "rgba(255,77,28,1)" : "rgba(242,240,235,1)";
          bctx.strokeRect(x, y, bw * sc, bh * sc);
        }
        bctx.globalAlpha = 1;
        bctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.drawImage(backdrop, 0, 0, w, h);
      }

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
        /* A composed still: plates apart, swarm already settled. Sixty fixed
           steps rather than one, because a single step would draw the swarm
           mid-flight, which is a smear, not a frame. */
        p = 0.38;
        root.style.setProperty("--passer", "0.38");
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
         62svh OF RUNWAY, AND THE SAME 62svh KONVERGENZ USES. The first build ran
         the separation across the hero's whole height, which meant the plates
         were still coming apart while the hero was already leaving the screen:
         the end of the gesture happened above the fold, where nobody watches it.
         That is exactly the mistake Konvergenz's own note describes. Sharing the
         window also makes the two read as one movement rather than two effects
         that happen to be on the same screen. */
      gsap.registerPlugin(ScrollTrigger);
      const drive = { p: 0 };
      tween = gsap.to(drive, {
        p: 1,
        ease: "none", // scroll position IS the position
        scrollTrigger: {
          start: 0,
          end: () => window.innerHeight * 0.62,
          scrub: 0.6,
        },
        onUpdate: () => {
          p = drive.p;
          root.style.setProperty("--passer", p.toFixed(4));
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
      root.style.removeProperty("--passer");
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute -z-10 overflow-hidden"
      style={{
        top: "-7rem", // main's pt-28, so the material reaches the top of the frame
        bottom: 0,
        left: "calc(var(--gutter) * -1)",
        right: "calc(var(--gutter) * -1)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      {/* The material has to end by fading, not by being cut off at the viewport
          edge. Without this the canvas reads as a rectangle laid on the page
          rather than as the ground the page is printed on. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 96% at 50% 40%, rgba(5,5,5,0) 38%, rgba(5,5,5,.55) 74%, rgba(5,5,5,.94) 100%)",
        }}
      />
    </div>
  );
}
