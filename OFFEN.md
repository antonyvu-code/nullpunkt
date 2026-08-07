# OFFEN — 07.08.2026

What is left, why it is left, and who decides. Every number here was measured on
this machine with puppeteer against a real Edge, not read off a guideline.

The reference points throughout are Trionn and Dragonfly, measured the same way,
same wheel input, same viewport:

| | nullpunkt | Trionn | Dragonfly |
|---|---|---|---|
| Long tasks (60-step scroll) | 4 | 8 | 3 |
| Blocked main thread | 227 ms | 694 ms | 246 ms |
| Frame p99 | 47.2 ms | 83.3 ms | 30.5 ms |
| Frames delivered | 848 | 438 | 602 |
| **CLS** | **1.342** | 1.016 | **0** |
| will-change | 1 | 1153 | 6 |
| DOM nodes | 527 | 3193 | 3154 |
| Height | 13.4 screens | 28.3 | 15.3 |

Read that table honestly: nullpunkt is quieter than Trionn largely because it is
**six times smaller**, not because it is better built. Dragonfly carries the same
node count as Trionn and still lands CLS 0 — so scale does not force jank, and
nullpunkt's 1.342 is a defect rather than the price of ambition.

---

## 1 · The home page shows 4 of 12 projects

**Biggest lever on this list, and the only one that is not a bug.**

Measured: 764 words over 13.4 screens is 65 words a screen. Trionn fills 28.3
screens with video; Dragonfly fills 15.3 with dense typography. nullpunkt fills
13.4 with 764 words and four cases, while `/work` holds twelve.

The header says OPEN TO ROLES & AGENCY WORK. Someone arriving from that line is
looking for evidence, and two thirds of the evidence is one click away rather
than in front of them. Enlarging the ABOUT type made the ratio worse, not better
— that was the right call for the claim and the wrong medicine for the density.

**Antony decides.** Which cases come forward, whether the shelf grows or a second
index appears under it, whether any of the eight uncatalogued ones deserve a
write-up. This is editorial work, not engineering.

---

## 2 · CLS 1.342 — worst of the three sites measured

**Attributed, cheap, and I was wrong to shrug at it.**

Source is `[data-plate-edge]` in `globals.css`:

```css
[data-plate-edge] { top: calc(var(--scan) * 100%); }
```

`top` is a layout property. Moving it every frame makes the browser recompute
layout every frame, and the layout-shift observer counts each move. Attribution
run isolated `span.pointer-events-none.absolute` (the plate scan line, 3–4
instances) as the dominant source; disabling the progress beam changed CLS by
0.013, so the beam is not it.

Fix is `transform: translateY()` with `container-type: size` on the aspect box so
`cqh` resolves — same picture, compositor instead of layout, and the number goes
away.

Antony chose to leave this on 07.08. **Re-raised** because the Dragonfly figure
arrived afterwards and changes the argument: 3154 nodes at CLS 0 proves this is
not something a site has to live with.

---

## 3 · 575 px of horizontal overflow

Pre-existing, not from the ABOUT work — verified by measuring the old live build
and the new one and getting the identical 575 px and 71 overflowing elements.

Source is the shelf carriage: `a.accent-t.group` inside `ul.grid`, whose parent
clips at `aspect-[16/10]` but whose own boxes extend past the viewport.

Consequence is a page that scrolls sideways — cheap to dismiss on a desktop with
a mouse, not cheap on a trackpad or a phone.

**Note for whoever picks this up:** an earlier probe of mine reported 0 px here.
That reading was taken before the FX layer had initialised and was simply wrong.
Measure after the effects are up.

---

## 4 · Long tasks not yet attributed

227 ms blocked across a 60-step scroll, p99 47.2 ms, 18 frames of 848 below
30 fps. Better than Trionn, clearly worse than Dragonfly's 30.5 ms p99.

A reduced-motion run of the same page returns **0 long tasks and CLS 0**, so all
of it is the motion layer. What is not yet known is which part. Candidates, none
tested:

- Lenis, which puts scroll on the main thread — and therefore turns any long task
  into a visibly frozen page, where native scroll would have kept moving on the
  compositor. This is why the jank *feels* worse than the numbers look.
- Two pins with `scrub: 0.7`.
- Two canvases, one 1440×789.
- `Chrome.tsx` runs a permanent `requestAnimationFrame` loop. The body is gated
  to 500 ms but the loop itself never stops — which is the floor's own SC3
  ("every rAF loop stops when it leaves the viewport") broken in the chrome.

Method that works: disable one thing at a time via `addStyleTag` on the live
build and re-measure. Do not trust a localhost-versus-live comparison; that
confound produced a bogus "0 ms" reading on 07.08.

---

## 5 · Toolchain, small and non-urgent

- **Vercel builds with pnpm 10.28, this machine runs 11.18**, both reading one
  lockfile. Green today. Pin with corepack in `package.json` before it stops
  being green.
- **Deployment Protection is on for previews.** Preview URLs need a bypass token,
  so they cannot be sent to anyone. Fine while previews are only for us.
- **`next-env.d.ts` flips** between `.next/types` and `.next/dev/types` depending
  on whether `dev` or `build` ran last. Kept out of commits by hand so far.
- **`pnpm dev` can serve stale CSS** — already written up in `CLAUDE.md`. Append
  to `globals.css` and Turbopack may not invalidate it; `rm -rf .next` first,
  before assuming a change is broken.

---

## 6 · messstrecke

`../messstrecke`, private on GitHub, `pnpm dev` on port 5631.

- Nothing stale in the README or the index — checked, both already list all three
  Versuche as built.
- Not deployed anywhere. It is an internal Prüfstand, so that is probably right —
  but it means it cannot be looked at on a phone.
- The per-word reveal in Versuch 01 chapter 06 is the technique ABOUT did **not**
  take, on cost grounds. If a cheap per-word variant is ever wanted, that is
  where the experiment lives.

---

## How we work on this

Agreed 07.08.2026, after the `--deflection` episode — where I picked up a defect
nobody had assigned, fixed it, and tripled the blocked main thread without ever
putting the trade in front of Antony:

1. Unassigned work may be **proposed**, never just done. Ask, and explain it so
   the decision can actually be made.
2. Say what I am about to do **before** doing it, not after.
3. Name what a change could make **worse**, and measure that too. Measuring only
   the intended effect confirms nothing but the intention.
4. Deep technical record goes in the repo. The conversation stays readable.
