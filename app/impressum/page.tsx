import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import Rechtstext, { Absatz, Block } from "@/components/Rechtstext";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung nach § 5 DDG.",
  robots: { index: false, follow: true },
};

/**
 * Anbieterkennzeichnung. Required from the moment a site is "geschäftsmäßig" —
 * and this one offers white-label work to agencies, so the private-page
 * exemption does not apply. It has to be reachable from every page in two
 * clicks, hence the footer link.
 *
 * The postal address here is a legal requirement (ladungsfähige Anschrift);
 * there is no version of this page that leaves it out. If the home address is
 * not to be published, the usual route is a c/o business address service.
 */
export default function Impressum() {
  return (
    <Rechtstext titel="Impressum" kicker="ANBIETERKENNZEICHNUNG NACH § 5 DDG">
      <Block h="Angaben gemäß § 5 DDG">
        <Absatz>
          {site.legalName}
          <br />
          {site.anschrift.strasse}
          <br />
          {site.anschrift.ort}
        </Absatz>
      </Block>

      <Block h="Kontakt">
        <Absatz>
          E-Mail:{" "}
          <a href={`mailto:${site.email}`} className="accent-t text-ink no-underline hover:text-accent">
            {site.email}
          </a>
        </Absatz>
      </Block>

      <Block h="Umsatzsteuer">
        <Absatz>
          Als Kleinunternehmer im Sinne von § 19 UStG wird keine Umsatzsteuer berechnet und daher
          auch keine Umsatzsteuer-Identifikationsnummer geführt.
        </Absatz>
      </Block>

      <Block h="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <Absatz>{site.legalName}, Anschrift wie oben.</Absatz>
      </Block>

      <Block h="Streitschlichtung">
        <Absatz>
          Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          bin ich nicht verpflichtet und nicht bereit.
        </Absatz>
      </Block>

      <Block h="Urheberrecht">
        <Absatz>
          Die auf dieser Seite gezeigten Arbeiten sind eigene Entwürfe und Umsetzungen. Zwei
          Fallstudien (Nitro, Whitepace) sind Umsetzungen frei verfügbarer Vorlagen aus der Figma
          Community; sie sind als solche gekennzeichnet und wurden nicht von mir entworfen. Die
          Studie zu Gutjahr Dachtechnik ist eine unbeauftragte Arbeit ohne Verbindung zum
          genannten Unternehmen.
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
