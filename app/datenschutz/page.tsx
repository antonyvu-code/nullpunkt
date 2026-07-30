import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import Rechtstext, { Absatz, Block, Liste } from "@/components/Rechtstext";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Welche Daten diese Seite verarbeitet — und welche nicht.",
  robots: { index: false, follow: true },
};

/**
 * Written from what the site actually does, not from a generator.
 *
 * That is short, because the site does almost nothing: no analytics, no
 * cookies, no fonts from a third party (they are bundled by next/font), no
 * embedded video, no form that posts anywhere. The one real processing is the
 * server log Vercel keeps, and the e-mail that arrives when someone uses the
 * mailto composer. Claiming less than the truth would be as wrong as claiming
 * more — so both are named.
 */
export default function Datenschutz() {
  return (
    <Rechtstext titel="Datenschutz" kicker="DATENSCHUTZERKLÄRUNG">
      <Block h="Kurz gesagt">
        <Absatz>
          Diese Seite setzt keine Cookies, bindet keine Analyse- oder Tracking-Dienste ein und lädt
          keine Schriften oder Skripte von fremden Servern. Es gibt kein Formular, das Daten an
          diese Seite sendet. Was bleibt, sind die Server-Protokolle des Hosters und die E-Mail,
          die Sie mir selbst schreiben.
        </Absatz>
      </Block>

      <Block h="Verantwortlich">
        <Absatz>
          {site.legalName}
          <br />
          {site.anschrift.strasse}
          <br />
          {site.anschrift.ort}
          <br />
          <a href={`mailto:${site.email}`} className="accent-t text-ink no-underline hover:text-accent">
            {site.email}
          </a>
        </Absatz>
      </Block>

      <Block h="Hosting und Server-Protokolle">
        <Absatz>
          Die Seite wird von der Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA
          gehostet. Beim Abruf einer Seite verarbeitet Vercel technisch notwendige Zugriffsdaten —
          IP-Adresse, Zeitpunkt, aufgerufene Adresse, übertragene Datenmenge, Browser- und
          Betriebssystemangaben. Ohne diese Verarbeitung lässt sich eine Website nicht ausliefern.
        </Absatz>
        <Absatz>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO: das berechtigte Interesse am sicheren und
          funktionsfähigen Betrieb der Seite. Die Übermittlung in die USA stützt sich auf die
          Standardvertragsklauseln in Vercels Auftragsverarbeitungsvertrag. Ich selbst greife auf
          diese Protokolle nicht zu und werte sie nicht aus.
        </Absatz>
      </Block>

      <Block h="Kontaktaufnahme">
        <Absatz>
          Das Kontaktformular auf dieser Seite sendet nichts an mich und speichert nichts. Es baut
          aus Ihren Eingaben lediglich einen Text zusammen und öffnet damit Ihr eigenes
          E-Mail-Programm; abgeschickt wird die Nachricht erst von Ihnen. Bis dahin bleiben die
          Eingaben in Ihrem Browser.
        </Absatz>
        <Absatz>
          Schreiben Sie mir, verarbeite ich die Angaben aus Ihrer E-Mail, um die Anfrage zu
          beantworten (Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO). Ich lösche die Korrespondenz,
          sobald sie nicht mehr gebraucht wird und keine gesetzliche Aufbewahrungsfrist entgegensteht.
        </Absatz>
      </Block>

      <Block h="Keine Cookies, kein Tracking">
        <Absatz>
          Es werden keine Cookies gesetzt. Gespeichert wird ausschließlich Ihre Sprachwahl (EN/DE)
          — im <code className="text-ink">localStorage</code> Ihres Browsers, damit die Seite beim
          nächsten Besuch in derselben Sprache öffnet. Diese Angabe verlässt Ihr Gerät nicht und
          lässt sich über die Einstellungen Ihres Browsers jederzeit löschen.
        </Absatz>
      </Block>

      <Block h="Externe Links">
        <Absatz>
          Die Fallstudien verlinken auf die jeweils live geschalteten Projekte (jeweils unter
          <span className="text-ink"> *.vercel.app</span>). Für den Datenschutz dort ist der
          Betreiber der verlinkten Seite verantwortlich; es handelt sich um dieselbe Infrastruktur
          wie oben beschrieben.
        </Absatz>
      </Block>

      <Block h="Ihre Rechte">
        <Liste
          punkte={[
            "Auskunft über die zu Ihnen verarbeiteten Daten (Art. 15 DSGVO)",
            "Berichtigung unrichtiger Daten (Art. 16 DSGVO)",
            "Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO)",
            "Datenübertragbarkeit (Art. 20 DSGVO)",
            "Widerspruch gegen eine Verarbeitung auf Grundlage berechtigter Interessen (Art. 21 DSGVO)",
            "Beschwerde bei einer Aufsichtsbehörde — für Berlin: Berliner Beauftragte für Datenschutz und Informationsfreiheit",
          ]}
        />
        <Absatz>
          Für all das genügt eine formlose E-Mail an die oben genannte Adresse.
        </Absatz>
      </Block>

      <p className="hud mt-16">
        <Link href="/" className="accent-t text-muted no-underline hover:text-accent">
          ← ZURÜCK ZUR STARTSEITE
        </Link>
      </p>
    </Rechtstext>
  );
}
