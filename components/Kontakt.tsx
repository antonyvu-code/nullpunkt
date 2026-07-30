"use client";

import { useId, useState } from "react";
import { site } from "@/lib/site";
import { useLang } from "@/components/Lang";

type Fields = { firma: string; email: string; rolle: string; telefon: string; nachricht: string };

const EMPTY: Fields = { firma: "", email: "", rolle: "", telefon: "", nachricht: "" };

/**
 * The form asks for a ROLE, not a brief.
 *
 * It used to read "PROJECT ENQUIRY · AGENCY / COMPANY · what the project is,
 * the scope, and roughly when it needs to be live" — an agency funnel on a page
 * whose header says OPEN TO FRONTEND ROLES and whose About block hands over two
 * CVs. Someone hiring read the last step of the site and found it addressed to
 * somebody else. The fields now match what the page claims to want.
 */
const copy = {
  en: {
    legend: "ROLE ENQUIRY",
    firma: "COMPANY / TEAM",
    email: "E-MAIL",
    rolle: "ROLE",
    telefon: "PHONE",
    nachricht: "MESSAGE",
    optional: "OPTIONAL",
    required: "REQUIRED",
    send: "Compose e-mail",
    copyIdle: "Copy text instead",
    copyDone: "COPIED — PASTE IT INTO YOUR WEBMAIL",
    copyFail: "COPY FAILED — SELECT THE TEXT MANUALLY",
    hint: "The button opens your own mail programme with everything already filled in. This page sends nothing, stores nothing, sets no cookie.",
    subject: "Frontend position",
    phFirma: "e.g. Studio Kraftwerk",
    phEmail: "name@company.com",
    phRolle: "e.g. Frontend Developer, remote",
    phTelefon: "+49 30 1234567",
    phNachricht: "Briefly: the team, the stack, and whether the role can be remote.",
  },
  de: {
    legend: "STELLENANFRAGE",
    firma: "FIRMA / TEAM",
    email: "E-MAIL",
    rolle: "STELLE",
    telefon: "TELEFON",
    nachricht: "NACHRICHT",
    optional: "OPTIONAL",
    required: "PFLICHT",
    send: "E-Mail zusammenstellen",
    copyIdle: "Stattdessen Text kopieren",
    copyDone: "KOPIERT — IM WEBMAIL EINFÜGEN",
    copyFail: "KOPIEREN FEHLGESCHLAGEN — TEXT MANUELL MARKIEREN",
    hint: "Der Knopf öffnet Ihr eigenes Mailprogramm, alles schon ausgefüllt. Diese Seite verschickt nichts, speichert nichts, setzt kein Cookie.",
    subject: "Frontend-Position",
    phFirma: "z. B. Studio Kraftwerk",
    phEmail: "name@firma.de",
    phRolle: "z. B. Frontend-Entwickler, remote",
    phTelefon: "+49 30 1234567",
    phNachricht: "Kurz: das Team, der Stack, und ob die Stelle remote möglich ist.",
  },
} as const;

/**
 * One field, built as a cell in the same hairline plate as the hero's OPERATOR
 * READINGS — mono label above, ink value below. Focus lights the top rule in
 * the accent, the same signal the "hot" readings carry, so an active field
 * reads as an instrument channel rather than a web form input.
 */
function Cell({
  id,
  label,
  note,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  required,
  area,
  className = "",
}: {
  id: string;
  label: string;
  note: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  area?: boolean;
  className?: string;
}) {
  // Three tones, three states, and none of them may drop below AA — the page
  // prints the claim, so the form has to hold it too:
  //   label       --muted      #8a8781  5.6:1   what the field is
  //   placeholder --muted-dim  #7c7973  4.6:1   what shape it wants (empty)
  //   typed value --ink        #f2f0eb  15:1    what you actually entered
  // --muted-dim is the floor: it is the dimmest tone on this hue that still
  // clears 4.5:1 on --surface, so a "quieter" placeholder cannot be bought.
  // The gap that makes the field enterable is therefore drawn, not tinted —
  // the rule under the control is what says "type on this line".
  const control =
    "mt-2 w-full resize-none border-x-0 border-b border-t-0 bg-transparent px-0 pb-1.5 pt-0 text-base text-ink outline-none placeholder:text-muted-dim";

  return (
    <div
      className={`accent-t border-t-2 border-transparent bg-surface px-4 pb-4 pt-3 focus-within:border-accent ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="hud text-muted">
          {label}
        </label>
        <span className="hud text-muted-dim">{note}</span>
      </div>
      {area ? (
        <textarea
          id={id}
          name={id}
          rows={6}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ borderColor: "var(--line)" }}
          className={`${control} leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ borderColor: "var(--line)" }}
          className={control}
        />
      )}
    </div>
  );
}

