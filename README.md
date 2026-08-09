# Nullpunkt

The lab and portfolio of **Antony Vu** — communication designer turned frontend
developer, Berlin. Twelve sites, each solved from its own structure, plus the
experiments that have not earned a write-up yet.

**Live:** https://nullpunkt.vercel.app

*Nullpunkt* is the zero point of a measuring instrument — the reading it shows
before anything is measured. The site is built as one: it reports live values
rather than decorating with them.

---

## What is worth reading in here

If you came to see how something is built, these are the four places where an
actual decision was made.

*(The hero entry described `components/Scope.tsx` until 09.08.2026. That
component has been unreferenced since the hero was rebuilt and is kept only for
reference — the file this section points at now is the one that ships.)*

**The accent is borrowed from the work.**
The page owns no colour. `--accent` rests on the signal of one case
([`lib/projects.ts`](lib/projects.ts) → `homeRestAccent`); pointing at another
case lends its colour to the whole chrome, and letting go returns it — slowly,
through a `[data-accent-release]` attribute that stretches the transition to 2s
([`app/globals.css`](app/globals.css), [`components/FieldNotes.tsx`](components/FieldNotes.tsx)).
Keyboard focus does exactly what the pointer does; that parity is deliberate.

**The hero is a material, not an effect.**
[`components/Passer.tsx`](components/Passer.tsx) is *Der Passer*: three printing
plates made of particles, each at its own depth in a volume. At the top of the
page they coincide exactly — same x, same y, same z — and the three additive
colours sum back to the page's own ink. That coincidence is the zero point the
site is named after, and it is a picture rather than a claim. Scroll pulls the
plates apart on all three axes at once; whichever one leaves the focal plane
swells into a soft disc, because losing register *is* losing focus.

The distinction the file is built on: an effect is applied to content and
vanishes with it, a material decides what the world is made of and everything
else follows. So the raster is not where a dot is *drawn* — it is where a dot
*wants to be*. Every particle carries its own spring constant, the swarm settles
out of step with itself, and that is the difference between a material and a
spreadsheet. The plates never rotate: real misregistration is a slip and a
fraction of a degree, not a skew.

It is Canvas 2D with a cached radial sprite, no Three.js — the first-load budget
is 500KB and this page already spends 703KB, so the one screen that has to be
right in 50ms could not afford a 3D library. The mask waits for
`document.fonts.ready`, or it rasterises the fallback face and cuts the whole
material from the wrong letterforms. The loop parks when the hero leaves the
viewport, and `prefers-reduced-motion` gets the plates slightly apart with the
swarm already settled — a composed frame, not a blank one.

**One variable runs the hero.** `--passer` is published by `Passer.tsx` and read
by everything else that cares: the title's colour fringe
([`components/Konvergenz.tsx`](components/Konvergenz.tsx), which is pure CSS and
has no JavaScript at all) and the phosphor dot riding the progress rule at the
foot of the page ([`components/Chrome.tsx`](components/Chrome.tsx)). A second
scroll trigger over the same runway would be a second source of truth for one
movement. The fringe fades *in* as the plates separate rather than the title
fading in as they land — reversing the old crossfade naively would have left the
`h1` at `opacity: 0` at the bottom of the hero, which is an invisible heading on
a page that prints WCAG 2.1 AA in its own capability list.

**One card renders live instead of from a screenshot.**
[`components/EchoProbe.tsx`](components/EchoProbe.tsx) is the ECHO-1 probe from
the *One Bit From Home* case, rebuilt with a TSL node material doing 4×4 Bayer
dithering in two tones. `three/webgpu` is imported inside `useEffect`, so the
homepage stays statically prerendered; WebGPU falls back to WebGL2 by itself.

**Numbers carry their source.**
Every figure in a case study is a `{ label, value, source }` triple — "70K
triangles" says nothing without *counted where*. The rule is enforced by the
shape of the data, not by good intentions ([`lib/projects.ts`](lib/projects.ts)).

## Craft rules the code actually follows

- **Contrast is measured, not claimed.** The muted tier sits at `#7c7973`
  because that is the dimmest tone on the hue that still clears 4.5:1 on *both*
  grounds (4.70:1 and 4.56:1). Every borrowed accent was checked against the
  ground before it shipped.
- **Reveals animate opacity, never `autoAlpha`.** `visibility: hidden` takes
  content out of the tab order *and* the accessibility tree; a presentation
  effect must not decide what exists. Focus that arrives ahead of the scroll
  reveals its block at once ([`components/Reveal.tsx`](components/Reveal.tsx)).
- **`prefers-reduced-motion` gets a designed still**, not an empty box — the
  scope, the probe and the field notes each have a posed frame.
- **Metadata is always mono, uppercase.** Three type roles, no fourth.

## Stack

Next.js 16 (App Router, every route prerendered) · React 19 · TypeScript ·
Tailwind v4 (`@theme inline`) · GSAP + ScrollTrigger · Lenis · Three.js
(WebGPU/TSL with WebGL2 fallback) · deployed on Vercel.

No CMS, no analytics, no cookie banner to earn: the contact form composes a
`mailto:` in the visitor's own client, and the page stores nothing.

## Layout of the repo

```
app/
  page.tsx            home — seven sections, S.01 … S.07
  work/page.tsx       the full index: catalogued cases + field notes
  work/[slug]/        one case study per project, statically generated
  layout.tsx          metadata, JSON-LD, fonts, language provider
components/           Scope, EchoProbe, Selected, ProjectIndex, FieldNotes,
                      Werdegang, Kontakt, Chrome, Lang, Reveal, Loader
lib/projects.ts       all case content — one source for both pages
lib/site.ts           the person, the copy, the stations (EN/DE)
```

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build, all routes prerendered
```

## Contact

Open to a permanent frontend role — remote, Berlin or the EU — and to
white-label work for agencies.

**atv1989.info@gmail.com** · [nullpunkt.vercel.app](https://nullpunkt.vercel.app)
