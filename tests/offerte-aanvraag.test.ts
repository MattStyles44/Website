import { describe, expect, it } from "vitest";

import {
  isKalenderdatum,
  leesGetal,
  parseAanvraag,
  type Aanvraag,
  type Velden,
} from "@/lib/offerte/aanvraag";
import { isGroteKlus } from "@/lib/offerte/kwalificatie";

const NU = new Date("2026-03-15T23:30:00Z");

const contact: Velden = {
  naam: "Anna de Vries",
  email: "anna@bedrijf.nl",
  telefoon: "050-1234567",
  plaats: "Assen",
};

const gevel: Velden = {
  ...contact,
  categorie: "gevelreclame",
  breedteCm: "300",
  hoogteCm: "60",
};

function geldig(velden: Velden): Aanvraag {
  const resultaat = parseAanvraag(velden, { nu: NU });
  if (!resultaat.ok) {
    throw new Error(`onverwachte fouten: ${JSON.stringify(resultaat.fouten)}`);
  }
  return resultaat.aanvraag;
}

function fouten(velden: Velden): Record<string, string> {
  const resultaat = parseAanvraag(velden, { nu: NU });
  if (resultaat.ok) throw new Error("verwacht fouten");
  return resultaat.fouten;
}

describe("leesGetal", () => {
  it("leest punt en komma als decimaalteken", () => {
    expect(leesGetal("250,5")).toBe(250.5);
    expect(leesGetal("250.5")).toBe(250.5);
    expect(leesGetal(" 80 ")).toBe(80);
    expect(leesGetal("-3")).toBe(-3);
  });

  it("weigert alles wat geen getal is", () => {
    for (const tekst of ["", "drie", "1,5,5", "1e3", "12 cm", "0x10", ","]) {
      expect(leesGetal(tekst), tekst).toBeUndefined();
    }
  });
});

describe("isKalenderdatum", () => {
  it("herkent echte datums", () => {
    expect(isKalenderdatum("2028-02-29")).toBe(true);
    expect(isKalenderdatum("2026-12-31")).toBe(true);
  });

  it("weigert niet-bestaande datums en andere vormen", () => {
    for (const tekst of [
      "2027-02-29",
      "2026-13-01",
      "2026-04-31",
      "1-12-2026",
    ]) {
      expect(isKalenderdatum(tekst), tekst).toBe(false);
    }
  });
});

describe("parseAanvraag: algemene velden", () => {
  it("laat lege optionele velden weg in plaats van een lege tekst", () => {
    const aanvraag = geldig({
      ...contact,
      categorie: "ontwerp",
      bedrijfsnaam: "   ",
      toelichting: "",
      dienst: " ",
    });
    expect(aanvraag).not.toHaveProperty("bedrijfsnaam");
    expect(aanvraag).not.toHaveProperty("toelichting");
    expect(aanvraag).not.toHaveProperty("dienst");
    expect(aanvraag).not.toHaveProperty("afspraak");
    expect(Object.values(aanvraag)).not.toContain("");
  });

  it("trimt alle tekst", () => {
    const aanvraag = geldig({
      naam: "  Anna  ",
      email: " anna@bedrijf.nl ",
      telefoon: " 0612345678 ",
      plaats: " Assen ",
      bedrijfsnaam: " De Vries BV ",
      categorie: " ontwerp ",
      dienst: " dtp ",
    });
    expect(aanvraag).toMatchObject({
      naam: "Anna",
      email: "anna@bedrijf.nl",
      telefoon: "0612345678",
      plaats: "Assen",
      bedrijfsnaam: "De Vries BV",
      categorie: "ontwerp",
      dienst: "dtp",
    });
  });

  it("controleert de lengte van naam, plaats en bedrijfsnaam", () => {
    const basis = { ...contact, categorie: "ontwerp" };
    expect(fouten({ ...basis, naam: "A" }).naam).toBeDefined();
    expect(geldig({ ...basis, naam: "Al" }).naam).toBe("Al");
    expect(fouten({ ...basis, naam: "x".repeat(101) }).naam).toBeDefined();
    expect(fouten({ ...basis, plaats: "A" }).plaats).toBeDefined();
    expect(
      fouten({ ...basis, bedrijfsnaam: "x".repeat(101) }).bedrijfsnaam,
    ).toBeDefined();
    expect(geldig({ ...basis, bedrijfsnaam: "x".repeat(100) })).toHaveProperty(
      "bedrijfsnaam",
    );
  });

  it("controleert e-mailadressen", () => {
    const basis = { ...contact, categorie: "ontwerp" };
    for (const email of ["anna", "anna@", "@bedrijf.nl", "anna@bedrijf"]) {
      expect(fouten({ ...basis, email }).email, email).toBeDefined();
    }
    expect(geldig({ ...basis, email: "a.b+c@sub.bedrijf.nl" }).email).toBe(
      "a.b+c@sub.bedrijf.nl",
    );
  });

  it("accepteert telefoonnummers van 10 tot 15 cijfers, met opmaak", () => {
    const basis = { ...contact, categorie: "ontwerp" };
    for (const telefoon of [
      "0612345678",
      "+31612345678",
      "06-12 34.56 78",
      "(050) 123 45 67",
      "+123456789012345",
    ]) {
      expect(geldig({ ...basis, telefoon }).telefoon, telefoon).toBe(telefoon);
    }
    for (const telefoon of [
      "061234567",
      "+1234567890123456",
      "06 1234 567a",
      "0031+612345678",
    ]) {
      expect(fouten({ ...basis, telefoon }).telefoon, telefoon).toBeDefined();
    }
  });

  it("geeft Nederlandse meldingen die de klant met je aanspreken", () => {
    const f = fouten({ categorie: "ontwerp" });
    expect(f.naam).toMatch(/\bje\b/);
    expect(f.email).toMatch(/\bje\b/);
  });
});

