import { describe, expect, it } from "vitest";

import {
  alleDiensten,
  categorieen,
  getCategorie,
  getDienst,
} from "@/content/diensten";
import { footermenu, hoofdmenu, offerteKnop } from "@/content/navigatie";
import { allePaden } from "@/content/paginas";
import { site } from "@/content/site";

const slugVorm = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("categorieën en diensten", () => {
  it("heeft de zes categorieën uit de dienstenlijst, in volgorde", () => {
    expect(categorieen.map((c) => c.slug)).toEqual([
      "voertuigreclame",
      "gevelreclame",
      "buitenreclame",
      "interieur",
      "raamfolie",
      "ontwerp",
    ]);
  });

  it("heeft 24 diensten, en elke categorie heeft er minstens drie", () => {
    expect(alleDiensten()).toHaveLength(24);
    for (const categorie of categorieen) {
      expect(categorie.diensten.length, categorie.slug).toBeGreaterThanOrEqual(
        3,
      );
    }
  });

  it("gebruikt nette, unieke slugs", () => {
    const categorieSlugs = categorieen.map((c) => c.slug);
    const dienstSlugs = alleDiensten().map(({ dienst }) => dienst.slug);
    for (const slug of [...categorieSlugs, ...dienstSlugs]) {
      expect(slug).toMatch(slugVorm);
    }
    expect(new Set(categorieSlugs).size).toBe(categorieSlugs.length);
    expect(new Set(dienstSlugs).size).toBe(dienstSlugs.length);
  });

  it("geeft elke dienst een naam en omschrijving", () => {
    for (const { dienst } of alleDiensten()) {
      expect(dienst.naam.trim(), dienst.slug).not.toBe("");
      expect(dienst.omschrijving.trim(), dienst.slug).not.toBe("");
    }
  });

  it("bevat chrome delete weer, in voertuigreclame", () => {
    expect(getDienst("voertuigreclame", "chrome-delete")?.naam).toContain(
      "Chrome delete",
    );
  });

  it("noemt nergens een prijs: alles is maatwerk", () => {
    const tekst = JSON.stringify(categorieen);
    expect(tekst).not.toMatch(/€|euro|vanaf|prijs/i);
  });

  it("vindt een dienst alleen binnen de juiste categorie", () => {
    expect(getCategorie("bestaat-niet")).toBeUndefined();
    expect(getDienst("voertuigreclame", "autobelettering")).toBeDefined();
    expect(getDienst("interieur", "autobelettering")).toBeUndefined();
  });
});

describe("site", () => {
  it("gebruikt hetzelfde nummer voor telefoon en WhatsApp", () => {
    expect(site.telefoon.link).toBe("tel:+31651556433");
    expect(site.whatsapp).toBe("https://wa.me/31651556433");
  });

  it("gebruikt het bevestigde e-mailadres", () => {
    expect(site.email).toBe("info@sign-up.nl");
  });
});

describe("navigatie", () => {
  it("linkt alleen naar pagina's die bestaan", () => {
    const paden = new Set(allePaden());
    for (const item of [...hoofdmenu, ...footermenu, offerteKnop]) {
      expect(paden.has(item.href), item.href).toBe(true);
    }
  });
});
