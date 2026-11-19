import { describe, expect, it } from "vitest";

import {
  beginKeuze,
  dienstOpties,
  foutRegels,
  projectGroepen,
  veldId,
  veldVolgorde,
} from "@/components/offerte/formulier-velden";
import { categorieen, type FormulierType } from "@/content/diensten";
import { parseAanvraag } from "@/lib/offerte/aanvraag";

const namen = (formulier: FormulierType) =>
  projectGroepen[formulier]?.velden.map((veld) => veld.naam) ?? [];

const verplicht = (formulier: FormulierType) =>
  projectGroepen[formulier]?.velden
    .filter((veld) => veld.verplicht)
    .map((veld) => veld.naam) ?? [];

describe("beginKeuze", () => {
  it("neemt een bekende categorie en een dienst uit die categorie over", () => {
    expect(beginKeuze("voertuigreclame", "carwrapping")).toEqual({
      categorie: "voertuigreclame",
      dienst: "carwrapping",
    });
  });

  it("laat een dienst uit een andere categorie weg", () => {
    expect(beginKeuze("gevelreclame", "carwrapping")).toEqual({
      categorie: "gevelreclame",
      dienst: "",
    });
  });

  it("kiest niets bij een onbekende of ontbrekende categorie", () => {
    expect(beginKeuze("bestaat-niet", "carwrapping")).toEqual({
      categorie: "",
      dienst: "",
    });
    expect(beginKeuze(undefined, "carwrapping")).toEqual({
      categorie: "",
      dienst: "",
    });
    expect(beginKeuze()).toEqual({ categorie: "", dienst: "" });
  });
});

describe("dienstOpties", () => {
  it("geeft alleen de diensten van de gekozen categorie", () => {
    for (const categorie of categorieen) {
      expect(dienstOpties(categorie.slug).map((optie) => optie.waarde)).toEqual(
        categorie.diensten.map((dienst) => dienst.slug),
      );
    }
    expect(dienstOpties("bestaat-niet")).toEqual([]);
  });
});

