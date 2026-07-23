export const site = {
  name: "Nullpunkt",
  /** The person behind the lab — the site is his portfolio now. */
  owner: "Antony Vu",
  wordmark: "ANTONY VU",
  // TODO(antony): tagline is still a placeholder — you said you'll write it yourself.
  tagline: "Interfaces, calibrated from zero.",
  manifesto:
    "Nullpunkt is the lab of one frontend engineer. Every project here is an experiment, and every number on this page is a real reading — no ornament, only instruments. The page boots calibrated to the first experiment's signal; point at another and it borrows that color instead.",
  email: "atv1989.info@gmail.com",
  founded: "2026",
  footerNote: "THE LAB OF ANTONY VU",
  /** Operator readings — the 30-second recruiter block, in instrument language. */
  operator: [
    { k: "BASE", v: "BERLIN, DE" },
    { k: "LANGUAGES", v: "DE · EN · VI" },
    { k: "BACKGROUND", v: "KOMM.DESIGN → FRONTEND" },
    { k: "SHIPPED", v: "21 PROJECTS, ALL LIVE", hot: true },
    { k: "STATUS", v: "OPEN · REMOTE OR BERLIN", hot: true },
  ] as { k: string; v: string; hot?: boolean }[],
};
