# OFFEN — 07.08.2026, Punkt 2 nachgetragen 08.08.2026, Punkte 3–5 13.08.2026

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

## 1 · The home page shows 6 of 12 projects — decided 13.08.2026

**Antony's call, taken 13.08:** six, ordered
`gutjahr-dachtechnik · rosi-ocean-co · one-bit · calibre · oscillate ·
mono-architekten`. Gutjahr comes back from the archive and Whitepace goes to it;
ROSI and Calibre join. The two leading cases are the two whose interesting part
is a constraint nobody chose — a real company's real site, and a template
runtime that wiped every registered ScrollTrigger on each render pass. The
specimen holds third, which is the middle of the run and the left of the middle
row. The reasoning, including the 30.07. decision this reverses, is written into
`lib/projects.ts` beside each flag rather than here.

Measured after: the pinned run is 3228px instead of 1937 (+67%, as predicted
from the card count), and the document is 15955px instead of 14664 — 1.4 screens
more page. That is the price of the density fix and it was taken knowingly; if
the run starts reading as long, `shelfOrder` is the knob, not the scrub.

The original entry follows, because the argument in it is what the decision was
made against.

### The original entry, 07.08.2026

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

*Answered above. Still open from this paragraph: whether any of the uncatalogued
Field Notes deserves a write-up.*

**And a correction to this file, 13.08.2026.** Calling this item "open" was
wrong on the day after it was written: `ZIELE.md` §7 closed the same question on
08.08 with "**không đề xuất lại**" — do not propose again. Two files said
opposite things about one decision, nobody reconciled them, and this one is the
file that was read. **When they disagree, ZIELE.md wins**, and the other file
gets corrected the moment the conflict is found. Before proposing anything that
touches the aesthetic, the structure or the scope, read `ZIELE.md` §7 and §9
first.

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

## 3 · Horizontal overflow — the item was wrong, the bug under it was real

**Closed 13.08.2026.** Two source changes, both verified below.

### The page has never scrolled sideways

`html { overflow-x: clip }` has been in `globals.css` since the first commit of
this site (`406feff`), so the sideways scroll this item predicted could not
happen. Measured on the built page: the page **cannot be scrolled sideways** —
`window.scrollTo(2000, y)` leaves `scrollX` at 0 — at 1440 and at 375.

*Corrected 14.08.2026.* This paragraph used to add "`documentElement.scrollWidth`
equals `clientWidth`", and that is not what holds. With six cases it reads 575px
wider than `clientWidth` at 1440 with motion on, and exactly equal with
reduced motion — i.e. the difference is the carriage traverse, which is the
overflowing-on-purpose content this section is about. `overflow-x: clip` stops
the axis from being scrolled; it does not shrink the reported content width.
The claim that was verified is the one now written above.

What the 575 px counted was **element** overflow inside boxes that clip on
purpose: the carriage, whose whole idea is stock running past both edges of its
window, and the capability rack, whose modules wait off the sides before the
scroll carries them in — `Rack.tsx` says so in its own header comment. At 375 px
the page carries exactly one overflowing element: an 8 px decoration 4 px past
the left edge.

So the item as written was not a defect, and the 71 elements were the effect
working. Left standing it would have cost someone a day of clipping things that
are supposed to hang over.

### What was actually broken: the browser scrolling the carriage on its own

Found while checking the above. `overflow: hidden` makes the carriage window a
scroll container that merely hides its bars — the browser stays free to scroll
it, and does, whenever it wants to bring a card into view that the traverse has
carried off the right edge. **Find-in-page is the everyday case:** Ctrl+F for a
word on a specimen that has not arrived yet.

Measured, 1440×900, built page, `scrollIntoView` on each of the four cards —
which is what find-in-page does:

| | `[data-transport].scrollLeft` | content column |
|---|---|---|
| before | 0 → 364 → 1009 → **1655**, permanent | in place |
| `overflow: clip` alone | 0 | **569 px left**, permanent |
| clip + the guard | 0 | in place |

The middle row is why the one-line fix is not the fix: clip stops the READER
scrolling an axis, it does not stop `scrollIntoView`. With the window no longer
a scroll container the browser simply walked further up and scrolled `<html>` —
which carries `overflow-x: clip` itself and still moved 569 px. The whole page
then stands 569 px left of where it belongs, for the rest of the session.

Both changes are therefore needed, and both are in:

- `globals.css`, FX.03 — `overflow: clip` on `[data-transport]`.
- `ShelfTransport.tsx` — a passive `scroll` listener on `document` and on the
  window that puts `documentElement`, `body` and the window's `scrollLeft` back
  to 0. A listener rather than a line in the focusin handler, because the
  browser's scroll-into-view is not ordered against ours.

Verified after, same instrument, `scrolled: []` in both modes:

