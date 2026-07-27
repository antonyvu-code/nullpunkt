export const site = {
  name: "Nullpunkt",
  /** The person behind the lab — the site is his portfolio now. */
  owner: "Antony Vu",
  wordmark: "ANTONY VU",
  // TODO(antony): tagline is still a placeholder — you said you'll write it yourself.
  // DE strings are drafts too; refine the voice when you have a moment.
  tagline: {
    en: "I design and build websites — a different one each time.",
    de: "Ich gestalte und baue Websites — jede eine andere.",
  },
  manifesto: {
    en: "Nullpunkt is where I design and build websites — each its own world, solved from the structure up. Communication designer by training, frontend developer by craft: I take a site from blank page to live, and no two look alike.",
    de: "Nullpunkt ist der Ort, an dem ich Websites gestalte und baue — jede eine eigene Welt, von der Struktur her gelöst. Kommunikationsdesigner von Haus aus, Frontend-Entwickler aus Handwerk: Ich bringe eine Website von der leeren Seite bis live, und keine gleicht der anderen.",
  },
  about: {
    en: "I'm a communication designer who builds what I design. Based in Berlin, I take websites from concept to production — brand sites, interactive experiences, product landings — each with its own visual language. Design and frontend in one hand: I don't hand off, I ship the whole thing.",
    de: "Ich bin Kommunikationsdesigner und baue, was ich gestalte. Von Berlin aus bringe ich Websites vom Konzept in die Produktion — Markenseiten, interaktive Experiences, Produkt-Landingpages — jede mit eigener Bildsprache. Design und Frontend aus einer Hand: Ich übergebe nicht, ich liefere das Ganze.",
  },
  email: "atv1989.info@gmail.com",
  // Links hidden for now (empty = the Contact list renders nothing).
  // Restore when ready:
  //   GITHUB  → https://github.com/antonyvu-code  (repo currently private)
  //   LINKEDIN → <real profile URL>
  //   CV (PDF) → drop the file in public/ and point here
  links: [] as { label: string; href: string; placeholder?: boolean }[],
  founded: "2026",
  footerNote: "THE LAB OF ANTONY VU",
  /** Operator readings — the 30-second recruiter block, in instrument language. */
  operator: [
    { k: { en: "BASE", de: "STANDORT" }, v: { en: "BERLIN, DE", de: "BERLIN, DE" } },
    { k: { en: "LANGUAGES", de: "SPRACHEN" }, v: { en: "DE · EN · VI", de: "DE · EN · VI" } },
    {
      k: { en: "BACKGROUND", de: "WERDEGANG" },
      v: { en: "KOMM.DESIGN → FRONTEND", de: "KOMM.DESIGN → FRONTEND" },
    },
    {
      k: { en: "SHIPPED", de: "VERÖFFENTLICHT" },
      v: { en: "21 PROJECTS, ALL LIVE", de: "21 PROJEKTE, ALLE LIVE" },
      hot: true,
    },
    {
      k: { en: "STATUS", de: "STATUS" },
      v: { en: "OPEN · REMOTE OR BERLIN", de: "OFFEN · REMOTE ODER BERLIN" },
      hot: true,
    },
  ] as { k: { en: string; de: string }; v: { en: string; de: string }; hot?: boolean }[],
};
