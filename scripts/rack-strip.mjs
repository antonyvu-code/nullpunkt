/* The rack pin, sampled at the same nine points of its own run, for three
   scrub/stagger settings. Not a number to approve — a thing to look at.

   The run is `end: "+=45%"` of window from `center center`, so the sample
   points are fractions of THAT range, identical across variants.

   THIS ONE NEEDS TWO TEMPORARY LINES IN THE SOURCE, unlike the others here.
   ScrollTrigger's config is read once at build time, so the only way to vary it
   is to build with a hook. In `components/Rack.tsx`, temporarily replace

       scrub: 0.4,                       ->  scrub: (globalThis as { __tune?: { scrub?: number } }).__tune?.scrub ?? 0.4,
       stagger: 0.12,                    ->  stagger: (globalThis as { __tune?: { stagger?: number } }).__tune?.stagger ?? 0.12,
       tl.to({}, { duration: 0.3 }, 1.6) ->  tl.to({}, { duration: 0.3 }, 1 + (cards.length - 1) * ((globalThis as { __tune?: { stagger?: number } }).__tune?.stagger ?? 0.12))

   …then `pnpm build`, run this, and REVERT ALL THREE. The third line is not
   optional: leaving the hold at a fixed 1.6 while the stagger varies gives the
   tighter settings a free head start and the comparison is worthless. */
import { launch } from "./cdp.mjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = join(import.meta.dirname, "shots");
mkdirSync(OUT, { recursive: true });

const VARIANTS = [
  { id: "A", scrub: 0.7, stagger: 0.18, label: "A — scrub 0.7 · stagger 0.18  (in code now)" },
  { id: "B", scrub: 0.4, stagger: 0.12, label: "B — scrub 0.4 · stagger 0.12  (tighter, crisper)" },
  { id: "C", scrub: 1.0, stagger: 0.26, label: "C — scrub 1.0 · stagger 0.26  (heavier, more sequence)" },
];

const STEPS = 9;
const out = [];

for (const v of VARIANTS) {
  const p = await launch({ width: 1440, height: 900 });
  await p.s("Page.addScriptToEvaluateOnNewDocument", {
    source: `globalThis.__tune = { scrub: ${v.scrub}, stagger: ${v.stagger} };`,
  });
  await p.goto("http://localhost:3000/");
  await p.evaluate(`await new Promise(r => setTimeout(r, 3500));`);

  /* Find the rack's pin range from ScrollTrigger itself rather than guessing:
     the pinned section is the one whose trigger start/end we can read off the
     spacer. Simpler and instrument-free: locate the capability section and use
     its pin spacer. */
  const range = await p.evaluate(`
    const sp = [...document.querySelectorAll('.pin-spacer')].find(s =>
      /CAPABILITIES/i.test(s.textContent || ''));
    if (!sp) return { err: 'no pin-spacer around CAPABILITIES — is the server stale?' };
    const r = sp.getBoundingClientRect();
    return { start: Math.round(r.top + window.scrollY), height: Math.round(r.height),
             docH: document.documentElement.scrollHeight };
  `);
  if (range.err) throw new Error(range.err);

  const frames = [];
  for (let i = 0; i < STEPS; i++) {
    // Walk the pin in real wheel-sized steps so the scrub has something to lag behind.
    const y = await p.evaluate(`
      const target = ${range.start} + (${range.height} - innerHeight) * ${i} / ${STEPS - 1};
      const from = window.scrollY;
      const n = 14;
      for (let k = 1; k <= n; k++) {
        window.scrollTo(0, from + (target - from) * k / n);
        await new Promise(r => requestAnimationFrame(r));
      }
      await new Promise(r => setTimeout(r, 260));
      return Math.round(window.scrollY);
    `);
    const png = await p.screenshot();
    const f = `rack-${v.id}-${String(i).padStart(2, "0")}.png`;
    writeFileSync(join(OUT, f), Buffer.from(png, "base64"));
    frames.push({ f, y });
  }

  const check = await p.evaluate(`return { tune: JSON.stringify(globalThis.__tune) };`);
  console.log(`${v.label.padEnd(50)} tune=${check.tune}  pin ${range.start}..${range.start + range.height}`);
  out.push({ ...v, range, frames });
  await p.close();
  await new Promise((r) => setTimeout(r, 700));
}

writeFileSync(join(OUT, "rack.json"), JSON.stringify(out, null, 2));