- **Tab** through all four cards: each lands on screen at x ≈ 400, scroll runs
  3302 → 3947 → 4593 → 5238, nothing anywhere carries a scrollLeft. Unchanged
  from before the fix — the focusin handler was always doing its half correctly.
- **Find-in-page**: nothing moves, nothing is displaced.
- `track.scrollWidth - win.clientWidth` reads 1937 before and after, so the pin
  measures the same run it always did.

**What it costs, stated so it is not rediscovered as a bug:** find-in-page will
no longer travel the carriage to a specimen that is off screen. There is no
event naming the element the browser was reaching for, so the choice was between
a page that stays where it belongs and a run that silently breaks. Text on the
specimens the run has already carried past the head is still found normally.

### Method note, and it cost two wrong readings today

**The in-app browser pane does not composite.** No rAF, no rendering steps, so
scroll events are never dispatched and GSAP's scrub never advances. Anything
frame-dependent measured there is fiction: this session first "measured" the
keyboard traverse landing cards off screen and a scroll listener failing to
fire — both artefacts of a pane that was not rendering, both gone the moment the
same code ran in a headless Chromium that does. Measure timing and anything
scroll-driven in a real browser; use the pane for structure and computed style.

---

## 4 · Attributed, 13.08.2026 — and it is none of the four suspects

**The page is style-bound, not script-bound.** Of 6.17 s of main-thread task
time across a 60-step scroll, 3.11 s is style recalculation and 1.01 s is
scripting. The cause is that **`--accent` and `--deflection` are written to
`:root` on every frame**, and a custom property on the root invalidates style
for everything that could inherit it — which is the document.

Measured with the harness described below, 3 runs a condition, median, built
page, 1440×900, identical 60-step wheel input. `style/frame` is the honest
column: the conditions do not run the same number of frames.

| condition | task | style recalc | frames | style/frame | long tasks |
|---|---|---|---|---|---|
| everything on | 6.17 s | 3.11 s | 861 | **3.61 ms** | 2 |
| no `--accent` write | 5.49 s | 2.58 s | 1016 | 2.53 ms | 0 |
| no `--deflection` write | 5.72 s | 2.78 s | 949 | 2.93 ms | 0 |
| **no root custom-property writes at all** | 3.91 s | 0.44 s | 1234 | **0.36 ms** | 0 |
| Lenis destroyed, native scroll | 3.89 s | 1.93 s | 757 | 2.55 ms | 1 |
| `prefers-reduced-motion` | 0.39 s | 0.20 s | 1461 | 0.14 ms | 0 |

Per-frame writes counted over one run: `--deflection` 978, `--accent` 978,
`--passer` 135, `--schleier` 135. The first two are `AccentScroll.tsx` and run
every frame the page is scrolling.

**Neither one alone is worth removing, and that is the important line.** Drop
`--accent` and the recalc falls 30 %; drop `--deflection` and it falls 19 %; drop
both and it falls **90 %**, because whichever write is left standing invalidates
the same tree by itself. Any fix has to take both off the per-frame path or it
buys almost nothing.

### The four suspects, measured

- **Lenis** costs about a third of total task time (6.17 → 3.89 s) — but not the
  way this file guessed. Its own `raf` is **143 ms of the ticker's 2300 ms**. The
  cost is indirect: smooth scrolling produces a scroll update every frame, and
  every update walks ScrollTrigger and the scrubs behind it. Native scroll is
  cheaper because it asks for less, not because Lenis is slow.
- **The canvases are not the problem.** The hero (`Passer.tsx`) costs 3.7 ms a
  frame while it is on screen — real money — but it ran 163 frames of 861,
  i.e. it stops when it leaves the viewport exactly as SC3 requires. Removing it
  entirely did not move total task time outside noise (5.72 vs 6.17 s). Three's
  animation loop is 100 ms across the whole run.
- **The two scrubbed pins** are inside the ticker's 2300 ms, and the ticker's
  time is dominated by the style invalidation above, not by tween arithmetic.
- **`Chrome.tsx`'s permanent loop** is 42.7 ms total, 0.05 ms a frame — cheap,
  and still an SC3 violation. Worth knowing: its 500 ms-gated body carries the
  single largest one-frame spike of any loop on the page, **18.9 ms**, from the
  one `getComputedStyle` inside the gate.

### Two fixes that were tried and did NOT work

Both measured rather than reasoned about, so nobody spends the day again:

- **Quantising the writes** (`--deflection` rounded to 0.05, `--accent` written
  only on change): 3.61 → 3.31 ms/frame. Deflection genuinely changes by more
  than a step nearly every frame during a scroll, so almost nothing is skipped.
- **Pinning `--line` to a constant** — i.e. removing the one thing that reads
  `--deflection` — 3.61 → 3.24 ms/frame. So it is not the dependency that costs.
  **It is the write itself.** Chrome dirties the inheriting tree when a custom
  property changes on the root, whether or not anything reads it.

