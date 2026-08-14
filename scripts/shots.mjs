/* The reduced-motion build and the phone build, looked at.
   Filmstrip down the page + a hidden-content audit for each condition. */
import { launch } from "./cdp.mjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/* Beside this file, not beside whatever directory it was invoked from —
   `scripts/shots/` is gitignored. */
const OUT = join(import.meta.dirname, "shots");
mkdirSync(OUT, { recursive: true });

const CONDS = [
  { id: "desk-motion", w: 1440, h: 900, rm: false, mobile: false, label: "Desktop 1440 · motion on" },
  { id: "desk-reduced", w: 1440, h: 900, rm: true, mobile: false, label: "Desktop 1440 · prefers-reduced-motion" },
  { id: "phone-motion", w: 390, h: 844, rm: false, mobile: true, label: "Phone 390×844 · motion on" },
  { id: "phone-reduced", w: 390, h: 844, rm: true, mobile: true, label: "Phone 390×844 · prefers-reduced-motion" },
];

const STEPS = 9;
const report = [];

for (const c of CONDS) {
  const p = await launch({ width: c.w, height: c.h, reducedMotion: c.rm, mobile: c.mobile });
  await p.goto("http://localhost:3000/");
  await p.evaluate(`await new Promise(r => setTimeout(r, 3500));`);

  const meta = await p.evaluate(`
    return {
      rm: matchMedia('(prefers-reduced-motion: reduce)').matches,
      docH: document.documentElement.scrollHeight,
      vw: innerWidth, vh: innerHeight,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  `);

  const frames = [];
  for (let i = 0; i < STEPS; i++) {
    const target = await p.evaluate(`
      const max = document.documentElement.scrollHeight - innerHeight;
      const y = Math.round(max * ${i} / ${STEPS - 1});
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 1400));
      return Math.round(window.scrollY);
    `);
    const png = await p.screenshot();
    const f = `${c.id}-${String(i).padStart(2, "0")}.png`;
    writeFileSync(join(OUT, f), Buffer.from(png, "base64"));
    frames.push({ f, y: target });
  }

  /* Hidden-content audit: anything that carries text but paints nothing.
     A reduced-motion build whose reveals never fire looks exactly like this. */
  const audit = await p.evaluate(`
    await new Promise(r => setTimeout(r, 800));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 1200));
    const bad = [];
    for (const e of document.querySelectorAll('section, section *')) {
      const t = (e.textContent || '').trim();
      if (!t || t.length < 8) continue;
      if (e.children.length > 3) continue;           // containers, not leaves
      const s = getComputedStyle(e);
      const op = parseFloat(s.opacity);
      const r = e.getBoundingClientRect();
      if (op < 0.05 || s.visibility === 'hidden')
        bad.push({ tag: e.tagName, cls: (e.className||'').toString().slice(0,50), op, text: t.slice(0,45) });
      else if (r.width === 0 && r.height === 0 && s.position !== 'fixed' && s.display !== 'none')
        bad.push({ tag: e.tagName, cls: 'zero-box', op, text: t.slice(0,45) });
    }
    // canvases: a reduced-motion build should still paint a designed frame or not exist
    const canv = [...document.querySelectorAll('canvas')].map(cv => {
      const r = cv.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), display: getComputedStyle(cv).display };
    });
    return { hidden: bad.slice(0, 25), hiddenCount: bad.length, canv,
             headings: [...document.querySelectorAll('h1,h2,h3')].length };
  `);

  report.push({ ...c, meta, frames, audit });
  console.log(`${c.label.padEnd(46)} rm=${meta.rm}  docH=${meta.docH}  overflowX=${meta.overflowX}  hidden=${audit.hiddenCount}  headings=${audit.headings}  canvas=${JSON.stringify(audit.canv)}`);
  await p.close();
  await new Promise((r) => setTimeout(r, 800));
}

writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
