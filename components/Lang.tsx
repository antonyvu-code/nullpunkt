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

/**
 * Bilingual text that an EFFECT IS ALLOWED TO REWRITE IN THE DOM.
 *
 * `<L>` renders a bare text node, and React keeps a fiber pointing at exactly
 * that node so it can write the other language into it later. GSAP's SplitText
 * does not move that node — it rebuilds the target's innerHTML from scratch
 * (SplitText.js, `_revertOriginal`: `element.innerHTML = html`). The two cannot
 * share an element: after a split, React's next write lands on a text node that
 * is no longer in the document, and the EN/DE switch silently stops working on
 * that line while every other line on the page still turns.
 *
 * The span is the seam. FX.08 splits INSIDE it, never above it, so everything
 * SplitText builds is React's to throw away — and `key={lang}` is what makes
 * React throw it away: a different key at the same position is an unmount and a
 * fresh mount, not an update, so the language change rebuilds the subtree from
 * the source string instead of trying to patch a DOM that has been rewritten
 * underneath it. AboutDepth watches `lang` and splits the new span.
 *
 * Inline, and with no class: this element must not change how the line breaks
 * fall, because the breaks are what get split. text-wrap: balance is inherited
 * and is doing the real work on the parent — see the ABOUT beats in page.tsx.
 */
export function LSatz({ text }: { text: Copy }) {
  const { lang } = useLang();
  return (
    <span key={lang} data-satz-text="">
      {lang === "de" ? text.de : text.en}
    </span>
  );
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