### 13.08, later the same day: it is the TRANSITIONS, and writing less does nothing

The section above says any fix has to take both writes off the per-frame path.
That was measured correctly and interpreted too narrowly. Three further runs:

- **Guarding the writes works and buys nothing.** With the guard skipping
  **989 of 996** `--deflection` writes and **973 of 996** `--accent` writes,
  style recalculation moved 3.75 → 3.28 ms/frame. Thirty writes are enough to
  keep the page fully animated, because each change starts a 450ms transition —
  2s on release — on hundreds of elements.
- **Registering the properties changes nothing.** `CSS.registerProperty` for
  `--deflection` (`<number>`, `inherits: false`) and `--accent` (`<color>`):
  3.60 vs 3.75. Option 2 below is answered — it is not the lever.
- **Turning every transition off, with all writes left in place**: 3.75 → 2.15.

So the cost is the running transitions, and the number that matters is how many
elements are in one. Measured by changing `--accent` with transitions off and
diffing every computed colour: of 920 nodes, **62 elements ever change colour**.
The rule `.accent-t *` was putting **360** of them into a colour transition.

**Shipped:** the descendant wildcard is replaced by a named list
(`[data-reg]`, `[data-plate-edge]`, the three Tailwind accent utilities, inline
`var(--accent)`), in the transition rule and in the `[data-accent-release]`
duration rule that shadows it. Verified: all 62 painters still transition, none
snap; elements carrying a live transition fall 614 → 404, colour transitions
378 → 160.

**What it bought, honestly: 2.89 → 2.74 ms/frame, long tasks 2 → 1.** Five per
cent, not the thirty-six an earlier ablation promised — and that ablation was
contaminated: injecting `.accent-t * { transition: none }` also removed the
transform/filter/opacity transitions on 222 descendants, which are hover and
reveal effects and have nothing to do with the accent. **A measurement that
disables a selector disables everything that selector carries.** The corrected
reading is that the per-element cost is small and the expensive thing is having
any transition running at all: 0 transitions is 1.69 ms/frame, 82 is ~1.9, 160
is 2.74, 378 is 2.89.

The change stays regardless of the five per cent, for a reason that is not
performance: `[data-accent-release]` set `transition-duration: 2s` through the
same wildcard, and `transition-property` initialises to `all`. Narrowing the
first rule without the second would have given 278 elements a two-second
transition on every animatable property — including the transforms GSAP writes
per frame.

### What that leaves, and it is Antony's call

The only lever that pays is getting both per-frame writes off `:root`. That is
not a mechanical change: `--deflection` is *the controlling variable* by design
(`globals.css` says so at length), and `--accent` being inherited from the root
is how the borrow reaches the whole page. Options, none taken:

1. Write them on the smallest subtree that consumes them. Cheap for
   `--deflection` if `--line` stops deriving from it — which means the hairlines
   stop breathing with the needle, and that is a look decision, not a perf one.
2. ~~Register both with `@property`.~~ **Measured 13.08: no effect** (3.60 vs
   3.75). Closed.
3. Accept it. **2.74 ms** of style a frame after the transition rule was
   narrowed leaves ~14 ms of a 60 fps budget, and the reduced-motion floor
   proves the page is correct when it matters.
4. ~~**New, and the only remaining lever with real headroom:** shorten the window
   in which anything is transitioning. `--dur-release` is 2s, and the release is
   what keeps 160 elements animating long after the reader has moved on. Halving
   it would roughly halve that window. The asymmetry between taking (450ms) and
   letting go (2s) IS the effect, so this is the same kind of decision as 1 —
   which is why it is stated here rather than taken.~~
   **CLOSED 14.08.2026 — it is not a lever, because the release never runs.**
   See §7 below. Halving `--dur-release` buys exactly zero, and there is nothing
   here for Antony to weigh: the trade this option describes does not exist.

### The harness, and what its numbers are not

`probe.mjs` in this session's scratchpad drives the Chromium that ms-playwright
already installed, over CDP, from plain Node — no puppeteer, no new dependency.
It reports Chrome's own cumulative counters plus the time spent inside every
`requestAnimationFrame` callback, bucketed by the callback's own source, and can
no-op one bucket, one property, or Lenis to ablate it. If it is worth keeping it
belongs in `../messstrecke`, not here.

- **Headless, so rAF is unthrottled** — 861 frames in 6.8 s is not what a real
  browser does. Every absolute figure above is inflated by that. The claims are
  the **ratios between conditions**, all measured on the same instrument.
- Long-task counts are still noise at this sample size (0–2 a run). They are
  reported for continuity with the table at the top of this file and nothing is
  argued from them.
- `--skip=<substring>` matches the minified callback source of **this** build.
  It will need re-reading after any dependency bump.

---

## 5 · Toolchain, small and non-urgent

