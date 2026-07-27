"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "de";
export type Copy = { en: string; de: string };

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

/**
 * Language state for the recruiter-facing surfaces only. Server and the first
 * client render are always EN (avoids a hydration mismatch); a saved DE
 * preference is applied after mount. Persistence is written in setLang, never
 * in an effect, so the mount-time read can't be overwritten.
 */
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("np-lang");
    if (saved === "de" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    localStorage.setItem("np-lang", l);
  };

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/** Render a bilingual string — either <L text={copy} /> or <L en="" de="" />. */
export function L({ text, en, de }: { text?: Copy; en?: string; de?: string }) {
  const { lang } = useLang();
  const pair = text ?? { en: en ?? "", de: de ?? "" };
  return <>{lang === "de" ? pair.de : pair.en}</>;
}

/** EN / DE switch for the header. */
export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <span
      className="hud accent-t pointer-events-auto -my-3 inline-flex items-center"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center ${
          lang === "en" ? "text-accent" : "text-muted hover:text-ink"
        }`}
      >
        EN
      </button>
      <span aria-hidden="true" className="opacity-30">
        /
      </span>
      <button
        type="button"
        onClick={() => setLang("de")}
        aria-pressed={lang === "de"}
        className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center ${
          lang === "de" ? "text-accent" : "text-muted hover:text-ink"
        }`}
      >
        DE
      </button>
    </span>
  );
}
