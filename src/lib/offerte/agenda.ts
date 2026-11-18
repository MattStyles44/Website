/**
 * Agendabestand (`.ics`, RFC 5545) bij een afspraakverzoek, voor de interne
 * mail: zo komt het verzoek met één klik in Apple Agenda (docs/processen.md).
 *
 * Het blijft een verzoek tot SignUp de afspraak persoonlijk bevestigt. Daarom
 * staat het als voorlopig (`TENTATIVE`) in de agenda, en als hele dag: voor de
 * dagdelen zijn geen vaste tijden afgesproken.
 */
import { createHash } from "node:crypto";

import { getCategorie, getDienst } from "@/content/diensten";
import { site, vestiging } from "@/content/site";
import type { Aanvraag } from "@/lib/offerte/aanvraag";

/** Het agendabestand bij een afspraakverzoek, of `undefined` zonder afspraak. */
export function maakAfspraakIcs(
  aanvraag: Aanvraag,
  opties: { nu: Date },
): string | undefined {
  const afspraak = aanvraag.afspraak;
  if (afspraak === undefined) return undefined;

  const klant =
    aanvraag.bedrijfsnaam === undefined
      ? aanvraag.naam
      : `${aanvraag.naam} (${aanvraag.bedrijfsnaam})`;
  const locatie =
    afspraak.locatie === "locatie" ? afspraak.adres : werkplaatsAdres();

  const beschrijving = [
    "Afspraakverzoek via de website. Nog niet bevestigd: bevestig de afspraak persoonlijk met de klant.",
    "",
    `Naam: ${aanvraag.naam}`,
    ...(aanvraag.bedrijfsnaam === undefined
      ? []
      : [`Bedrijfsnaam: ${aanvraag.bedrijfsnaam}`]),
    `Telefoon: ${aanvraag.telefoon}`,
    `E-mail: ${aanvraag.email}`,
    `Plaats: ${aanvraag.plaats}`,
    `Waar: ${afspraak.locatie === "locatie" ? "op locatie" : "in de werkplaats"}`,
    `Dagdeel: ${afspraak.dagdeel}`,
    `Aanvraag: ${onderwerp(aanvraag)}`,
  ].join("\n");

  const regels = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SignUp Reclame//Offerteaanvraag website//NL",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid(aanvraag, opties.nu)}`,
    `DTSTAMP:${utcStempel(opties.nu)}`,
    `DTSTART;VALUE=DATE:${datumWaarde(afspraak.datum, 0)}`,
    `DTEND;VALUE=DATE:${datumWaarde(afspraak.datum, 1)}`,
    `SUMMARY:${tekst(enkeleRegel(`Afspraakverzoek ${afspraak.dagdeel}: ${klant}`))}`,
    ...(locatie === undefined ? [] : [`LOCATION:${tekst(locatie)}`]),
    `DESCRIPTION:${tekst(beschrijving)}`,
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return regels.map(vouw).join("\r\n") + "\r\n";
}

/** De werkplaats van SignUp: de naam, met het adres als dat bekend is. */
function werkplaatsAdres(): string {
  if (vestiging === undefined) return site.naam;
  return `${site.naam}, ${vestiging.straat}, ${vestiging.postcode} ${vestiging.plaats}`;
}

/** Categorie en dienst, met hun namen uit src/content/diensten.ts. */
function onderwerp(aanvraag: Aanvraag): string {
  const categorie =
    getCategorie(aanvraag.categorie)?.naam ?? aanvraag.categorie;
  if (aanvraag.dienst === undefined) return categorie;
  const dienst =
    getDienst(aanvraag.categorie, aanvraag.dienst)?.naam ?? aanvraag.dienst;
  return `${categorie}, ${dienst}`;
}

/**
 * Een vaste UID per aanvraag en tijdstip: hetzelfde verzoek geeft hetzelfde
 * bestand, een ander verzoek of een ander tijdstip een andere UID.
 */
function uid(aanvraag: Aanvraag, nu: Date): string {
  const hash = createHash("sha256")
    .update(JSON.stringify([nu.toISOString(), aanvraag]))
    .digest("hex");
  return `afspraakverzoek-${hash.slice(0, 32)}@sign-up.nl`;
}

/** Een tijdstip in UTC: `YYYYMMDDTHHMMSSZ`. */
function utcStempel(nu: Date): string {
  return nu
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/[-:]/g, "");
}

/** Een datum `YYYY-MM-DD`, plus een aantal dagen, als `YYYYMMDD`. */
function datumWaarde(datum: string, plusDagen: number): string {
  const delen = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datum);
  if (!delen) throw new Error(`Ongeldige afspraakdatum: ${datum}`);
  const dag = new Date(
    Date.UTC(
      Number(delen[1]),
      Number(delen[2]) - 1,
      Number(delen[3]) + plusDagen,
    ),
  );
  return [
    String(dag.getUTCFullYear()).padStart(4, "0"),
    String(dag.getUTCMonth() + 1).padStart(2, "0"),
    String(dag.getUTCDate()).padStart(2, "0"),
  ].join("");
}

function enkeleRegel(tekst: string): string {
  return tekst.replace(/\s+/g, " ").trim();
}

/**
 * Een tekstwaarde volgens RFC 5545 3.3.11: `\`, `;` en `,` krijgen een
 * backslash, een regeleinde wordt `\n`. Andere stuurtekens dan een tab mogen
 * er niet in staan en worden een spatie.
 */
function tekst(waarde: string): string {
  return waarde
    .replace(/\p{Cc}/gu, (teken) => ("\t\r\n".includes(teken) ? teken : " "))
    .replace(/[\\;,]/g, (teken) => `\\${teken}`)
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Vouwt een regel (RFC 5545 3.1): geen fysieke regel is langer dan 75 octets
 * UTF-8, en elke vervolgregel begint met één spatie. Er wordt nooit midden in
 * een teken gevouwen.
 */
function vouw(regel: string): string {
  const delen: string[] = [];
  let huidig = "";
  let octets = 0;
  for (const teken of regel) {
    const lengte = utf8Lengte(teken);
    if (octets + lengte > 75) {
      delen.push(huidig);
      huidig = " ";
      octets = 1;
    }
    huidig += teken;
    octets += lengte;
  }
  delen.push(huidig);
  return delen.join("\r\n");
}

/** Het aantal octets van één teken in UTF-8 (een losse surrogaat wordt U+FFFD). */
function utf8Lengte(teken: string): number {
  const code = teken.codePointAt(0) ?? 0;
  if (code < 0x80) return 1;
  if (code < 0x800) return 2;
  if (code < 0x10000) return 3;
  return 4;
}