- **pnpm is pinned, 13.08.2026.** `"packageManager": "pnpm@11.18.0"` in
  `package.json` — the version this machine writes the lockfile with. Vercel was
  building the same lockfile with 10.28 and will now use 11.18 through corepack.
  `pnpm install --frozen-lockfile` and `pnpm build` are both green here; the
  first deploy after this is the one to watch, because it is the first time the
  hosted build runs the new version.
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

## 7 · The 2s release never runs — measured 14.08.2026

**`--dur-release: 2s` is dead at runtime on the page as it ships.** Not rare, not
hard to reach: unreachable.

`FieldNotes.tsx` opens `release()` with

```ts
const gemessen = useFx("accent-scroll") || useFx("notes-sweep");
…
if (gemessen) return;   // before data-accent-release is ever set
```

and every FX ships **on** — `lib/fx.ts` is `Object.fromEntries(FX.map(f => [f.id, true]))`.
The switches that could turn those two off live in a panel gated to
`NODE_ENV === "development"`, and the `np-fx` storage key was deliberately
neutered (see the comment above `useState(DEFAULTS)`), so in production nothing
can flip them. `gemessen` is therefore a constant `true`, and the guard returns
every time.

Measured on the built page, 1440×900, headless Chromium, pointer driven onto a
real field-note row and then off the list:

| | |
|---|---|
| hover landed | yes — `data-zeiger` up, `--accent` `#ceb830` → `#F0A72E`, the row's own stop |
| `data-accent-release` raised | **0×** |
| total time the attribute was up | **0 ms** |
| elements that *would* carry ≥1.5s if it were raised | 122 |

On letting go, `--accent` went to `#c8ba33` — the scroll sweep's own reading,
handed straight back at the normal 450ms. Which is exactly what the comment
inside `release()` says should happen while something is measuring, and it is
right to: a 2s transition on `--accent` while the sweep writes every frame makes
the whole sweep crawl. **The guard is correct. The problem is what it leaves.**

### What that costs, and it is not performance

The perf angle closes itself (§4 option 4 above). What is left is a documentation
defect in the one file a recruiter might read:

- `README.md` — "letting go returns it — slowly, through a `[data-accent-release]`
  attribute that stretches the transition to 2s". Describes behaviour the live
  site does not have. This is inside the accent-borrowing system, one of the four
  decisions the README exists to state.
- `globals.css` line ~106 — "letting go is slower than taking. That asymmetry IS
  the effect".
- `CLAUDE.md` — "the `[data-accent-release]` attribute (set in `FieldNotes.tsx`)
  stretches that transition to 2s".
- `FieldNotes.tsx` line ~137 says "the 1.2s release rule" — a fourth number, and
  the wrong one either way.

**Antony's call, and it is a design question, not a cleanup:**

1. **Let the asymmetry go.** Delete `--dur-release`, the two rules in
   `globals.css`, the `release()` branch and `RELEASE_MS`; correct README and
   CLAUDE.md. Honest, smaller, and the site loses a stated decision.
2. **Make it run.** The release only makes sense when nothing else owns the dial,
   so this means deciding the sweep does *not* own the dial after a deliberate
   hover — e.g. hold the borrowed colour for a beat before handing back. That is
   new behaviour, not a fix, and it has to be looked at before it is believed.
3. **Keep the code, correct the prose.** Say plainly that the slow release is the
   behaviour with FX.01/FX.05 off, and that the shipping default hands the dial
   straight back. Cheapest, and leaves a documented effect nobody can see.

Nothing has been changed. Option 3 is the smallest, option 1 is the most honest,
option 2 is the only one that gets the effect onto the live page.

---

## 8 · reduced-motion and the phone, looked at — 14.08.2026

First time either was seen rather than reasoned about. Built page, headless
Chromium, nine frames down the page per condition; contact sheet and every frame
in this session's scratchpad (`shots/index.html`).

| condition | doc height | overflow-x | content present but unpainted | headings |
|---|---|---|---|---|
| 1440 · motion | 15931 | 575 ¹ | 13 (below the fold, reveals not yet fired) | 17 |
| 1440 · reduced-motion | 10677 | 0 | **0** | 17 |
| 390×844 · motion | 15339 | 0 | 13 | 17 |
| 390×844 · reduced-motion | 13035 | **0** | **0** | 17 |

**The reduced-motion build is structurally sound.** No blank boxes, no reveal
stuck at `opacity: 0`, the full document outline intact, nothing overflowing.
The page shortens because both pins stop reserving their spacers, which is the
designed behaviour and not a loss of content.

