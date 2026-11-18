import { describe, expect, it } from "vitest";

import { site, vestiging } from "@/content/site";
import { parseAanvraag, type Aanvraag } from "@/lib/offerte/aanvraag";
import { maakAfspraakIcs } from "@/lib/offerte/agenda";

const NU = new Date("2026-03-01T07:05:09.250Z");

const velden: Record<string, string> = {
  naam: "Anna de Boer",
  bedrijfsnaam: "De Boer, Bouw & Co",
  email: "anna@deboer.nl",
  telefoon: "06 12 34 56 78",
  plaats: "Assen",
  categorie: "gevelreclame",
  breedteCm: "400",
  hoogteCm: "80",
  afspraak: "ja",
  afspraakLocatie: "locatie",
  afspraakDatum: "2028-02-28",
  afspraakDagdeel: "middag",
  afspraakAdres: "Markt 1; achterzijde, Assen",
};

function aanvraag(extra: Record<string, string> = {}): Aanvraag {
  const resultaat = parseAanvraag({ ...velden, ...extra }, { nu: NU });
  if (!resultaat.ok) throw new Error(JSON.stringify(resultaat.fouten));
  return resultaat.aanvraag;
}

function ics(extra: Record<string, string> = {}, nu = NU): string {
  const bestand = maakAfspraakIcs(aanvraag(extra), { nu });
  if (bestand === undefined) throw new Error("Geen agendabestand.");
  return bestand;
}

/** Ontvouwt de regels (RFC 5545 3.1). */
function regels(bestand: string): string[] {
  return bestand
    .replace(/\r\n[ \t]/g, "")
    .split("\r\n")
    .filter((regel) => regel !== "");
}

function waarde(bestand: string, naam: string): string | undefined {
  const regel = regels(bestand).find(
    (r) => r.startsWith(`${naam}:`) || r.startsWith(`${naam};`),
  );
  return regel?.slice(regel.indexOf(":") + 1);
}

/** Maakt een tekstwaarde weer leesbaar (omgekeerde van RFC 5545 3.3.11). */
function leesTekst(tekst: string | undefined): string {
  return (tekst ?? "").replace(/\\([\\;,nN])/g, (_, teken: string) =>
    teken === "n" || teken === "N" ? "\n" : teken,
  );
}

