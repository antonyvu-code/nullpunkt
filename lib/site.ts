export const site = {
  name: "Nullpunkt",
  /** The person behind the lab — the site is his portfolio now. */
  owner: "Antony Vu",
  /** The name on the certificates and the CV. Stated once, in Contact, so a
      recruiter holding the Lebenslauf can tie the two together. */
  legalName: "Anh Tuan Vu",
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
  // GitHub and LinkedIn stay hidden until there is something behind them.
  // The two CVs here are the PUBLIC cut — no postal address, no phone number.
  // The full version with both goes out as an attachment, per application:
  // an indexed page is permanent for scrapers, and an address cannot be
  // un-leaked by deleting the file. See bewerbung/cv/render.mjs --public.
  links: [
    { label: "LEBENSLAUF (DE, PDF)", href: "/cv/lebenslauf-anh-tuan-vu.pdf" },
    { label: "CV (EN, PDF)", href: "/cv/cv-anh-tuan-vu.pdf" },
  ] as { label: string; href: string; placeholder?: boolean }[],
  founded: "2026",
  footerNote: "THE LAB OF ANTONY VU",
  /**
   * The stations, dates only — the question a German recruiter asks first and
   * the one a portfolio normally refuses to answer. No address, no phone: this
   * is public, the CV attachment is not.
   */
  werdegang: [
    {
      when: "03/2026 —",
      what: { en: "Nullpunkt — my own lab", de: "Nullpunkt — eigenes Labor" },
      note: {
        en: "Design and frontend, 21 sites shipped",
        de: "Design und Frontend, 21 Seiten veröffentlicht",
      },
    },
    {
      when: "10/2025 – 03/2026",
      what: {
        en: "UI/UX web design & frontend, full time",
        de: "UI/UX-Webdesign & Frontend, Vollzeit",
      },
      note: { en: "WBS Training, Berlin — 71 days", de: "WBS Training, Berlin — 71 Tage" },
    },
    {
      when: "2020 – 10/2025",
      what: {
        en: "Freelance communication designer",
        de: "Freiberuflicher Kommunikationsdesigner",
      },
      note: { en: "Berlin", de: "Berlin" },
    },
    {
      when: "2016 – 2020",
      what: { en: "Communication design", de: "Kommunikationsdesign" },
      note: { en: "HTK Akademie, Berlin — graduated", de: "HTK Akademie, Berlin — Abschluss" },
    },
    {
      when: "2008 – 2016",
      what: { en: "Hospitality", de: "Gastronomie" },
      note: { en: "Berlin — eight years on the floor", de: "Berlin — acht Jahre im Betrieb" },
    },
  ] as { when: string; what: { en: string; de: string }; note: { en: string; de: string } }[],
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