¹ `documentElement.scrollWidth - clientWidth` reads 575, not the 0 recorded in
§3. §3's claim that the page never scrolls sideways still holds — `overflow-x:
clip` means the axis cannot be scrolled — but the *reported* content width does
exceed the viewport, and it does so only with motion on, i.e. it is the carriage
traverse. §3 measured four cases; there are six now. The wording there ("equals
clientWidth") should say "cannot be scrolled", which is what was actually
verified.

### Two things to look at, both Antony's

**a · The reduced-motion hero is the OFF-REGISTER frame.** `Passer.tsx` sets
`--passer` to `0.38` under reduced motion — deliberate, and the comment says why
("a composed still: plates apart, swarm already settled"; the host also drops to
`z-index: -10` so grain does not sit on the manifesto). Measured: `--passer 0.38`,
`--schleier 0.9543`, HUD reads **`REGISTER ▸ 2.3 px · OFF REGISTER`**. With motion
on at the top of the page it reads `0.0 px · IN REGISTER`.

So the reader who has reduced motion switched on sees exactly one frame of this
hero for the whole visit, and it is the frame where the three plates do *not*
line up — on a site named for the moment they do. The still is also markedly more
saturated: at 0.38 the dot field is magenta/yellow/cyan rather than the near-mono
field of the registered frame.

**Resolved the same day — 0.38 → 0.18, Antony's call after looking at three
rendered stills.** Rendering `--passer 0` is what settled it, and it showed
something no comment in the file had recorded: at 0 the plates converge and the
wordmark becomes *legible*, whereupon it sits behind the h1 and the two lines of
type compete. That collision — not the loss of the material — is the real reason
the still had never been at 0. 0.18 dissolves the wordmark enough to stop the
competition while keeping the field close to mono.

| still | HUD | field |
|---|---|---|
| `--passer 0` | 0.0 px · **IN REGISTER** | near-mono — but the wordmark fights the h1 |
| **`--passer 0.18`** ← shipped | 0.5 px · OFF REGISTER | close to mono, wordmark dissolved |
| `--passer 0.38` (was) | 2.3 px · OFF REGISTER | saturated magenta/yellow/cyan |

Verified on the built page, three consecutive runs: `--passer 0.18`,
`--schleier 1.0000`, `document.fonts.status` loaded, HUD `REGISTER ▸ 0.5 px`.

**The name is still not illustrated in this frame, and that is knowingly bought,
not overlooked** — only 0 reads IN REGISTER and 0 costs the headline. If the
collision is ever solved another way (the material sitting further back in the
still), 0 becomes available again and 0.18 should be revisited rather than
defended. The reasoning is written into `Passer.tsx` beside the number.

**b · The wordmark breaks up at 390px.** The halftone cell does not scale with
the viewport, so NULLPUNKT is rendered by too few dots per letter and reads as
`NJLLPJ.\KT`. It is the first thing on the page and it is the site's own name.
Measured only as an emulated 390×844 viewport; on a real phone the DPR is 3, so
this may look better there — **that is the reason to test on real hardware and
not a reason to change the cell size yet.**

Everything below the hero holds up on the phone: Werdegang, the specimen stack
and the plates are all legible and well spaced, and the sections that pin on
desktop correctly have no driver under 768px.

### Still not done

**No real device, and no machine without a GPU.** These are emulated viewports in
headless Chromium on a machine that has a GPU. The 60 FPS warning in `ZIELE.md`
§10d-bis stands untouched, and so does the wordmark question above.

---

## 9 · The page could end up half reduced — fixed 14.08.2026

Found because Antony turned the Windows setting off with the tab already open,
reported the page as janky, and sent screenshots that did not add up: the hero
showed the reduced-motion still while ABOUT ran its full depth effect and clipped
749px of heading off both edges.

**Components disagreed about WHEN they read the setting.** Everything on
`gsap.matchMedia()` — Rack, ShelfTransport, AboutDepth — re-evaluates whenever
the query changes and enables or reverts its context on the spot. `Passer.tsx`
read `matchMedia(...).matches` once inside its mount effect and never again.

Measured on the built page, flipping the media feature at runtime:

| | `matchMedia` | `--passer` | `data-about-stack` | pin-spacers | docHeight |
|---|---|---|---|---|---|
| loaded reduced | true | 0.18 | `""` | 0 | 11176 |
| **flipped to motion, before** | false | **0.18** ← stuck | `"on"` | 4 | 17282 |
| **flipped to motion, after** | false | **0** → 1.0 on scroll | `"on"` | 4 | 17282 |

The hero froze in a still frame belonging to a mode the rest of the page had
left. Neither mode designs for that, and the person most likely to reach it is
the one changing the setting to see what it does.

**Fix:** `Passer.tsx` holds the answer in state, seeded from a `change` listener
on the media query, and its build effect depends on it — so a flip tears the
canvas down through the cleanup that already existed and rebuilds on the other
side. `null` until the first client effect, because there is no `window` during
the prerender and building twice would rasterise the mask twice.

Verified both directions. Motion → reduced mid-page: `--passer` 1.0000 → 0.18,
`data-about-stack` cleared, pin-spacers 4 → 0, docHeight back to 11176, HUD back
to the still. Reduced → motion: `--passer` 0.18 → 0, and 1.0000 once scrolled.

**What this corrects in §8 above:** the ABOUT heading overflowing its viewport is
**not** a reduced-motion defect. Measured at 1920 by wheeling through the whole
section: reduced motion overflows by **0px**, motion on overflows by **749px**
with `data-about-stack="on"` and a `matrix3d`. That is the depth effect at full
scale and it is what Antony was looking at. Whether 749px of a sentence running
off both edges is the intended reading of that effect is a separate question and
has not been asked.

**And a method note that cost three runs.** `scrollIntoView()` does not drive
ScrollTrigger — the first attempts to reproduce this measured `data-about-stack`
as `""` in *both* modes and concluded the state was unreachable. It was simply
never entered. Scroll with real wheel events (`Input.dispatchMouseEvent`,
`type: "mouseWheel"`) for anything scroll-driven. Measuring an element box rather
than a text line box was the other wrong turn here: overflowing text still
reports its box as fitting, so `getBoundingClientRect()` said "fits" while the
glyphs were off screen. Use a `Range`'s client rects.

---

## 10 · Open: the page is janky on a high-refresh display

Antony reported real stutter. **Measured** from a 613MB DevTools trace he
recorded scrolling the built page on his own machine — 36.4s, home page, the
first frame-timing data this project has from real hardware.

### The display is 360Hz, and the compositor is not the problem

| stream | rate | median gap | p95 | p99 | worst |
|---|---|---|---|---|---|
| `BeginFrame` (Compositor) | **360/s** | 2.78 ms | 2.81 | 2.89 | 3.9 ms |
| `DrawFrame` (Compositor) | 249/s | 2.83 ms | 11.00 | 21.10 | 413 ms |
| `Commit` (renderer main) | 205/s | 3.33 ms | 17.94 | 32.06 | 59.3 ms |

`BeginFrame` never misses once: **0 of 13,094** gaps exceed 4.17ms. The display
asks for a frame every 2.78ms and the ask arrives on time, every time. The
renderer answers 205–249 times a second. **32.2% of renderer commits overrun a
whole frame, 12.8% overrun two, 5.1% overrun six.** That gap is the stutter.

### Where the 36.4 seconds went, on the renderer main thread

| | total | count | mean | max |
|---|---|---|---|---|
| `RunTask` (all main-thread work) | **29.6 s** | 45,207 | 0.66 ms | 57.1 ms |
| `PageAnimator::serviceScriptedAnimations` | 17.4 s | 7,445 | 2.34 ms | 47.3 ms |
| `FireAnimationFrame` | 13.0 s | **30,611** | 0.42 ms | 42.0 ms |
| `UpdateLayoutTree` (style recalc) | 8.4 s | 16,998 | 0.49 ms | 33.0 ms |

**The main thread is busy 81% of the wall clock.** rAF servicing alone averages
**2.34ms against a 2.78ms frame** — the frame is over before style recalc starts.
918 tasks run 8ms or longer; the worst is 57ms, which at 360Hz is 20 frames.

### Four rAF loops, every frame

30,611 `FireAnimationFrame` over 7,445 serviced frames — **4.1 callbacks per
frame**. Named from the chunks:

| callback | chunk | what it is |
|---|---|---|
| `t` ×1750 | `2mn-…` 115KB, `gsap`/`ScrollTrigger` | the GSAP ticker |
| `l` ×875 | `0z8npx…` 41KB, `lenis`/`passer`/`deflection`/`accent` | Lenis |
| `e` ×874 | `3y99w0…` **913KB**, `THREE`/`WebGPU`/`TSL` ×58 | **EchoProbe's Three.js render loop** |
| `L` ×486 | a chunk since rebuilt away | — |

EchoProbe is one decorative card and it is re-rendering a WebGPU scene at
display rate on a 360Hz monitor.

### The expensive recalcs are whole-document recalcs

The 40 worst style recalcs cost **716ms between them and touch 1,191 elements
each** — essentially the entire document, repeatedly. 1,191 is the signature of a
custom property written on `:root`, which is exactly the lever §4 named and left
open: `--accent` and `--deflection` (and `--passer`/`--schleier`) are written
there every frame, so every write invalidates everything that inherits them.

**Read the "what ran immediately before" attribution with care.** Style recalc
runs once per frame after all rAF callbacks, so whichever callback happened to be
last gets blamed — Three.js taking 21 of 40 says it usually runs last, not that
it dirties the tree. What dirties 1,191 elements is the `:root` write.

### What this changes

**At 60Hz none of this would show.** Mean renderer commit is 3.33ms against a
16.7ms budget. The site is comfortable on the hardware every number in this file
was taken against, and comes apart at 360Hz. That is the finding: not a
regression, a hidden assumption.

### It only stutters with reduced motion ON — which inverts the diagnosis

Antony's next report: the page is smooth with animations on and janky with them
off. That is the mode where nearly everything is supposed to stand down, so it
had to be measured rather than reasoned about. Instrumented by patching `rAF`
*before* any app script, so loops that capture the global at module init are
caught too:

| with reduced motion ON | before | after |
|---|---|---|
| rAF callbacks still running | 281/s across four loops | 286/s |
| time inside the GSAP ticker | 277 ms / 5.8 s | **119 ms** |
| all rAF callback time | 5.8% of wall | **2.9%** |
| `--accent` / `--deflection` written to `:root` | 29/s | **19/s** |

**Two things were wrong.** The `gsap.ticker.fps()` cap had been written *below*
`SmoothScroll`'s reduced-motion bail-out, so it never applied in the one mode it
was needed — the ticker is a global that AccentScroll and everything else gsap
drives are added to, whether or not Lenis exists. And `SmoothScroll` still had
the one-time `matchMedia` read that §9 fixed in `Passer`, so a page loaded under
reduced motion never started Lenis even after the setting was turned off, leaving
`gsap.matchMedia` scrubs running against raw native scroll. Both fixed.

**Why OFF feels worse than ON despite doing less work.** With Lenis the scroll is
interpolated, so a late frame is absorbed into the smoothing and the reader does
not see it. Without Lenis the scroll is native and direct: the compositor could
have handled it alone, but `--accent` and `--deflection` are still being written
to `:root` on every tick, and each of those invalidates the whole document. Every
main-thread hitch lands straight in the scroll. **Less work, more visible.**

**Two loops were measured and deliberately left alone.** `Chrome.tsx`'s costs
0.004ms per call, and it is the thing counting frames for the HUD's own FPS
readout — capping it would make that readout lie about exactly what is being
measured. Three's internal `Animation` keeps requesting frames after
`setAnimationLoop(null)` and costs 0.006ms per call; stopping it means reaching
into a private field. Neither is worth it at those numbers.

**Still unproven:** whether any of this is *felt* at 360Hz. Headless tops out
around 174–286fps and cannot report frame pacing (§2). The proof is a second
trace from Antony's machine — compare renderer `Commit` (was 205/s, 32.2% over
budget), mean `serviceScriptedAnimations` (was 2.34ms) and tasks ≥8ms (was 918).

### Second trace, and the sweep stood down

Antony recorded a second trace after the cap: *"less janky than before, but
still janky."* The numbers moved a long way and then stopped short.

| | trace 1 (11:33) | trace 2 (12:44) |
|---|---|---|
| main thread busy | 81.5% of wall | **22.8%** |
| `serviceScriptedAnimations` mean | 2.343 ms | **0.280 ms** |
| style recalcs | 16,998 | **1,923** |
| tasks ≥ 8ms | 918 | **57** |
| renderer `Commit` over 4.17ms | 32.2% | **3.2%** |
| renderer `Commit` rate | 205/s | **339/s** at a 2.77ms median |

**Read those as direction, not as a controlled comparison** — trace 1 was
recorded with motion running and trace 2 with reduced motion, so they are not
the same page. A clean pair would be two traces in one mode.

What was left: 57 tasks of 8ms or more with a **39ms** worst case — 14 dropped
frames at 360Hz, which is visible — and the 40 costliest recalcs still touching
**1,173 elements each**. That is the whole document, and it is the price of a
`:root` custom property: 1,173 elements inherit `--accent`, so every write
re-checks all of them. Under reduced motion it was still being written 19 times
a second.

**Antony's call: the accent sweep stands down under `prefers-reduced-motion`.**
The reasoning is worth keeping, because the sweep is not an obvious member of
that family — nothing about it moves. A colour changing continuously as the
reader scrolls is still something changing without them asking each time, which
is what the setting is for.

| with reduced motion ON | original | after the cap | **after standing down** |
|---|---|---|---|
| `--accent` / `--deflection` writes | 29/s | 19/s | **0/s** |
| all rAF callback time | 5.8% of wall | 2.9% | **0.9%** |

Motion mode measured unchanged: pins 4, `--passer` 1.0000, 65 writes/s, 22.8%.
**The pointer still works in both modes** — verified with reduced motion on:
accent at rest `#FF4A1C`, hovering a field note borrows `#F0A72E`, exactly the
row's own stop, and it returns to rest afterwards. Only the *scroll-driven*
borrow stops; a reader who points at something still gets an answer.