describe("maakAfspraakIcs", () => {
  it("geeft niets zonder afspraakverzoek", () => {
    expect(
      maakAfspraakIcs({ ...aanvraag(), afspraak: undefined }, { nu: NU }),
    ).toBeUndefined();
    expect(
      maakAfspraakIcs(aanvraag({ afspraak: "nee" }), { nu: NU }),
    ).toBeUndefined();
  });

  it("heeft één VEVENT binnen een VCALENDAR", () => {
    const lijst = regels(ics());
    expect(lijst.slice(0, 3)).toEqual([
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      expect.stringMatching(/^PRODID:.+/),
    ]);
    expect(lijst.at(-1)).toBe("END:VCALENDAR");
    expect(lijst.filter((r) => r === "BEGIN:VEVENT")).toHaveLength(1);
    expect(lijst.filter((r) => r === "END:VEVENT")).toHaveLength(1);
  });

  it("is een voorlopige afspraak van een hele dag, met een stempel in UTC", () => {
    const lijst = regels(ics());
    expect(lijst).toContain("DTSTART;VALUE=DATE:20280228");
    expect(lijst).toContain("DTEND;VALUE=DATE:20280229");
    expect(lijst).toContain("STATUS:TENTATIVE");
    expect(lijst).toContain("DTSTAMP:20260301T070509Z");
  });

  it("rolt de einddatum door naar de volgende maand en het volgende jaar", () => {
    expect(regels(ics({ afspraakDatum: "2028-02-29" }))).toContain(
      "DTEND;VALUE=DATE:20280301",
    );
    expect(regels(ics({ afspraakDatum: "2027-04-30" }))).toContain(
      "DTEND;VALUE=DATE:20270501",
    );
    expect(regels(ics({ afspraakDatum: "2026-12-31" }))).toContain(
      "DTEND;VALUE=DATE:20270101",
    );
  });

  it("noemt dagdeel en klant in de titel, ontsnapt", () => {
    const titel = waarde(ics(), "SUMMARY") ?? "";
    expect(titel).toContain("middag");
    expect(titel).toContain("Anna de Boer");
    expect(titel).toContain("De Boer\\, Bouw & Co");
  });

  it("gebruikt het opgegeven adres voor een afspraak op locatie", () => {
    expect(waarde(ics(), "LOCATION")).toBe("Markt 1\\; achterzijde\\, Assen");
  });

  it("gebruikt de werkplaats van SignUp voor een afspraak in de werkplaats", () => {
    const locatie = leesTekst(
      waarde(ics({ afspraakLocatie: "werkplaats" }), "LOCATION"),
    );
    expect(locatie.startsWith(site.naam)).toBe(true);
    if (vestiging) {
      expect(locatie).toContain(vestiging.straat);
      expect(locatie).toContain(vestiging.postcode);
      expect(locatie).toContain(vestiging.plaats);
    }
    // Het adres van de klant hoort alleen bij een afspraak op locatie.
    expect(locatie).not.toContain("Markt 1");
  });

  it("zet contactgegevens en 'nog niet bevestigd' in de beschrijving", () => {
    const beschrijving = leesTekst(waarde(ics(), "DESCRIPTION"));
    expect(beschrijving).toContain("06 12 34 56 78");
    expect(beschrijving).toContain("anna@deboer.nl");
    expect(beschrijving).toContain("De Boer, Bouw & Co");
    expect(beschrijving).toContain("Assen");
    expect(beschrijving.toLowerCase()).toContain("nog niet bevestigd");
    expect(beschrijving).toContain("Gevelreclame & lichtreclame");
  });

  it("ontsnapt backslash, puntkomma, komma en regeleinden", () => {
    const bestand = ics({
      afspraakAdres: "Pad\\1; hoek, links\r\nachterom\nbel aan",
    });
    expect(waarde(bestand, "LOCATION")).toBe(
      "Pad\\\\1\\; hoek\\, links\\nachterom\\nbel aan",
    );
    expect(leesTekst(waarde(bestand, "LOCATION"))).toBe(
      "Pad\\1; hoek, links\nachterom\nbel aan",
    );
  });

  it("gebruikt alleen CRLF, eindigt met CRLF en vouwt op 75 octets UTF-8", () => {
    const naam = "Zoë Ündüz-Ågård 🎨 ".repeat(4).trim();
    const bestand = ics({
      naam,
      afspraakAdres: `${"Lange Straat met een heel lang adres ".repeat(4)}€ 12`,
    });
    expect(bestand.endsWith("\r\n")).toBe(true);
    expect(bestand.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
    const fysiek = bestand.split("\r\n").slice(0, -1);
    expect(fysiek.some((regel) => regel.startsWith(" "))).toBe(true);
    for (const regel of fysiek) {
      expect(new TextEncoder().encode(regel).byteLength).toBeLessThanOrEqual(
        75,
      );
      // Nooit gevouwen midden in een teken (ook niet in een emoji).
      expect(regel.isWellFormed()).toBe(true);
    }
    // Na het ontvouwen staat de naam er weer heel in.
    expect(waarde(bestand, "SUMMARY")).toContain(naam);
  });

  it("vervangt andere stuurtekens door een spatie", () => {
    const bestand = ics({ afspraakAdres: "Markt\u00001\u0007 Assen" });
    expect(waarde(bestand, "LOCATION")).toBe("Markt 1  Assen");
  });

  it("geeft hetzelfde bestand voor hetzelfde verzoek en tijdstip", () => {
    expect(ics()).toBe(ics());
  });

  it("geeft elk verzoek en elk tijdstip een eigen UID op sign-up.nl", () => {
    const uids = [
      waarde(ics(), "UID"),
      waarde(ics({ afspraakDagdeel: "ochtend" }), "UID"),
      waarde(ics({ telefoon: "0592123456" }), "UID"),
      waarde(ics({}, new Date(NU.getTime() + 1)), "UID"),
    ];
    for (const uid of uids) expect(uid).toMatch(/^[^@\s]+@sign-up\.nl$/);
    expect(new Set(uids).size).toBe(uids.length);
  });
});
