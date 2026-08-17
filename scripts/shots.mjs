/* The reduced-motion build and the phone build, looked at.
   Filmstrip down the page + a hidden-content audit for each condition. */
import { launch } from "./cdp.mjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/* Beside this file, not beside whatever directory it was invoked from —
   `scripts/shots/` is gitignored. */
const OUT = join(import.meta.dirname, "shots");
mkdirSync(OUT, { recursive: true });

/* Four conditions became six on 15.08.2026, and two of the original four were
   wrong — see cdp.mjs on why `mobile: true` does not make a touch device.

   THE PHONE CONDITIONS WERE RUNNING AS A NARROW DESKTOP. Without touch
   emulation the page reports `hover: hover`, so `@media (hover: none)` in
   globals.css never applied and the [data-probed] path — the whole substitute
   for hover on touch — was never once exercised, including in the
   reduced-motion review of 14.08.

   THE TABLET ROW IS NEW, and it is the cell nothing had ever run in: wide
   enough that Rack, ShelfTransport and AccentScroll all switch on at
   `min-width: 768px`, with no hover to drive the index. Landscape is 1366 on
   purpose — an iPad Pro 12.9 is desktop-width with a coarse pointer, which is
   the furthest the two axes get from each other. */
const CONDS = [
  { id: "desk-motion", w: 1440, h: 900, rm: false, mobile: false, touch: false, label: "Desktop 1440 · motion on" },
  { id: "desk-reduced", w: 1440, h: 900, rm: true, mobile: false, touch: false, label: "Desktop 1440 · prefers-reduced-motion" },
  { id: "tab-portrait", w: 820, h: 1180, rm: false, mobile: true, touch: true, label: "Tablet 820×1180 portrait · motion on" },
  { id: "tab-landscape", w: 1366, h: 1024, rm: false, mobile: true, touch: true, label: "Tablet 1366×1024 landscape · motion on" },
  { id: "phone-motion", w: 390, h: 844, rm: false, mobile: true, touch: true, label: "Phone 390×844 · motion on" },
  { id: "phone-reduced", w: 390, h: 844, rm: true, mobile: true, touch: true, label: "Phone 390×844 · prefers-reduced-motion" },
];

const STEPS = 9;
const report = [];

for (const c of CONDS) {
  const p = await launch({ width: c.w, height: c.h, reducedMotion: c.rm, mobile: c.mobile, touch: c.touch });
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

  report.push({ ...c, media: p.media, meta, frames, audit });
  console.log(
    `${c.label.padEnd(42)} hover=${p.media.hover.padEnd(5)} ptr=${p.media.pointer.padEnd(6)} ` +
    `rm=${String(meta.rm).padEnd(5)} docH=${String(meta.docH).padEnd(6)} overflowX=${String(meta.overflowX).padEnd(4)} ` +
    `hidden=${String(audit.hiddenCount).padEnd(3)} headings=${audit.headings} canvas=${JSON.stringify(audit.canv)}`,
  );
  await p.close();
  await new Promise((r) => setTimeout(r, 800));
}

writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
