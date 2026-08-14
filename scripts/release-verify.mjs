/* The release now runs. Three things have to hold, or it is a new bug:
   1. leave the list without scrolling  -> trace plays its full length
   2. leave the list and scroll          -> trace ends at once, dial handed back
   3. after either                       -> the sweep owns --accent again        */
import { launch } from "./cdp.mjs";

async function scene(kind) {
  const p = await launch({ width: 1440, height: 900 });
  await p.goto("http://localhost:3000/");
  await p.evaluate(`await new Promise(r => setTimeout(r, 2500));`);

  await p.evaluate(`
    window.__t = { events: [], t0: performance.now() };
    new MutationObserver((recs) => {
      for (const r of recs) {
        if (r.attributeName !== 'data-accent-release' && r.attributeName !== 'data-zeiger') continue;
        window.__t.events.push({
          at: Math.round(performance.now() - window.__t.t0),
          attr: r.attributeName,
          up: document.documentElement.hasAttribute(r.attributeName),
        });
      }
    }).observe(document.documentElement, { attributes: true });
  `);

  const box = await p.evaluate(`
    const rows = [...document.querySelectorAll('a[data-accent].pl-11')];
    const el = rows[2];
    el.scrollIntoView({ block: 'center' });
    await new Promise(r => setTimeout(r, 1500));
    window.__t.t0 = performance.now(); window.__t.events.length = 0;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left + 60), y: Math.round(r.top + r.height / 2) };
  `);

  await p.s("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y - 400 });
  await p.s("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y });
  await p.evaluate(`await new Promise(r => setTimeout(r, 700));`);
  const held = await p.evaluate(`return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();`);

  // leave the list
  await p.s("Input.dispatchMouseEvent", { type: "mouseMoved", x: 20, y: 20 });

  if (kind === "scroll") {
    await p.evaluate(`await new Promise(r => setTimeout(r, 300)); window.scrollBy(0, 140); return 0;`);
  }
  await p.evaluate(`await new Promise(r => setTimeout(r, 3000));`);

  const after = await p.evaluate(`
    const de = document.documentElement;
    const before = getComputedStyle(de).getPropertyValue('--accent').trim();
    // does the sweep own the dial again?
    window.scrollBy(0, 600);
    await new Promise(r => setTimeout(r, 900));
    return {
      events: window.__t.events,
      restAccent: before,
      afterScroll: getComputedStyle(de).getPropertyValue('--accent').trim(),
      leftover: { release: de.hasAttribute('data-accent-release'), zeiger: de.hasAttribute('data-zeiger') },
    };
  `);

  console.log(`\n── leave the list ${kind === "scroll" ? "AND SCROLL" : "without scrolling"}`);
  console.log(`   colour while held: ${held}`);
  after.events.forEach((e) => console.log(`   ${String(e.at).padStart(5)} ms  ${e.attr} ${e.up ? "UP" : "down"}`));
  console.log(`   accent when trace ended: ${after.restAccent}   after scrolling on: ${after.afterScroll}` +
    `  ${after.restAccent !== after.afterScroll ? "→ sweep owns the dial again" : "→ !! DIAL STILL STUCK"}`);
  console.log(`   left pinned on <html>: release=${after.leftover.release} zeiger=${after.leftover.zeiger}` +
    `  ${!after.leftover.release && !after.leftover.zeiger ? "(clean)" : "(!! LEAK)"}`);
  await p.close();
}

await scene("still");
await new Promise((r) => setTimeout(r, 800));
await scene("scroll");
