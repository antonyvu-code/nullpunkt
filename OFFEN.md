# OFFEN — 07.08.2026, Punkt 2 nachgetragen 08.08.2026

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
| **CLS** | **1.342** → 0.016 ¹ | 1.016 | **0** |
| will-change | 1 | 1153 | 6 |
| DOM nodes | 527 | 3193 | 3154 |
| Height | 13.4 screens | 28.3 | 15.3 |

Read that table honestly: nullpunkt is quieter than Trionn largely because it is
**six times smaller**, not because it is better built. Dragonfly carries the same
node count as Trionn and still lands CLS 0 — so scale does not force jank, and
nullpunkt's 1.342 is a defect rather than the price of ambition.

¹ CLS is the one figure that has moved since. Section 2 has the fix and the
numbers; the arrow is headless-to-headless, the 1.342 in the row is the original
headed run, and the two are not the same instrument. Every other cell is
untouched.

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

## 2 · CLS — fixed 08.08.2026, and the 07.08 attribution was wrong

**CLS 1.42 → 0.016.** Uncommitted, in `components/fx/ShelfTransport.tsx`.

### What it actually was

The FX.03 pin. `pin: true` on the body scroller defaults to `pinType: "fixed"`,
so at the pin's start ScrollTrigger switches `[data-transport]` from
`position: relative` to `position: fixed`, and back at the end. The layout-shift
observer sees a 1210×900 box — 82 % of the viewport — disappear and reappear
(`previousRect 0,0,0,0` → `1210×900`) and scores both moves.

Measured on the built page, 1440×900, the same 60-step wheel input:

| t | value | what changed |
|---|---|---|
| 5220 ms | 0.583 | `position: relative` → `fixed` (pin engages) |
| 6029 ms | 0.828 | `fixed` → `relative` (pin releases) |

1.4186 of a total 1.4371 — **98.7 %**. Everything else on the page together is
0.018.

### Why 07.08 named the wrong element

`[data-plate-edge]` is **0.0245**, not the cause. A `layout-shift` entry lists
*every* element that moved in that frame as a source, so summing per source
charges one 0.83 shift to the scan line, the progress beam and the transport
window alike — three "dominant" sources for one event. That is also why
disabling the beam moved the number by 0.013 and the conclusion "so the beam is
not it" felt contradictory: the beam was never it either.

**Attribute per ENTRY, with its rects, never per summed source.**

### The fix

`pinType: "transform"` on the shelf's ScrollTrigger. The element stays in flow
in the same pin-spacer and is translated instead of re-positioned; transforms
are excluded from layout shift by definition, so the two entries stop existing
rather than getting smaller.

Verified the pin is unchanged, not just quieter: through the traverse the
window's viewport `y` holds at exactly 0 while `scrollY` runs 1359 → 1696 and
the transform grows to match (361, 381, 415 …); `position` reads `relative` at
every sample and never `fixed`; travel still ends at `-1936`; document height
is 12063 before and after, so both pin-spacers are intact.

### What it costs

The pinned element now carries a transform, which makes it the containing block
for any `position: fixed` descendant — the trap this file's own FX.03 comment
documents, pointed the other way. Checked: nothing inside `[data-transport]` is
fixed; the header and the progress rule are siblings of `#main`. Anything fixed
put inside the shelf later will hang off this element instead of the viewport.

### What is left, and it is small

The remaining 0.016 is `[data-plate-edge]`'s `top` (0.0245 gross) and the
progress beam's `left` in `Chrome.tsx` — both still layout properties driven per
frame / twice a second. Under Google's 0.1 "good" line, so **not done, and not
proposed as urgent**. Antony's call.

### Method note — read before trusting a number in this file

- **Headed Edge cannot be driven on this machine.** A session is always running
  and every headed launch hands off to it and exits 0, `--user-data-dir` or not.
  These runs are **headless** Edge 151. Absolute values are therefore not
  comparable with the headed table at the top of this file; before and after
  were measured identically, and only that comparison is claimed.
- **Frame metrics are unusable headless.** rAF runs unthrottled — the harness
  reported 250–280 fps. Ignore p99, frames delivered and frames-under-30fps from
  any headless run.
- **Long tasks are noise-dominated here.** Across four batches of three runs the
  same build swung between 3 and 23 long tasks and 58–554 ms blocked, in both
  directions. No claim is made that this fix changed them. CLS, by contrast, sat
  at 1.401–1.440 without the fix and 0.0145–0.0188 with it across twelve runs.
- **`next start` survives `pkill` from the Bash tool.** A stale server kept port
  3000 while `.next` was rebuilt underneath it, served a 500 for a chunk that no
  longer existed, and produced a run with no GSAP at all — which reads exactly
  like "the fix killed the effect". Kill by port via `Get-NetTCPConnection` and
  check `--reg` is 1 before believing any before/after.

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
