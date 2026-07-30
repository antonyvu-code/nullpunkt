"use client";

import { useId, useState } from "react";
import { site } from "@/lib/site";
import { useLang } from "@/components/Lang";

type Modus = "stelle" | "projekt";
/** `sache` is the one field that changes meaning with the mode: the position in
 *  role mode, the scope of work in project mode. */
type Fields = { firma: string; email: string; sache: string; telefon: string; nachricht: string };

const EMPTY: Fields = { firma: "", email: "", sache: "", telefon: "", nachricht: "" };

/**
 * One form, two channels: A ROLE / A PROJECT.
 *
 * The page serves two readers and refuses to pick one. Someone hiring needs to
 * see that a permanent role is on the table; an agency needs to see that
 * white-label work is. A single neutral form ("get in touch") would address
 * neither — and two separate forms would make the page look undecided. So the
 * switch names both out loud and rewrites the fields, the placeholders and the
 * subject line accordingly. It is the same gesture as the EN/DE toggle in the
 * header: the page is an instrument, this is a channel selector.
 *
 * A form that hid one of the two behind a vague label would cost more than it
 * saves: the visitor has to recognise their own case in the first line, or they
 * assume the page is addressed to someone else and close it.
 *
 * Still a mailto composer, not an endpoint — the claim that the page processes
 * nothing holds in both channels.
 */
const copy = {
  en: {
    schalter: "THIS IS ABOUT",
    email: "E-MAIL",
    telefon: "PHONE",
    nachricht: "MESSAGE",
    optional: "OPTIONAL",
    required: "REQUIRED",
    send: "Compose e-mail",
    copyIdle: "Copy text instead",
    copyDone: "COPIED — PASTE IT INTO YOUR WEBMAIL",
    copyFail: "COPY FAILED — SELECT THE TEXT MANUALLY",
    hint: "The button opens your own mail programme with everything already filled in. This page sends nothing, stores nothing, sets no cookie.",
    phEmail: "name@company.com",
    phTelefon: "+49 30 1234567",
    modi: {
      stelle: {
        knopf: "A ROLE",
        legend: "ROLE ENQUIRY",
        firma: "COMPANY / TEAM",
        phFirma: "e.g. Studio Kraftwerk",
        sache: "ROLE",
        phSache: "e.g. Frontend Developer, remote",
        phNachricht: "Briefly: the team, the stack, and whether the role can be remote.",
        subject: "Frontend position",
      },
      projekt: {
        knopf: "A PROJECT",
        legend: "PROJECT ENQUIRY",
        firma: "AGENCY / COMPANY",
        phFirma: "e.g. Studio Kraftwerk",
        sache: "SCOPE",
        phSache: "e.g. Figma → code, 6 sections",
        phNachricht: "Briefly: what the project is, the scope, and roughly when it needs to be live.",
        subject: "Project enquiry",
      },
    },
  },
  de: {
    schalter: "ES GEHT UM",
    email: "E-MAIL",
    telefon: "TELEFON",
    nachricht: "NACHRICHT",
    optional: "OPTIONAL",
    required: "PFLICHT",
    send: "E-Mail zusammenstellen",
    copyIdle: "Stattdessen Text kopieren",
    copyDone: "KOPIERT — IM WEBMAIL EINFÜGEN",
    copyFail: "KOPIEREN FEHLGESCHLAGEN — TEXT MANUELL MARKIEREN",
    hint: "Der Knopf öffnet Ihr eigenes Mailprogramm, alles schon ausgefüllt. Diese Seite verschickt nichts, speichert nichts, setzt kein Cookie.",
    phEmail: "name@firma.de",
    phTelefon: "+49 30 1234567",
    modi: {
      stelle: {
        knopf: "EINE STELLE",
        legend: "STELLENANFRAGE",
        firma: "FIRMA / TEAM",
        phFirma: "z. B. Studio Kraftwerk",
        sache: "STELLE",
        phSache: "z. B. Frontend-Entwickler, remote",
        phNachricht: "Kurz: das Team, der Stack, und ob die Stelle remote möglich ist.",
        subject: "Frontend-Position",
      },
      projekt: {
        knopf: "EIN PROJEKT",
        legend: "PROJEKTANFRAGE",
        firma: "AGENTUR / FIRMA",
        phFirma: "z. B. Studio Kraftwerk",
        sache: "UMFANG",
        phSache: "z. B. Figma → Code, 6 Abschnitte",
        phNachricht: "Kurz: worum es geht, welcher Umfang, und ungefähr wann es live sein soll.",
        subject: "Projektanfrage",
      },
    },
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
      className={`accent-t group bg-bg px-4 pb-4 pt-4 focus-within:border-t-2 focus-within:border-accent md:px-5 ${className}`}
      style={{ borderTop: "2px solid transparent" }}
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
  /* Role first: that is the priority right now. The other channel is one click
     away and named, which is the whole point of showing the switch. */
  const [modus, setModus] = useState<Modus>("stelle");
  const m = t.modi[modus];
  const [f, setF] = useState<Fields>(EMPTY);
  const [status, setStatus] = useState<string>("");

  const set = (k: keyof Fields) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const plain = () =>
    [
      `${m.firma}: ${f.firma}`,
      `${t.email}: ${f.email}`,
      `${m.sache}: ${f.sache || "—"}`,
      `${t.telefon}: ${f.telefon || "—"}`,
      "",
      "———",
      "",
      f.nachricht,
    ].join("\n");

  /* Subject carries the concrete thing — the position, or the scope of work.
     It is the line read first in an inbox. */
  const subject = `${m.subject} — ${f.sache || f.firma || site.wordmark}`;

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

  const knopf = (k: Modus, text: string) => (
    <button
      key={k}
      type="button"
      onClick={() => setModus(k)}
      aria-pressed={modus === k}
      className={`accent-t hud inline-flex min-h-[44px] items-center border-b-2 px-1 transition-colors duration-300 motion-reduce:transition-none ${
        modus === k ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {text}
    </button>
  );

  return (
    <form onSubmit={submit} noValidate={false}>
      {/* The switch sits above the plate and reads as one line of instrument
          copy: "THIS IS ABOUT · A ROLE / A PROJECT". Same grammar as EN / DE. */}
      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-1">
        <p className="hud hud-wide text-muted-dim">{t.schalter}</p>
        <span className="flex items-center gap-4" role="group" aria-label={t.schalter}>
          {knopf("stelle", t.modi.stelle.knopf)}
          {knopf("projekt", t.modi.projekt.knopf)}
        </span>
      </div>

      <p className="hud hud-wide accent-t mb-3 text-accent">{m.legend}</p>

      {/* gap-px over the line colour draws the rules — the plate is one grid,
          not four bordered boxes, so the field edges meet exactly. */}
      <div
        className="grid gap-px md:grid-cols-2"
        style={{ background: "var(--line)", borderTop: "1px solid var(--line)" }}
      >
        <Cell
          id={`${uid}-firma`}
          label={m.firma}
          note={t.required}
          value={f.firma}
          onChange={set("firma")}
          placeholder={m.phFirma}
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
          id={`${uid}-sache`}
          label={m.sache}
          note={t.optional}
          value={f.sache}
          onChange={set("sache")}
          placeholder={m.phSache}
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
          placeholder={m.phNachricht}
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