### A harness trap worth more than the fix

Every "motion on" run was silently measuring a reduced-motion page, because
Antony had left Windows' animation effects switched off and headless Chromium
inherits the host setting — the launch flag only ever adds `reduce`, never its
opposite. It showed up as `pins 0` and `--passer` parked at the still in a run
that had asked for full motion, which reads exactly like the change having
broken the site. `scripts/cdp.mjs` now states the preference in both directions
with `Emulation.setEmulatedMedia`. **Never infer a media state from the absence
of a flag.**

---

## 11 · The remaining jank is a hovering pointer, not the page — 14.08.2026

Antony, after the sweep stood down: *"still worst at FIELD NOTES; the other
sections maybe slightly and I can't tell for sure."* A third trace, recorded in
reduced motion, said the main thread was no longer the problem at all:

| trace 3 (19:06), 24.7s | |
|---|---|
| main thread busy | **6.1%** of wall |
| `serviceScriptedAnimations` mean | **0.093 ms** |
| style recalcs | **36**, 72 elements, **4 ms total** |
| tasks ≥ 8ms | **1**, and it is `CpuProfiler::StartProfiling` — the recorder |
| renderer `Commit` over 4.17ms | **1.9%** |

There are only 395 input events in those 24.7s, so most of the recording is
idle and the aggregate `DrawFrame` rate (7/s) means nothing. The page is doing
almost nothing, and it still stutters. So the cost is not JavaScript.

