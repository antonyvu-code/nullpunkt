export type Metric = { label: string; value: string };

export type Plate = { src: string; caption: string };

export type Project = {
  slug: string;
  index: string;
  title: string;
  year: string;
  accent: string;
  kind: string;
  role: string;
  status: string;
  stack: string[];
  oneLiner: string;
  metaLine: string;
  metrics: Metric[];
  plates: Plate[];
  sections: { heading: string; body: string[] }[];
};

/** Zero state — the page's own "no accent". Keep in sync with --accent in globals.css. */
export const zeroAccent = "#f2f0eb";

export const projects: Project[] = [
  {
    slug: "rosi-ocean-co",
    index: "01",
    title: "ROSI Ocean Co.",
    year: "2026",
    accent: "#F5901E",
    kind: "Interactive one-page site",
    role: "Design, build, i18n",
    status: "Lab — brand concept",
    stack: ["Custom .dc runtime", "Canvas 2D", "GSAP ScrollTrigger", "i18n EN/VI"],
    oneLiner:
      "An ocean-lifestyle brand told as one continuous page, where every section is an instrument you can touch.",
    metaLine: "ONE-PAGE · 6 LANG · CANVAS",
    metrics: [
      { label: "Languages", value: "6" },
      { label: "Canvas instruments", value: "3" },
      { label: "Coastal hubs", value: "12" },
      { label: "Depth scenes", value: "4" },
    ],
    plates: [
      { src: "/work/rosi-ocean-co-a.jpg", caption: "PLATE A — SONAR HERO, CANVAS INSTRUMENT" },
      {
        src: "/work/rosi-ocean-co-b.jpg",
        caption: "PLATE B — THE CHART: DRAGGABLE GLOBE, LIVE SEA CONDITIONS PER HUB",
      },
    ],
    sections: [
      {
        heading: "The experiment",
        body: [
          "One page, no sub-routes. A sonar hero with an interactive boat and fish, a draggable globe reporting real sea / wind / tide / visibility per coastal hub, a depth rail that re-lights the scene from −5 m down to −40 m, and a catch-and-dine reel that advances itself. The bet: a brand site can behave like a set of instruments instead of a stack of banners.",
        ],
      },
      {
        heading: "Constraints as material",
        body: [
          "The site runs on a custom .dc template runtime that re-renders components several times per load and re-injects head scripts. A naive GSAP include wiped every registered ScrollTrigger on each pass. The fix that shipped: load GSAP dynamically after mount, sweep orphaned inline styles with clearProps, and self-heal by rebuilding all scroll effects whenever the registry comes back empty. Offline, an IntersectionObserver fallback keeps every reveal functional.",
        ],
      },
      {
        heading: "A typography finding",
        body: [
          "Instrument Serif has no Vietnamese glyphs. Instead of dropping the language, the font stack swaps to Playfair Display at runtime when the locale switches to VI — while the logo stays pinned to Instrument Serif. Mono instrument text (coordinates, TIDE RISING, PHOTO stamps) deliberately stays English: it is the HUD language of the brand, not content.",
        ],
      },
      {
        heading: "What the lab kept",
        body: [
          "The EN-master / full-VI dictionary pattern, the discipline of real readings on screen, and the first version of the HUD language that later hardened into the Nullpunkt style guide.",
        ],
      },
    ],
  },
  {
    slug: "gutjahr-dachtechnik",
    index: "02",
    title: "Gutjahr Dachtechnik",
    year: "2026",
    accent: "#B87450",
    kind: "Client website redesign",
    role: "Redesign study, production-grade build",
    status: "Study — two versions",
    stack: ["Static HTML/CSS/JS", "GSAP + SplitText", "Lenis", "WebP pipeline"],
    oneLiner:
      "A Hannover roofing company's 2013 TYPO3 site rebuilt twice: once as “Schiefer & Kupfer”, once in a borrowed design language — same content, two systems.",
    metaLine: "CLIENT · WCAG AA · 2 VERSIONS",
    metrics: [
      { label: "Accessibility", value: "WCAG 2.1 AA" },
      { label: "Design versions", value: "2" },
      { label: "Local WebP assets", value: "8" },
      { label: "Viewports verified", value: "375–1440" },
    ],
    plates: [
      {
        src: "/work/gutjahr-dachtechnik-a.jpg",
        caption: "PLATE A — V1 SCHIEFER & KUPFER, JS-GENERATED SLATE WALL",
      },
      {
        src: "/work/gutjahr-dachtechnik-b.jpg",
        caption: "PLATE B — V2 STUDY, SAME CONTENT IN A BORROWED LANGUAGE",
      },
    ],
    sections: [
      {
        heading: "The experiment",
        body: [
          "Version one, “Schiefer & Kupfer”: slate blue-gray with a single copper accent, and a JS-generated slate-shingle wall in the hero as the signature element. All copy carried over from the old site and modernized (EnEV → GEG). Version two rebuilt the identical content in the visual language of a Framer-era site — Geist type, forest and lime, blur-in reveals — to test how far one content set stretches across two design systems.",
        ],
      },
      {
        heading: "The premium pass",
        body: [
          "GSAP and Lenis on top of plain static files: a preloader with a counter, SplitText headline reveals gated on document.fonts.ready, slate-wall parallax on scroll and mouse, magnetic buttons and a custom cursor on fine pointers only, scrub-driven timeline progress. Everything degrades: no GSAP means IntersectionObserver reveals, reduced motion means static.",
        ],
      },
      {
        heading: "The audit that changed the palette",
        body: [
          "Copper failed AA for small text. The accent was split into three calibrated tones — decoration, on-light, on-dark — instead of being softened into beige everywhere. Touch targets were padded to 44 px, a skip link added, required fields marked. The palette got stricter and the design got sharper, not blander.",
        ],
      },
      {
        heading: "What the lab kept",
        body: [
          "Progressive enhancement as a default posture, and the proof that an accessibility audit is a design tool: constraints made the copper read more intentional than the original ever did.",
        ],
      },
    ],
  },
  {
    slug: "pulse-analytics",
    index: "03",
    title: "Pulse Analytics",
    year: "2026",
    accent: "#6366F1",
    kind: "SaaS landing concept",
    role: "Design, build, motion system",
    status: "Concept — not a real product",
    stack: ["Next.js 16", "Tailwind v4", "Framer Motion 12", "GSAP ScrollTrigger"],
    oneLiner:
      "A dark SaaS landing page where one motif — the EKG pulse line — carries the logo, the dividers and the hero chart.",
    metaLine: "SAAS · NEXT 16 · MOTION",
    metrics: [
      { label: "Motion layers", value: "2" },
      { label: "Reduced-motion coverage", value: "100%" },
      { label: "Rendering", value: "SSG" },
      { label: "Motif", value: "1 pulse line" },
    ],
    plates: [
      { src: "/work/pulse-analytics-a.jpg", caption: "PLATE A — HERO, THE PULSE LINE MOTIF" },
      {
        src: "/work/pulse-analytics-b.jpg",
        caption: "PLATE B — FEATURE SECTIONS, TWO MOTION LAYERS AT REST",
      },
    ],
    sections: [
      {
        heading: "The experiment",
        body: [
          "Can a single graphic idea hold an entire page together? The pulse line runs through the logo, the section dividers and the hero chart; everything else stays quiet around it. Magnetic CTAs, draggable testimonials, morphing pricing cards and an accordion FAQ give the page its feel without adding a second voice.",
        ],
      },
      {
        heading: "Two motion layers, no overlap",
        body: [
          "Framer Motion owns micro-interactions — hover, drag, layout morphs. GSAP ScrollTrigger owns anything bound to scroll position, like the stats counters. Each library does only what it is best at, and every component honors prefers-reduced-motion individually rather than through one global kill switch.",
        ],
      },
      {
        heading: "What the lab kept",
        body: [
          "The pulse line became the studio's 2 px progress-line signature — the slow, linear needle you can see at the bottom of this page. Also the Tailwind v4 @theme token workflow that this site itself runs on.",
        ],
      },
    ],
  },
  {
    slug: "particle-field-exp-01",
    index: "04",
    title: "Particle Field EXP.01",
    year: "2026",
    accent: "#F5901E",
    kind: "WebGL experiment",
    role: "Everything — shader to HUD",
    status: "Lab — running",
    stack: ["Vite + TypeScript", "Three.js", "GSAP", "GLSL"],
    oneLiner:
      "Up to 100,000 particles morphing between a sphere, an ocean, a glyph and a vortex — at 60 fps, interruptible mid-flight.",
    metaLine: "WEBGL · 100K PTS · 60 FPS",
    metrics: [
      { label: "Particles", value: "100K" },
      { label: "Frame rate", value: "60 FPS" },
      { label: "DPR cap", value: "2" },
      { label: "Morph states", value: "4" },
    ],
    plates: [
      {
        src: "/work/particle-field-exp-01-a.jpg",
        caption: "PLATE A — STATE 01 SPHERE, LIVE HUD TELEMETRY",
      },
      { src: "/work/particle-field-exp-01-b.jpg", caption: "PLATE B — STATE 02 OCEAN, MID-CYCLE" },
    ],
    sections: [
      {
        heading: "The experiment",
        body: [
          "Four states — sphere, ocean, the ROSI glyph, vortex — auto-cycling every nine seconds, with mouse repulsion and a control panel built in the same HUD language as this site. The FPS, particle-count and DPR readouts on screen are live measurements, which set the studio rule: telemetry must be real.",
        ],
      },
      {
        heading: "Morphing on the GPU",
        body: [
          "Each particle owns two position attributes; a single uProgress uniform, tweened by GSAP with per-particle stagger, blends between them in the vertex shader. The CPU never touches positions during a morph.",
        ],
      },
      {
        heading: "Interrupt-safe by construction",
        body: [
          "Clicking mid-morph must not snap. On interrupt, the CPU freezes current positions by evaluating the same easing formula the shader uses, writes them into the “from” attribute, and retargets. The gesture stays continuous at any moment of any transition.",
        ],
      },
      {
        heading: "What the lab kept",
        body: [
          "Delta-time discipline, GSAP as the single clock for shader uniforms, and adaptive quality: coarse pointers get touch repulsion, DPR is capped at 2, reduced motion collapses morphs into short snaps.",
        ],
      },
    ],
  },
  {
    slug: "mono-architekten",
    index: "05",
    title: "MONO Architekten",
    year: "2026",
    accent: "#8A8A83",
    kind: "Architecture studio concept",
    role: "Design, build, bilingual content",
    status: "Concept — Berlin",
    stack: ["Next.js 16 App Router", "GSAP + Lenis", "Self-built i18n DE/EN"],
    oneLiner:
      "A fictional Berlin architecture studio — the Nullpunkt style with its polarity inverted: paper-white ground, ink text, one warm gray accent.",
    metaLine: "STUDIO · DE/EN · INVERTED",
    metrics: [
      { label: "Static pages", value: "26" },
      { label: "Locales", value: "2" },
      { label: "Projects dataset", value: "7" },
      { label: "Grid overlay", value: "KEY G" },
    ],
    plates: [
      {
        src: "/work/mono-architekten-a.jpg",
        caption: "PLATE A — INVERTED POLARITY HERO, BERLIN TELEMETRY",
      },
      { src: "/work/mono-architekten-b.jpg", caption: "PLATE B — PROJECT INDEX, GALERIE WEISS" },
    ],
    sections: [
      {
        heading: "The experiment",
        body: [
          "Does the studio's design DNA survive inversion? Near-white ground instead of near-black, Instrument Serif display instead of grotesque — but corner ticks, live telemetry (Berlin time, scroll, viewport), mono metadata and the 2 px progress line all stay. The answer on record: the style is a system, not a color scheme.",
        ],
      },
      {
        heading: "System",
        body: [
          "Next.js 16 App Router with a self-built [locale] segment — German default, typed dictionaries, seven bilingual projects, 26 pages statically generated. Page transitions run through an ink overlay: cover, push route, reveal, then ScrollTrigger.refresh() so scroll effects land on the new layout.",
        ],
      },
      {
        heading: "Signature detail",
        body: [
          "Press G anywhere and the 12-column grid the whole site is built on becomes visible — the architectural gesture, applied to the medium itself.",
        ],
      },
      {
        heading: "What the lab kept",
        body: [
          "A hard-won browser lesson: hidden tabs freeze requestAnimationFrame, so a router.push inside a timeline callback silently never fires. A document.hidden fallback now guards every transition — here too.",
        ],
      },
    ],
  },
  {
    slug: "oscillate",
    index: "06",
    title: "OSCILLATE",
    year: "2026",
    accent: "#FF4A1C",
    kind: "Label + radio concept",
    role: "Design, build, motion system",
    status: "Concept — running",
    stack: ["Vite + vanilla JS", "Canvas 2D waveform", "System type pairing", "HOT / COLD signal switch"],
    oneLiner:
      "An independent electronic label and 24-hour radio built to prove a single claim: a page can carry exactly one saturated colour and let that colour mean “alive”.",
    metaLine: "RADIO · SINGLE-SIGNAL · VITE",
    metrics: [
      { label: "Saturated colours", value: "1" },
      { label: "Signal contrast", value: "5.5 : 1" },
      { label: "Accent modes", value: "Hot / Cold" },
      { label: "Waveform", value: "Canvas 2D" },
    ],
    plates: [
      { src: "/work/oscillate-a.jpg", caption: "PLATE A — SINGLE-SIGNAL HERO, THE CUT LETTER" },
      { src: "/work/oscillate-b.jpg", caption: "PLATE B — THE WAVEFORM + THE ONE LIVE ROW (ACCENT = STATE)" },
    ],
    sections: [
      {
        heading: "The experiment",
        body: [
          "The 2026 two-colour trend was splitting in two: a neutral branch (black/white galleries) and a single-saturated-accent branch (one hot or cold colour on a near-black ground). OSCILLATE takes the harder, hotter side. The whole console — status bar, hero, schedule, catalogue, footer — is warm near-black and off-white, and spends its entire colour budget on one vermilion signal: the live dot, the animated waveform, one cut letter in the wordmark, hover, focus, and the single row of the schedule that is on air right now.",
        ],
      },
      {
        heading: "Accent as state, not decoration",
        body: [
          "Because the saturated colour appears in only a handful of places, the eye stops reading it as style and starts reading it as status: wherever the vermilion is, that thing is live. The 12:00 row glows and the other five stay silent — no “LIVE” label needed to do the work the colour already does. Restraint turns a hue into a free information channel.",
        ],
      },
      {
        heading: "One switch, one variable",
        body: [
          "A HOT / COLD control in the status bar swaps the signal between vermilion #FF4A1C and azure #2F6BFF. Nothing else in the system changes — the canvas waveform reads --signal from CSS at draw time, so DOM and pixels recolour from a single source of truth. It is the trend's thesis made literal: the only variable is whether the second colour runs hot or cold.",
        ],
      },
      {
        heading: "What the lab kept",
        body: [
          "The discipline of a colour budget: pick one saturated hue, verify it clears 3:1 on the ground, and never spend it on running text. Also the mono-as-connective-tissue pairing — a broadcast HUD language built entirely from system fonts, so there is no webfont to fall back from.",
        ],
      },
    ],
  },
  {
    slug: "lilypad",
    index: "07",
    title: "LILYPAD",
    year: "2026",
    accent: "#FF5A3C",
    kind: "Speculative launch site",
    role: "Concept, design, build",
    status: "Concept — running",
    stack: ["Vite + vanilla JS", "Three.js — procedural", "GSAP 3.15 + SplitText", "Lenis"],
    oneLiner:
      "A floating city for 5,000 residents, marketed like an engineered product — the whole district is generated from code, and the page around it behaves like its naval blueprint.",
    metaLine: "FLOATING CITY · 0 GLB · 183 KB",
    metrics: [
      { label: "Payload, gzipped", value: "183 KB" },
      { label: "Model files", value: "0" },
      { label: "Triangles", value: "70K" },
      { label: "Lighter than reference", value: "17×" },
    ],
    plates: [
      { src: "/work/lilypad-a.jpg", caption: "PLATE A — THE DISTRICT ON APPROACH, WIND FARM TO WINDWARD" },
      { src: "/work/lilypad-b.jpg", caption: "PLATE B — GARDENS PASS: SAILS, INSTANCED GLAZING, HARBOR RING" },
    ],
    sections: [
      {
        heading: "The experiment",
        body: [
          "Sea-level rise is usually sold as apocalypse or as a PDF. LILYPAD — after Vincent Callebaut's 2008 floating ecopolis — tries a third register: buoyant infrastructure marketed like a product you could move into. One page, one fixed WebGL canvas, and a camera that performs the sales pitch: approach, inspect the hull, climb the solar sails, cross the gardens, dock at the harbor. The scroll is the guided tour.",
          "The pattern study behind it is vectrfl.com by Utsubo — the same fixed-canvas, content-scrolls-over choreography they use to make industrial staffing feel like military logistics. LILYPAD borrows the skeleton and argues with the execution.",
        ],
      },
      {
        heading: "A city with no model files",
        body: [
          "Where the reference ships a two-megabyte Draco-compressed GLB, this district is one hundred percent procedural: seeded primitives for hulls, towers with setbacks, lathe-profile sails, turbines, boats, gulls. Around 2,500 window quads land in a single InstancedMesh — one draw call for all the glazing. The seed is fixed, so the city is identical on every visit. Total payload: 183 KB gzipped, seventeen times lighter than the reference — with zero asset pipeline.",
        ],
      },
      {
        heading: "The sheet is the interface",
        body: [
          "The layout thesis: the page is not about the city, it is the city's engineering sheet. A hairline frame with corner registration marks wraps the viewport. A mono readout in the corner streams live navigation data — heading, position, active section — derived from camera progress, so no scroll jump can ever desynchronise it. Panels are annotation callouts with leader lines and dimension values; the systems section is a bill of materials whose rows invert like selected lines on a drawing. No rounded corners anywhere. Blueprints don't have them.",
        ],
      },
      {
        heading: "What the lab kept",
        body: [
          "A silent failure mode worth remembering: Vite can pre-bundle 'gsap' and 'gsap/ScrollTrigger' into two separate cores — triggers register on one instance, tweens run on the other, and nothing errors. Import both from 'gsap/all' and check window.gsapVersions.length in doubt. Also a state rule now on the studio wall: when scroll drives UI state, derive the state from a continuous value instead of accumulating it from discrete toggle events — teleports can skip events, they cannot skip geometry.",
        ],
      },
    ],
  },
];
