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

**The accent is borrowed from the work.**
The page owns no colour. `--accent` rests on the signal of one case
([`lib/projects.ts`](lib/projects.ts) → `homeRestAccent`); pointing at another
case lends its colour to the whole chrome, and letting go returns it — slowly,
through a `[data-accent-release]` attribute that stretches the transition to 2s
([`app/globals.css`](app/globals.css), [`components/FieldNotes.tsx`](components/FieldNotes.tsx)).
Keyboard focus does exactly what the pointer does; that parity is deliberate.

**The hero is an instrument, not a picture.**
[`components/Scope.tsx`](components/Scope.tsx) draws three oscilloscope traces
over a graticule and a phosphor beam that sweeps on its own — until the pointer
enters the hero, when the beam locks under the cursor, a probe line drops, and
the readout reports POS / AMP off the wave. The baseline is measured off the
display line instead of hard-coded, so the trace never runs through the body
copy at narrow widths. A single static frame under `prefers-reduced-motion`,
and the loop parks itself when the hero leaves the viewport.

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
