/* Minimal CDP client on plain Node 24 (global WebSocket, no dependency).
   Same idea as the probe.mjs OFFEN §4 describes, rebuilt because that one
   lived in a scratchpad and is gone. */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = join(
  process.env.LOCALAPPDATA,
  "ms-playwright",
  "chromium-1234",
  "chrome-win64",
  "chrome.exe",
);

export async function launch({ width = 1440, height = 900, dsf = 1, reducedMotion = false, mobile = false, touch = false, extraArgs = [] } = {}) {
  const port = 9200 + Math.floor(Math.random() * 500);
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "cdp-"))}`,
    "--headless=new",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--hide-scrollbars",
    `--window-size=${width},${height}`,
    "--force-device-scale-factor=" + dsf,
  ];
  if (reducedMotion) args.push("--force-prefers-reduced-motion=reduce");
  /* extraArgs exists for the GPU question: `--disable-gpu` is the closest thing
     on this machine to the reader who has no hardware acceleration. Pass it, and
     then PROVE it landed by reading the unmasked WebGL renderer — a flag Chrome
     silently ignores looks exactly like a flag that worked. */
  args.push(...extraArgs);
  const proc = spawn(CHROME, args, { stdio: "ignore" });

  let wsUrl = null;
  for (let i = 0; i < 120 && !wsUrl; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      wsUrl = (await r.json()).webSocketDebuggerUrl;
    } catch {}
  }
  if (!wsUrl) throw new Error("chrome did not come up");

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else if (msg.method) {
      for (const l of listeners) l(msg);
    }
  });

  const send = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const mid = ++id;
      pending.set(mid, { res, rej });
      ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
    });

  /* Attach to the one about:blank tab. The target list can come back before the
     page target has been registered — that race is what produced runs where the
     page loaded but nothing was measurable. Poll instead of assuming. */
  /* PICK THE TARGET BY URL, NOT BY POSITION. Taking the first `page` target got
     `chrome://new-tab-page/` often enough to matter: every measurement then came
     back empty — docHeight 900, no sections, no --passer — which reads exactly
     like the site failing to render. Prefer about:blank, accept any http(s)
     target, and never a chrome:// one. */
  let page = null;
  for (let i = 0; i < 60 && !page; i++) {
    const { targetInfos } = await send("Target.getTargets");
    const pages = targetInfos.filter((t) => t.type === "page");
    /* Prefer a real page over chrome://new-tab-page — attaching to the new tab
       page produced runs where docHeight was 900, no sections existed and every
       reading came back empty, which reads exactly like the site failing to
       render. Fall back to whatever page exists rather than throwing: passing
       `about:blank` as a launch argument was tried to guarantee one, and hung. */
    page = pages.find((t) => !t.url.startsWith("chrome")) || pages[0];
    if (!page) await new Promise((r) => setTimeout(r, 200));
  }
  if (!page) throw new Error("no page target after 12s");
  const { sessionId } = await send("Target.attachToTarget", { targetId: page.targetId, flatten: true });
  const s = (method, params) => send(method, params, sessionId);

  await s("Page.enable");
  await s("Runtime.enable");
  /* STATE THE MOTION PREFERENCE IN BOTH DIRECTIONS. The launch flag only adds
     `reduce`; with nothing passed, headless inherits the HOST's setting. On
     14.08.2026 Antony left Windows' animation effects switched off and every
     "motion on" run silently measured a reduced-motion page — pins 0, --passer
     parked at the still — which reads as "the change broke the site". */
  await s("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" },
    ],
  });
  await s("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: dsf,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });

  /* A TABLET IS NOT A NARROW DESKTOP, and neither the width nor `mobile` says
     so. Measured 15.08.2026 against about:blank, four configurations:

       1440, as this bench ran before          hover: hover · pointer: fine
       820, width changed only                 hover: hover · pointer: fine
       820 + mobile: true                      hover: hover · pointer: fine
       820 + touch emulation                   hover: none  · pointer: coarse

     So every "responsive check" done by resizing a window — this bench's phone
     condition included — was testing a narrow DESKTOP. The site branches its
     motion on width (`min-width: 768px` in Rack, ShelfTransport, AccentScroll)
     and its accent probe on hover (`@media (hover: none)` in globals.css), and
     the cell where those two disagree is exactly a tablet: wide enough for the
     pins, with no hover to drive the index. Nothing had ever run there.

     THE OBVIOUS CALL IS THE WRONG ONE, and it fails silently:
     Emulation.setEmulatedMedia with { name: "hover" } / { name: "pointer" } is
     ACCEPTED — no error, no warning — and changes nothing. A script using it
     runs clean, prints a full report, and measures the wrong quadrant. Only
     setTouchEmulationEnabled moves those two features. */
  if (touch) {
    await s("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await s("Emulation.setEmitTouchEventsForMouse", { enabled: true, configuration: "mobile" });
  }

  const on = (fn) => listeners.push(fn);

  const evaluate = async (expr) => {
    const r = await s("Runtime.evaluate", {
      expression: `(async () => { ${expr} })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails));
    return r.result.value;
  };

  /* THE NAVIGATION PROVES IT LANDED. Picking the target by URL at attach time
     narrowed trap 3 in README.md but did not close it: on 15.08.2026 two runs
     in six of shots.mjs and one in five of a weight measurement still came back
     with docHeight 900 and no headings — a session attached to a page that
     never became the site. Those runs do not fail, they report an empty page,
     and an empty page reads exactly like a broken one.

     One line closes it. If the document is not the URL that was asked for,
     nothing downstream is worth running. */
  const goto = async (url) => {
    /* RETRY, DO NOT JUST THROW. The failure is a race, not a broken browser:
       the attached target is still becoming chrome://new-tab-page when the
       navigate is issued, and the new tab page then wins. Navigating the same
       target again once it has settled lands correctly. Measured: run 4 of 6
       failed on the first attempt and passed on the second. */
    let href = "";
    for (let attempt = 1; attempt <= 4; attempt++) {
      const done = new Promise((res) => {
        on((m) => {
          if (m.method === "Page.loadEventFired") res();
        });
      });
      await s("Page.navigate", { url });
      await done;
      href = await evaluate(`return location.href;`);
      if (href.startsWith(url.replace(/\/$/, ""))) return;
      await new Promise((r) => setTimeout(r, 400));
    }
    throw new Error(`navigation kept landing on ${href}, expected ${url} — wrong target attached`);
  };

  const screenshot = async () => (await s("Page.captureScreenshot", { format: "png" })).data;

  const close = async () => {
    try { ws.close(); } catch {}
    proc.kill();
  };

  /* THE INSTRUMENT PROVES ITS OWN SETTING BEFORE ANYTHING IS MEASURED.
     Because setEmulatedMedia accepts hover/pointer and ignores them, a wrong
     configuration here is indistinguishable from a correct one by reading the
     script — the only tell is the page. Ask the page. Same discipline as the
     reduced-motion check: a run that cannot prove which quadrant it is in has
     no business reporting numbers from it. */
  const media = await evaluate(`
    return {
      hover: matchMedia('(hover: none)').matches ? 'none' : 'hover',
      pointer: matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine',
      rm: matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  `);
  const wantHover = touch ? "none" : "hover";
  if (media.hover !== wantHover || media.rm !== reducedMotion) {
    await proc.kill();
    throw new Error(
      `emulation did not apply: asked touch=${touch} reducedMotion=${reducedMotion}, ` +
      `page reports hover=${media.hover} pointer=${media.pointer} rm=${media.rm}`,
    );
  }

  return { s, evaluate, goto, screenshot, close, on, sessionId, media };
}

/** A wheel-driven scroll: N steps of `dy`, one animation frame apart, which is
    what Lenis + ScrollTrigger actually respond to. */
export const WHEEL = (page, { steps = 60, dy = 220, settle = 40 } = {}) =>
  page.s("Input.dispatchMouseEvent", { type: "mouseWheel", x: 700, y: 450, deltaX: 0, deltaY: dy })
    .then(async () => {
      for (let i = 1; i < steps; i++) {
        await page.s("Input.dispatchMouseEvent", { type: "mouseWheel", x: 700, y: 450, deltaX: 0, deltaY: dy });
        await new Promise((r) => setTimeout(r, settle));
      }
    });