describe("projectvelden per formuliertype", () => {
  it("heeft precies de velden uit de tabel van de opdracht", () => {
    expect(namen("voertuig")).toEqual([
      "merk",
      "model",
      "bouwjaar",
      "lengteHoogte",
      "aantalVoertuigen",
      "lakkleur",
    ]);
    expect(namen("gevel")).toEqual([
      "breedteCm",
      "hoogteCm",
      "uitvoering",
      "ondergrond",
      "montagehoogteM",
    ]);
    expect(namen("interieur")).toEqual(["breedteCm", "hoogteCm", "ondergrond"]);
    expect(namen("raam")).toEqual([
      "breedteCm",
      "hoogteCm",
      "aantalRamen",
      "zijde",
    ]);
    expect(projectGroepen.algemeen).toBeUndefined();
  });

  it("markeert dezelfde velden als verplicht als de server", () => {
    expect(verplicht("voertuig")).toEqual([
      "merk",
      "model",
      "aantalVoertuigen",
    ]);
    expect(verplicht("gevel")).toEqual(["breedteCm", "hoogteCm"]);
    expect(verplicht("interieur")).toEqual(["breedteCm", "hoogteCm"]);
    expect(verplicht("raam")).toEqual([
      "breedteCm",
      "hoogteCm",
      "aantalRamen",
      "zijde",
    ]);
  });

  it("noemt de eenheid in het label van elke maat", () => {
    for (const formulier of ["gevel", "interieur", "raam"] as const) {
      const velden = projectGroepen[formulier]?.velden ?? [];
      for (const naam of ["breedteCm", "hoogteCm"]) {
        const veld = velden.find((item) => item.naam === naam);
        expect(veld?.label, `${formulier}.${naam}`).toMatch(/centimeters/);
      }
    }
    const montage = projectGroepen.gevel?.velden.find(
      (veld) => veld.naam === "montagehoogteM",
    );
    expect(montage?.label).toMatch(/meters/);
  });

  it("biedt de keuzes die de server accepteert", () => {
    const keuzes = (formulier: FormulierType, naam: string) => {
      const veld = projectGroepen[formulier]?.velden.find(
        (item) => item.naam === naam,
      );
      return veld?.soort === "keuze"
        ? veld.opties.map((optie) => optie.waarde)
        : [];
    };
    expect(keuzes("gevel", "uitvoering")).toEqual([
      "lichtbak",
      "3d-letters",
      "gevelbord",
      "anders",
    ]);
    expect(keuzes("raam", "zijde")).toEqual(["binnen", "buiten"]);
  });

  it("geeft getallenvelden een numeriek toetsenbord", () => {
    const getallen = [
      "bouwjaar",
      "aantalVoertuigen",
      "breedteCm",
      "hoogteCm",
      "montagehoogteM",
      "aantalRamen",
    ];
    for (const groep of Object.values(projectGroepen)) {
      for (const veld of groep?.velden ?? []) {
        if (veld.soort !== "tekst" || !getallen.includes(veld.naam)) continue;
        expect(veld.invoer, veld.naam).toMatch(/^(numeric|decimal)$/);
      }
    }
  });

  it("past bij de validatie van de server, voor elke categorie", () => {
    const voorbeeld: Record<string, string> = {
      merk: "Ford",
      model: "Transit",
      aantalVoertuigen: "2",
      breedteCm: "250",
      hoogteCm: "120",
      aantalRamen: "4",
      zijde: "binnen",
    };
    for (const categorie of categorieen) {
      const velden: Record<string, string> = {
        naam: "Kees Smit",
        email: "kees@smit.nl",
        telefoon: "06 12 34 56 78",
        plaats: "Groningen",
        categorie: categorie.slug,
      };
      // Alleen de verplichte velden die het formulier voor deze categorie toont.
      for (const naam of verplicht(categorie.formulier)) {
        velden[naam] = voorbeeld[naam] ?? "";
      }
      const resultaat = parseAanvraag(velden);
      expect(resultaat.ok, categorie.slug).toBe(true);
    }
  });
});

describe("foutenoverzicht", () => {
  it("zet de fouten in de volgorde van het formulier", () => {
    const regels = foutRegels(
      {
        bestanden: "Te veel bestanden.",
        naam: "Vul je naam in.",
        merk: "Vul het merk in.",
        categorie: "Kies een categorie.",
        afspraakDatum: "Kies een datum.",
      },
      new Set(["bestanden", "naam", "merk", "categorie", "afspraakDatum"]),
    );
    expect(regels.map((regel) => regel.naam)).toEqual([
      "categorie",
      "merk",
      "bestanden",
      "naam",
      "afspraakDatum",
    ]);
    expect(regels.every((regel) => regel.id === regel.naam)).toBe(true);
  });

  it("linkt niet naar een veld dat niet in beeld is", () => {
    const [regel] = foutRegels(
      { afspraakAdres: "Vul het adres in." },
      new Set(["naam"]),
    );
    expect(regel).toEqual({
      naam: "afspraakAdres",
      melding: "Vul het adres in.",
    });
  });

  it("zet onbekende velden achteraan", () => {
    const regels = foutRegels(
      { onbekend: "Iets klopt niet.", naam: "Vul je naam in." },
      new Set(["naam", "onbekend"]),
    );
    expect(regels.map((regel) => regel.naam)).toEqual(["naam", "onbekend"]);
  });

  it("linkt het afspraakvinkje naar de eerste keuze van de groep", () => {
    expect(veldId("afspraak")).toBe("afspraak-1");
    expect(veldId("naam")).toBe("naam");
  });

  it("kent een plek voor elk veld van het formulier", () => {
    for (const groep of Object.values(projectGroepen)) {
      for (const veld of groep?.velden ?? []) {
        expect(veldVolgorde, veld.naam).toContain(veld.naam);
      }
    }
  });
});
