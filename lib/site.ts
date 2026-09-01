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
  /*
   * THE GERMAN WAS SAYING SOMETHING ELSE — rewritten 01.09.2026, on Antony's
   * reading of it on his own phone.
   *
   * It was "Entwurf und Umsetzung sind eine Arbeit", and the fault is the
   * article. "eine Arbeit" lands as ONE PIECE OF WORK — a task, an item — and
   * from there it slides towards "that is quite a lot of work". The English
   * claims something different and much harder: that they are the SAME job, one
   * occupation rather than two roles with a handover between them. That is the
   * whole position this site takes, so the sentence that carries it cannot be
   * the one sentence that is vague about it. "dieselbe" closes it.
   *
   * AND "gestalten", NOT "entwerfen", which was the other half of the fix.
   * Entwerfen is the drafting — the Entwurf, the stage before the thing exists.
   * Gestalten is the whole act of giving something form, and it is the word for
   * what a Kommunikationsdesigner does; `manifesto` three lines below has said
   * "gestalte und baue" all along. Two different verbs for one activity, within
   * a screen of each other, would have been the page disagreeing with itself.
   * "Design" was considered and does not work: as a verb it is an anglicism, and
   * as a noun it forces the sentence back into the noun pair this rewrite is
   * getting away from.
   *
   * SINGULAR "ist", and it is not a slip. Two infinitives that name one thing
   * take the singular in German — "Lesen und Schreiben ist wichtig" — so the
   * grammar makes the same claim the sentence does. The plural would be correct
   * and would quietly argue the opposite.
   */
  tagline: {
    en: "The design and the build are the same job.",
    de: "Gestalten und Bauen ist dieselbe Arbeit.",
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
  // GitHub was hidden until there was something behind it. On 31.08.2026 there
  // is: 20 of the 29 repositories went public in one pass — the twelve cases and
  // the field notes whose sites were already live, so the code was the only part
  // still hidden. LinkedIn stays out; nothing has been built there.
  // Kept private on purpose: bewerbung, antony-vu, webdesign-digest,
  // portfolio-concepts (the working notes behind these decisions), plus the four
  // that have no live page yet and so prove nothing.
  //
  // The two CVs here are the PUBLIC cut — no postal address, no phone number.
  // The full version with both goes out as an attachment, per application:
  // an indexed page is permanent for scrapers, and an address cannot be
  // un-leaked by deleting the file. See bewerbung/cv/render.mjs --public.
  links: [
    /* "(PDF)" left these labels on 18.08.2026 and moved into a tag beside them,
       together with the file's real size — see app/page.tsx, where the size is
       read off the file at build time rather than typed here and left to drift.
       The labels say WHICH document; the tag says what it is and what it costs
       to take. */
    { label: "LEBENSLAUF (DE)", href: "/cv/lebenslauf-anh-tuan-vu.pdf" },
    { label: "CV (EN)", href: "/cv/cv-anh-tuan-vu.pdf" },
    /* GITHUB IS NOT A DOWNLOAD, so it does not get the CVs' treatment. The rule
       set on 18.08.2026 is that the glyph and the behaviour must agree: ↓ with
       `download` for a file you take, ↗ with a new tab for a place you go. The
       tag names the account rather than a file size — same job, which is to say
       where the reader lands before they click. */
    { label: "GITHUB", href: "https://github.com/antonyvu-code", extern: true, tag: "ANTONYVU-CODE" },
  ] as { label: string; href: string; placeholder?: boolean; extern?: boolean; tag?: string }[],
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

  /**
   * THE SCALE THE CHROME READS OFF — the home page's seven sections, in order.
   *
   * The header already printed SCR 022 % and DEFL 047 %: it says how far down a
   * document the reader is without ever saying what they are looking at, which
   * is a percentage on an unlabelled axis. This is the axis. The bar names the
   * section under the reading line and opens as an index, so the one element on
   * the page that is fixed to the top of the window is also the one that answers
   * "where am I" and "take me there" — navigation in the instrument's own voice
   * rather than three link words borrowed from an ordinary site header.
   *
   * S.00 IS THE HERO, AND IT IS THE ONLY ENTRY WITHOUT A SECTION ELEMENT. The
   * page numbers its sections S.01…S.07 and the hero carries no marker, because
   * the hero is not a section of the argument — it is the zero point the site is
   * named after. Numbering it 00 and pointing it at scroll 0 states that, and
   * costs nothing: it is also the way back to the top.
   *
   * The labels are the sections' OWN kickers, not a second set of names written
   * for a menu. A reader who jumps to S.05 has to land on the words the index
   * promised, or the index is describing a page that does not exist.
   */
  sections: [
    { n: "00", id: "", label: { en: "NULLPUNKT — ZERO", de: "NULLPUNKT — NULL" } },
    { n: "01", id: "selected", label: { en: "SELECTED", de: "AUSGEWÄHLT" } },
    { n: "02", id: "field-notes", label: { en: "FIELD NOTES", de: "FELDNOTIZEN" } },
    { n: "03", id: "werdegang", label: { en: "WERDEGANG", de: "WERDEGANG" } },
    { n: "04", id: "capabilities", label: { en: "CAPABILITIES", de: "FÄHIGKEITEN" } },
    { n: "05", id: "hood", label: { en: "UNDER THE HOOD", de: "UNTER DER HAUBE" } },
    { n: "06", id: "about", label: { en: "ABOUT", de: "ÜBER MICH" } },
    { n: "07", id: "contact", label: { en: "CONTACT", de: "KONTAKT" } },
  ] as { n: string; id: string; label: { en: string; de: string } }[],
};
