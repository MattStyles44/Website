import { describe, expect, it } from "vitest";

import {
  bestandenAccept,
  bestandenHint,
  bestandenSamenvatting,
  bestandstypen,
  controleerBestanden,
  controleerFormulier,
  vroegsteAfspraakDatum,
} from "@/components/offerte/controle";
import { parseAanvraag } from "@/lib/offerte/aanvraag";
import { honeypotVeld } from "@/lib/offerte/spam";
import {
  maxBestanden,
  maxTotaleGrootte,
  toegestaneExtensies,
  valideerUploads,
} from "@/lib/offerte/uploads";

const nu = new Date("2026-11-19T10:00:00Z");

function formulier(velden: Record<string, string>, bestanden: File[] = []) {
  const data = new FormData();
  for (const [naam, waarde] of Object.entries(velden))
    data.append(naam, waarde);
  for (const bestand of bestanden) data.append("bestanden", bestand);
  return data;
}

const geldig = {
  naam: "Kees Smit",
  email: "kees@smit.nl",
  telefoon: "06 12 34 56 78",
  plaats: "Groningen",
  categorie: "ontwerp",
};

const bestand = (naam: string, grootte = 3) => ({ name: naam, size: grootte });

describe("bestandsveld", () => {
  it("accepteert precies de extensies uit uploads.ts", () => {
    expect(bestandenAccept.split(",")).toEqual(
      toegestaneExtensies.map((extensie) => `.${extensie}`),
    );
  });

  it("noemt de typen en de grenzen in de hulptekst", () => {
    expect(bestandstypen).toBe("EPS, AI, PDF, JPG of PNG");
    expect(bestandenHint).toContain("Elk bestand is welkom");
    expect(bestandenHint).toContain(`maximaal ${maxBestanden} bestanden`);
    expect(bestandenHint).toContain(`${maxTotaleGrootte / (1024 * 1024)} MB`);
    expect(bestandenHint).toMatch(/logo zo nodig opnieuw op/);
  });

  it("vat de keuze samen", () => {
    expect(bestandenSamenvatting([bestand("logo.pdf", 200 * 1024)])).toBe(
      "1 bestand gekozen (200 kB).",
    );
    expect(
      bestandenSamenvatting([
        bestand("a.png", 1024 * 1024),
        bestand("b.png", 1.5 * 1024 * 1024),
      ]),
    ).toBe("2 bestanden gekozen, samen 2,5 MB.");
  });
});

describe("controleerBestanden", () => {
  it("vindt niets bij een gewone keuze, ook op de grenzen", () => {
    expect(controleerBestanden([])).toBeUndefined();
    const tien = Array.from({ length: maxBestanden }, (_, index) =>
      bestand(`foto-${index}.JPG`, maxTotaleGrootte / maxBestanden),
    );
    expect(controleerBestanden(tien)).toBeUndefined();
  });

  it("meldt te veel bestanden voor het versturen", () => {
    const elf = Array.from({ length: maxBestanden + 1 }, (_, index) =>
      bestand(`foto-${index}.png`),
    );
    expect(controleerBestanden(elf)).toBe(
      "Je hebt 11 bestanden gekozen. Je kunt maximaal 10 bestanden meesturen.",
    );
  });

  it("meldt een te grote keuze", () => {
    const melding = controleerBestanden([
      bestand("a.pdf", maxTotaleGrootte),
      bestand("b.pdf", 1),
    ]);
    expect(melding).toMatch(/meer dan 4 MB/);
    expect(melding).toContain("info@sign-up.nl");
  });

  it("meldt een bestandstype met dezelfde tekst als de server", () => {
    const melding = controleerBestanden([bestand("offerte.docx")]);
    const server = valideerUploads([
      { naam: "offerte.docx", type: "", inhoud: new Uint8Array(3) },
    ]);
    expect(server.ok).toBe(false);
    expect(melding).toBe(server.ok ? undefined : server.fout);
  });
});

describe("controleerFormulier", () => {
  it("laat een geldige aanvraag door", () => {
    expect(controleerFormulier(formulier(geldig), nu)).toBeUndefined();
  });

  it("geeft dezelfde fouten als de server", () => {
    const leeg = controleerFormulier(formulier({}), nu);
    const server = parseAanvraag({}, { nu });
    expect(server.ok).toBe(false);
    expect(leeg).toEqual(server.ok ? {} : server.fouten);
    expect(Object.keys(leeg ?? {})).toEqual(
      expect.arrayContaining(["naam", "email", "telefoon", "plaats"]),
    );
  });

  it("controleert de velden van de gekozen categorie", () => {
    const fouten = controleerFormulier(
      formulier({ ...geldig, categorie: "voertuigreclame", model: "Transit" }),
      nu,
    );
    expect(fouten).toEqual({
      merk: "Vul het merk van het voertuig in.",
      aantalVoertuigen: "Vul het aantal voertuigen in.",
    });
  });

  it("controleert de afspraak alleen als die gevraagd is", () => {
    const zonder = controleerFormulier(
      formulier({ ...geldig, afspraakDatum: "2020-01-01" }),
      nu,
    );
    expect(zonder).toBeUndefined();

    const met = controleerFormulier(
      formulier({
        ...geldig,
        afspraak: "ja",
        afspraakLocatie: "locatie",
        afspraakDatum: "2026-11-18",
        afspraakDagdeel: "ochtend",
      }),
      nu,
    );
    expect(met).toEqual({
      afspraakDatum: "Kies een datum vanaf vandaag, niet in het verleden.",
      afspraakAdres: "Vul het adres in waar de afspraak plaatsvindt.",
    });
  });

  it("meldt te veel bestanden samen met de andere fouten", () => {
    const bestanden = Array.from(
      { length: maxBestanden + 1 },
      (_, index) => new File([new Uint8Array([1])], `logo-${index}.png`),
    );
    const fouten = controleerFormulier(
      formulier({ ...geldig, naam: "" }, bestanden),
      nu,
    );
    expect(fouten?.naam).toBe("Vul je naam in.");
    expect(fouten?.bestanden).toMatch(/maximaal 10 bestanden/);
  });

  it("negeert een leeg bestandsveld", () => {
    const fouten = controleerFormulier(
      formulier(geldig, [new File([], "")]),
      nu,
    );
    expect(fouten).toBeUndefined();
  });

  it("laat een ingevulde honeypot over aan de server", () => {
    const fouten = controleerFormulier(
      formulier({ [honeypotVeld]: "ik ben een bot" }),
      nu,
    );
    expect(fouten).toBeUndefined();
  });
});

describe("vroegsteAfspraakDatum", () => {
  it("is vandaag", () => {
    const datum = vroegsteAfspraakDatum(nu);
    expect(datum).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(datum >= "2026-11-19").toBe(true);
  });

  it("is nooit eerder dan de datum waarmee de server rekent", () => {
    for (const moment of [
      "2026-11-19T00:30:00Z",
      "2026-11-19T23:30:00Z",
      "2026-12-31T23:59:00Z",
    ]) {
      const datum = new Date(moment);
      expect(vroegsteAfspraakDatum(datum) >= moment.slice(0, 10)).toBe(true);
    }
  });
});