describe("parseAanvraag: categorie en dienst", () => {
  it("accepteert elke dienst van de gekozen categorie", () => {
    expect(geldig({ ...gevel, dienst: "lichtbakken" }).dienst).toBe(
      "lichtbakken",
    );
    expect(fouten({ ...gevel, dienst: "carwrapping" }).dienst).toBeDefined();
  });

  it("geeft bij een onbekende categorie geen projectveldfouten", () => {
    const f = fouten({ ...contact, categorie: "onbekend", dienst: "dtp" });
    expect(Object.keys(f)).toEqual(["categorie"]);
  });
});

describe("parseAanvraag: getallen", () => {
  it("accepteert de grenzen van de maten", () => {
    expect(
      geldig({ ...gevel, breedteCm: "100000", hoogteCm: "0,1" }).details,
    ).toMatchObject({ breedteCm: 100000, hoogteCm: 0.1 });
    expect(fouten({ ...gevel, breedteCm: "100000,5" }).breedteCm).toBeDefined();
    expect(fouten({ ...gevel, hoogteCm: "-5" }).hoogteCm).toBeDefined();
  });

  it("montagehoogte mag van 0 tot en met 100 meter", () => {
    expect(geldig({ ...gevel, montagehoogteM: "0" }).details).toMatchObject({
      montagehoogteM: 0,
    });
    expect(geldig({ ...gevel, montagehoogteM: "100" }).details).toMatchObject({
      montagehoogteM: 100,
    });
    expect(
      fouten({ ...gevel, montagehoogteM: "100,1" }).montagehoogteM,
    ).toBeDefined();
    expect(
      fouten({ ...gevel, montagehoogteM: "hoog" }).montagehoogteM,
    ).toBeDefined();
  });

  it("voertuig: aantal tot en met 500, bouwjaar vanaf 1950 tot volgend jaar", () => {
    const voertuig = {
      ...contact,
      categorie: "voertuigreclame",
      merk: "Ford",
      model: "Transit",
    };
    expect(
      geldig({ ...voertuig, aantalVoertuigen: "500" }).details.aantalVoertuigen,
    ).toBe(500);
    expect(
      fouten({ ...voertuig, aantalVoertuigen: "501" }).aantalVoertuigen,
    ).toBeDefined();
    expect(fouten(voertuig).aantalVoertuigen).toBeDefined();

    const metAantal = { ...voertuig, aantalVoertuigen: "1" };
    expect(geldig({ ...metAantal, bouwjaar: "1950" }).details.bouwjaar).toBe(
      1950,
    );
    expect(fouten({ ...metAantal, bouwjaar: "1949" }).bouwjaar).toBeDefined();
    // NU ligt in 2026 (UTC), dus 2027 mag en 2028 niet.
    expect(geldig({ ...metAantal, bouwjaar: "2027" }).details.bouwjaar).toBe(
      2027,
    );
    expect(fouten({ ...metAantal, bouwjaar: "2028" }).bouwjaar).toBeDefined();
    expect(fouten({ ...metAantal, bouwjaar: "2020,5" }).bouwjaar).toBeDefined();
  });

  it("voertuig: begrenst de tekstvelden", () => {
    const voertuig = {
      ...contact,
      categorie: "voertuigreclame",
      merk: "Ford",
      model: "Transit",
      aantalVoertuigen: "1",
    };
    expect(fouten({ ...voertuig, merk: "x".repeat(51) }).merk).toBeDefined();
    expect(
      fouten({ ...voertuig, lengteHoogte: "x".repeat(21) }).lengteHoogte,
    ).toBeDefined();
    expect(
      fouten({ ...voertuig, lakkleur: "x".repeat(51) }).lakkleur,
    ).toBeDefined();
  });

  it("laat lege optionele projectvelden weg uit de details", () => {
    const details = geldig({
      ...gevel,
      uitvoering: "",
      ondergrond: " ",
      montagehoogteM: "",
    }).details;
    expect(details).toEqual({ breedteCm: 300, hoogteCm: 60 });
  });
});

