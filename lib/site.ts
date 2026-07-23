export const site = {
  name: "Nullpunkt",
  /** The person behind the lab — the site is his portfolio now. */
  owner: "Antony Vu",
  wordmark: "ANTONY VU",
  // TODO(antony): tagline is still a placeholder — you said you'll write it yourself.
  // DE strings are drafts too; refine the voice when you have a moment.
  tagline: {
    en: "Interfaces, calibrated from zero.",
    de: "Interfaces, vom Nullpunkt kalibriert.",
  },
  manifesto: {
    en: "Nullpunkt is the lab of one frontend engineer. Every project here is an experiment, and every number on this page is a real reading — no ornament, only instruments. The page boots calibrated to the first experiment's signal; point at another and it borrows that color instead.",
    de: "Nullpunkt ist das Labor eines Frontend-Engineers. Jedes Projekt hier ist ein Experiment, und jede Zahl auf dieser Seite ist ein echter Messwert — kein Zierrat, nur Instrumente. Die Seite startet kalibriert auf das Signal des ersten Experiments; zeig auf ein anderes, und sie übernimmt dessen Farbe.",
  },
  about: {
    en: "A communication designer turned frontend engineer, based in Berlin. I build interfaces where the engineering is the craft — real-time graphics, motion systems, and accessible, systemised frontends. Every project in this lab is one aesthetic solved from the structure up, usually on the newest web tech I can reach.",
    de: "Vom Kommunikationsdesigner zum Frontend-Engineer, ansässig in Berlin. Ich baue Interfaces, bei denen das Engineering das Handwerk ist — Echtzeit-Grafik, Motion-Systeme und barrierefreie, systematisierte Frontends. Jedes Projekt in diesem Labor ist eine Ästhetik, von der Struktur her gelöst — meist auf der neuesten Web-Technik, die ich erreichen kann.",
  },
  email: "atv1989.info@gmail.com",
  // TODO(antony): swap the placeholder hrefs for the real profiles + CV file.
  links: [
    { label: "GITHUB", href: "#", placeholder: true },
    { label: "LINKEDIN", href: "#", placeholder: true },
    { label: "CV (PDF)", href: "#", placeholder: true },
  ] as { label: string; href: string; placeholder?: boolean }[],
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
