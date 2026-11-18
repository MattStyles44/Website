import { describe, expect, it } from "vitest";

import { alleDiensten, categorieen } from "@/content/diensten";

import { categorieConcepten, dienstConcepten } from "../studio/seed/concepten";

const dienstSleutels = alleDiensten().map(
  ({ categorie, dienst }) => `${categorie.slug}/${dienst.slug}`,
);

/** Alle tekst van een concept in één lijst, om op huisregels te controleren. */
function alleTeksten(): string[] {
  return [
    ...Object.values(categorieConcepten).flatMap((concept) => [
      concept.intro,
      ...concept.alineas,
      ...concept.werkwijze.flatMap((stap) => [stap.titel, stap.tekst]),
    ]),
    ...Object.values(dienstConcepten).flatMap((concept) => [
      concept.intro,
      ...concept.alineas,
      ...concept.voordelen,
      ...concept.vragen.flatMap((vraag) => [vraag.vraag, vraag.antwoord]),
    ]),
  ];
}

describe("conceptteksten voor Sanity", () => {
  it("heeft precies één concept per categorie en per dienst uit de code", () => {
    expect(Object.keys(categorieConcepten).sort()).toEqual(
      categorieen.map((categorie) => categorie.slug).sort(),
    );
    expect(Object.keys(dienstConcepten).sort()).toEqual(
      [...dienstSleutels].sort(),
    );
  });

  it("past binnen de limieten van de Studio", () => {
    for (const concept of Object.values(categorieConcepten)) {
      expect(concept.intro.length).toBeLessThanOrEqual(300);
      expect(concept.werkwijze.length).toBeLessThanOrEqual(8);
      for (const stap of concept.werkwijze) {
        expect(stap.titel.length).toBeLessThanOrEqual(60);
        expect(stap.tekst.length).toBeLessThanOrEqual(400);
      }
    }
    for (const concept of Object.values(dienstConcepten)) {
      expect(concept.intro.length).toBeLessThanOrEqual(300);
      expect(concept.voordelen.length).toBeLessThanOrEqual(6);
      expect(concept.vragen.length).toBeLessThanOrEqual(10);
      for (const voordeel of concept.voordelen) {
        expect(voordeel.length).toBeLessThanOrEqual(120);
      }
      for (const vraag of concept.vragen) {
        expect(vraag.vraag.length).toBeLessThanOrEqual(160);
        expect(vraag.antwoord.length).toBeLessThanOrEqual(800);
      }
    }
  });

  it("noemt geen prijzen (alles is maatwerk)", () => {
    for (const tekst of alleTeksten()) {
      expect(tekst).not.toMatch(/€|euro|\bvanaf\b|\bexcl\b|\bincl\b/i);
    }
  });

  it("spreekt de lezer aan met je/jij, niet met u", () => {
    for (const tekst of alleTeksten()) {
      expect(tekst).not.toMatch(/\b(u|uw|Uw|U)\b/);
    }
  });
});