/**
 * Mailto composer, not a submit endpoint. The visitor's own mail client does
 * the sending, which is why the page can keep claiming it processes nothing —
 * no server action, no third party, no consent banner to earn. The clipboard
 * button is the fallback for webmail users with no mailto handler registered.
 */
export default function Kontakt() {
  const { lang } = useLang();
  const t = copy[lang];
  const uid = useId();
  const [f, setF] = useState<Fields>(EMPTY);
  const [status, setStatus] = useState<string>("");

  const set = (k: keyof Fields) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const plain = () =>
    [
      `${t.firma}: ${f.firma}`,
      `${t.email}: ${f.email}`,
      `${t.rolle}: ${f.rolle || "—"}`,
      `${t.telefon}: ${f.telefon || "—"}`,
      "",
      "———",
      "",
      f.nachricht,
    ].join("\n");

  /* Betreff trägt die Stelle, wenn sie genannt ist — sonst die Firma. Das ist
     die Zeile, die im Postfach zuerst gelesen wird. */
  const subject = `${t.subject} — ${f.rolle || f.firma || site.wordmark}`;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plain())}`;
    window.location.href = url;
  };

  const copyOut = async () => {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${plain()}`);
      setStatus(t.copyDone);
    } catch {
      setStatus(t.copyFail);
    }
  };

  return (
    <form onSubmit={submit} noValidate={false}>
      <p className="hud hud-wide accent-t mb-3 text-accent">{t.legend}</p>

      {/* gap-px over the line colour draws the rules — the plate is one grid,
          not four bordered boxes, so the field edges meet exactly. */}
      <div
        className="grid gap-px md:grid-cols-2"
        style={{ background: "var(--line)", borderTop: "1px solid var(--line)" }}
      >
        <Cell
          id={`${uid}-firma`}
          label={t.firma}
          note={t.required}
          value={f.firma}
          onChange={set("firma")}
          placeholder={t.phFirma}
          autoComplete="organization"
          required
        />
        <Cell
          id={`${uid}-email`}
          label={t.email}
          note={t.required}
          value={f.email}
          onChange={set("email")}
          placeholder={t.phEmail}
          type="email"
          autoComplete="email"
          required
        />
        <Cell
          id={`${uid}-rolle`}
          label={t.rolle}
          note={t.optional}
          value={f.rolle}
          onChange={set("rolle")}
          placeholder={t.phRolle}
        />
        <Cell
          id={`${uid}-telefon`}
          label={t.telefon}
          note={t.optional}
          value={f.telefon}
          onChange={set("telefon")}
          placeholder={t.phTelefon}
          type="tel"
          autoComplete="tel"
        />
        <Cell
          id={`${uid}-nachricht`}
          label={t.nachricht}
          note={t.required}
          value={f.nachricht}
          onChange={set("nachricht")}
          placeholder={t.phNachricht}
          required
          area
          className="md:col-span-2"
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        {/* Flare, not the borrowed accent: the primary action is the one colour
            on the page that never changes hands (see globals.css). */}
        <button
          type="submit"
          className="hud hud-wide inline-flex min-h-[48px] items-center gap-3 bg-flare px-6 text-bg transition-colors duration-300 hover:bg-ink motion-reduce:transition-none"
        >
          {t.send}
          <span aria-hidden="true">↗</span>
        </button>
        <button
          type="button"
          onClick={copyOut}
          className="hud inline-flex min-h-[48px] items-center border-b border-transparent text-muted transition-colors duration-300 hover:border-muted hover:text-ink motion-reduce:transition-none"
        >
          {t.copyIdle}
        </button>
      </div>

      <p className="hud mt-4 min-h-[1.6em] text-accent accent-t" role="status" aria-live="polite">
        {status}
      </p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-dim">{t.hint}</p>
    </form>
  );
}