describe("parseAanvraag: afspraak", () => {
  const afspraak = {
    ...contact,
    categorie: "interieur",
    breedteCm: "400",
    hoogteCm: "260",
    afspraak: "ja",
    afspraakLocatie: "locatie",
    afspraakAdres: "Brink 2, Assen",
    afspraakDagdeel: "middag",
  };

  it("gebruikt de UTC-datum van nu als vandaag", () => {
    // NU is 15 maart 23:30 UTC; in Nederland is het dan al 16 maart.
    expect(
      geldig({ ...afspraak, afspraakDatum: "2026-03-15" }).afspraak,
    ).toEqual({
      locatie: "locatie",
      datum: "2026-03-15",
      dagdeel: "middag",
      adres: "Brink 2, Assen",
    });
    expect(
      fouten({ ...afspraak, afspraakDatum: "2026-03-14" }).afspraakDatum,
    ).toBeDefined();
  });

  it("neemt geen adres op bij een afspraak in de werkplaats", () => {
    const resultaat = geldig({
      ...afspraak,
      afspraakLocatie: "werkplaats",
      afspraakDatum: "2026-04-01",
    }).afspraak;
    expect(resultaat).toEqual({
      locatie: "werkplaats",
      datum: "2026-04-01",
      dagdeel: "middag",
    });
    expect(resultaat).not.toHaveProperty("adres");
  });

  it("meldt alle afspraakfouten tegelijk", () => {
    const f = fouten({
      ...contact,
      categorie: "ontwerp",
      afspraak: "ja",
      afspraakLocatie: "locatie",
      afspraakDatum: "morgen",
    });
    expect(Object.keys(f).sort()).toEqual([
      "afspraakAdres",
      "afspraakDagdeel",
      "afspraakDatum",
    ]);
  });

  it("negeert de afspraakvelden zonder afspraak = ja", () => {
    for (const keuze of ["nee", "", "Ja?"]) {
      const resultaat = geldig({
        ...afspraak,
        afspraak: keuze,
        afspraakDatum: "2020-01-01",
      });
      expect(resultaat.afspraak, keuze).toBeUndefined();
    }
    expect(
      geldig({ ...afspraak, afspraak: " ja ", afspraakDatum: "2026-03-20" })
        .afspraak,
    ).toBeDefined();
  });
});

describe("isGroteKlus", () => {
  const voertuig = {
    ...contact,
    categorie: "voertuigreclame",
    merk: "Ford",
    model: "Transit",
  };

  it("vanaf 3 voertuigen", () => {
    expect(isGroteKlus(geldig({ ...voertuig, aantalVoertuigen: "2" }))).toBe(
      false,
    );
    expect(isGroteKlus(geldig({ ...voertuig, aantalVoertuigen: "3" }))).toBe(
      true,
    );
    expect(isGroteKlus(geldig({ ...voertuig, aantalVoertuigen: "40" }))).toBe(
      true,
    );
  });

  it("altijd bij gevelreclame, nooit bij de andere categorieën", () => {
    expect(isGroteKlus(geldig(gevel))).toBe(true);
    expect(
      isGroteKlus(
        geldig({
          ...contact,
          categorie: "raamfolie",
          breedteCm: "100",
          hoogteCm: "100",
          aantalRamen: "50",
          zijde: "buiten",
        }),
      ),
    ).toBe(false);
    expect(
      isGroteKlus(
        geldig({
          ...contact,
          categorie: "interieur",
          breedteCm: "100",
          hoogteCm: "100",
        }),
      ),
    ).toBe(false);
  });
});