### It is the pointer sitting in the list while the rows scroll past it

Chrome's own tracing, run over one section at a time, 2.8s of wheel scrolling
each, reduced motion:

| section | pointer parked in the corner | pointer inside the section |
|---|---|---|
| | paint / recalc | paint / recalc |
| selected | 5.0 / 0.8 ms | **290.4 / 232.2 ms** |
| **field-notes** | 5.0 / 0.6 ms | **188.6 / 141.6 ms** |
| werdegang | 5.6 / 0.7 ms | 6.2 / 0.9 ms |
| capabilities | 5.0 / 0.7 ms | 6.0 / 0.9 ms |
| hood | 3.9 / 0.6 ms | 3.8 / 0.6 ms |
| about | 3.1 / 0.5 ms | 3.3 / 0.5 ms |

**Only the two sections with hover effects on large elements move, and they move
by 30–60×.** The other four do not notice the pointer at all — which is exactly
the shape of Antony's report. The mechanism: the cursor is still, the rows
travel under it, and each row entering and leaving `:hover` costs a style
invalidation and a repaint of a very large box.

This is not a reduced-motion problem. `motion-reduce:transition-none` stops the
transition; the state change still repaints. With motion on it is worse, because
then the transitions actually run.

**Why nothing found it earlier:** it is not main-thread JavaScript, and it only
appears when the pointer is inside the scrolling area. Every automated run in
this file had the pointer parked in a corner.

