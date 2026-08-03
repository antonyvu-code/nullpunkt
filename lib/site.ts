export const site = {
  name: "Nullpunkt",
  /** The person behind the lab — the site is his portfolio now. */
  owner: "Antony Vu",
  /** The name on the certificates and the CV. Stated once, in Contact, so a
      recruiter holding the Lebenslauf can tie the two together. */
  legalName: "Anh Tuan Vu",
  wordmark: "ANTONY VU",
  /** The lab's own name, for the one place the site signs off as the lab rather
      than as the person. Separate from `wordmark`, which the header and the
      working-name note in About both need to stay "ANTONY VU" — reusing it in
      the footer printed "ANTONY VU — THE LAB OF ANTONY VU". */
  lab: "NULLPUNKT",
  /**
   * The headline of the whole site, chosen 30.07.
   *
   * The previous line — "a different one each time" — promised variety, which
   * is a promise about style, not about worth: a reader finished it still not
   * knowing what to hire this person for. This one takes a position instead.
   * Design and build being ONE job is the rare half of the profession and the
   * thing every case below demonstrates; it also frames the handover gap as
   * the problem it is, which is the sentence an agency needs to hear.
   */
  tagline: {
    en: "The design and the build are the same job.",
    de: "Entwurf und Umsetzung sind eine Arbeit.",
  },
  manifesto: {
    en: "Nullpunkt is where I design and build websites — each its own world, solved from the structure up. Communication designer by training, frontend developer by craft: I take a site from blank page to live, and no two look alike.",
    de: "Nullpunkt ist der Ort, an dem ich Websites gestalte und baue — jede eine eigene Welt, von der Struktur her gelöst. Kommunikationsdesigner von Haus aus, Frontend-Entwickler aus Handwerk: Ich bringe eine Website von der leeren Seite bis live, und keine gleicht der anderen.",
  },
  about: {
    en: "I'm a communication designer who builds what I design. Based in Berlin, I take websites from concept to production — brand sites, interactive experiences, product landings — each with its own visual language. Design and frontend in one hand: I don't hand off, I ship the whole thing.",
    de: "Ich bin Kommunikationsdesigner und baue, was ich gestalte. Von Berlin aus bringe ich Websites vom Konzept in die Produktion — Markenseiten, interaktive Experiences, Produkt-Landingpages — jede mit eigener Bildsprache. Design und Frontend aus einer Hand: Ich übergebe nicht, ich liefere das Ganze.",
  },
  /**
   * The same statement as `about`, cut into its three beats so ABOUT can be set
   * typographically rather than as one grey block: the claim goes large, the
   * evidence stays at reading size, the promise is pulled out as a quote.
   */
  aboutLead: {
    en: "I'm a communication designer who builds what I design.",
    de: "Ich bin Kommunikationsdesigner und baue, was ich gestalte.",
  },
  aboutBody: {
    en: "Based in Berlin, I take websites from concept to production — brand sites, interactive experiences, product landings — each with its own visual language. No template, no handover gap: the thing that ships is the thing that was drawn.",
    de: "Von Berlin aus bringe ich Websites vom Konzept in die Produktion — Markenseiten, interaktive Experiences, Produkt-Landingpages — jede mit eigener Bildsprache. Kein Template, keine Übergabelücke: Was live geht, ist das, was gezeichnet wurde.",
  },
  aboutClose: {
    en: "Design and frontend in one hand: I don't hand off, I ship the whole thing.",
    de: "Design und Frontend aus einer Hand: Ich übergebe nicht, ich liefere das Ganze.",
  },
  email: "atv1989.info@gmail.com",
  /**
   * Ladungsfähige Anschrift für das Impressum (§ 5 DDG). Bewusst die
   * Privatadresse, entschieden am 30.07. — die Alternative wäre eine
   * c/o-Geschäftsadresse gewesen.
   *
   * Diese Adresse steht damit öffentlich und ist für Scraper erreichbar; die
   * beiden verlinkten Lebensläufe bleiben deshalb weiterhin der `--public`-
   * Schnitt OHNE Anschrift und Telefonnummer (siehe bewerbung/cv/render.mjs).
   * Wer sie später zurückziehen will, braucht zuerst die c/o-Adresse — Löschen
   * allein holt nichts zurück, was einmal indexiert wurde.
   */
  anschrift: {
    strasse: "Gryphiusstraße 10",
    ort: "10245 Berlin",
  },
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
        en: "Design and frontend, every site its own system",
        de: "Design und Frontend, jede Seite ein eigenes System",
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
    // Deliberately not a count. A portfolio of self-initiated work gains no
    // credibility from volume — a reviewer opens two at random and judges by
    // the weaker one, so a high number raises the odds against you. The slot
    // now carries the differentiator instead of the tally: a designer who
    // builds is the rare half of this job, and no tool list says it.
    {
      k: { en: "AUTHORSHIP", de: "URHEBERSCHAFT" },
      v: { en: "DESIGNED AND BUILT BY ONE", de: "ENTWORFEN UND GEBAUT VON EINEM" },
      hot: true,
    },
    /* Says WHAT he is open to, not just that he is open — and names BOTH
       channels, because the site is sent to agencies as well as to people
       hiring. The header carries the same line but hides below 640px, so this
       cell is the only place a phone shows it. */
    {
      k: { en: "STATUS", de: "STATUS" },
      v: {
        en: "ROLE OR AGENCY WORK · REMOTE OR BERLIN",
        de: "STELLE ODER AGENTURARBEIT · REMOTE ODER BERLIN",
      },
      hot: true,
    },
  ] as { k: { en: string; de: string }; v: { en: string; de: string }; hot?: boolean }[],
};