### Making hover cheaper does not work — measured, four conditions

| condition | paint | recalc | layerize |
|---|---|---|---|
| as shipped | 229.1 | 215.9 | 34.2 |
| accent colour change neutralised | 210.5 | 187.9 | 32.3 |
| translate neutralised | 223.7 | 208.0 | 33.4 |
| **both neutralised** | **206.8** | **178.9** | **31.2** |

Killing the colour change buys ~13% of the recalc, the translate ~4%, both
together ~17% — and **90% of the cost survives**. Every ablation was asserted
while hovering before its number was believed: the neutralised colour reads
`rgb(138, 135, 129)`, the neutralised transform reads `none`.

So the expense is not what hover *does*, it is that `:hover` *changes*. Tailwind
compiles `group-hover:` to `.group:hover .child`, so every toggle invalidates the
subtree to be re-matched whether or not any computed value ends up different. An
`!important` override changes the value, not the need to go and look.

**Which leaves one lever: stop `:hover` from resolving while the wheel is
moving** — `pointer-events: none` during scroll, restored shortly after it
stops. The cost is that scrolling past a case no longer borrows its colour; with
motion on the sweep already does that job, and under reduced motion Antony has
just decided the accent should not follow the scroll at all. Not implemented.

### Three harness faults found while measuring this, all now fixed

Each one produced a run that read as "the site is broken":

1. **The launcher attached to `chrome://new-tab-page/`.** `Target.getTargets`
   returns it as a page target, so taking the first one got the new tab about
   one run in three: `docHeight` 900, no sections, every reading empty. Now the
   filter prefers a non-`chrome://` target. Passing `about:blank` as a launch
   argument to guarantee one was tried and **hung**; the fallback is to take
   whatever page exists.
2. **The motion preference was only ever stated in one direction.** The launch
   flag adds `reduce` and nothing removes it, so with the flag absent headless
   inherits the host — and Antony had left Windows' animation effects off. Every
   "motion on" run was silently measuring a reduced-motion page. Now set
   explicitly both ways via `Emulation.setEmulatedMedia`.
3. **The page sometimes does not render for ~15s after load.** Cause not found.
   Runs now retry rather than reporting a zero, because a failed lookup and a
   real zero are indistinguishable in a results table — the first pass of the
   ablation above lost its baseline row this way and the surviving numbers would
   have been read as a result.

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
