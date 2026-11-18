/**
 * Maakt seed/seed.ndjson: één document per categorie en per dienst, met de
 * namen en webadressen uit de code en de conceptteksten uit concepten.ts.
 *
 * Gebruik (in studio/):
 *   npm run seed          bestand maken
 *   npm run seed:import   importeren; bestaande documenten blijven ongemoeid
 */
import { writeFileSync } from "node:fs";

import { categorieen } from "../../src/content/diensten.ts";
import { categorieConcepten, dienstConcepten } from "./concepten.ts";

let teller = 0;
/** Unieke, voorspelbare sleutel voor items in een lijst. */
function sleutel(): string {
  teller += 1;
  return `k${teller.toString(36)}`;
}

function blokken(alineas: string[]) {
  return alineas.map((tekst) => ({
    _type: "block",
    _key: sleutel(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: sleutel(), text: tekst, marks: [] }],
  }));
}

const documenten: object[] = [];

categorieen.forEach((categorie, categorieIndex) => {
  const concept = categorieConcepten[categorie.slug];
  if (!concept)
    throw new Error(`Geen concept voor categorie ${categorie.slug}`);

  documenten.push({
    _id: `categorie-${categorie.slug}`,
    _type: "categorie",
    naam: categorie.naam,
    slug: categorie.slug,
    volgorde: categorieIndex + 1,
    intro: concept.intro,
    tekst: blokken(concept.alineas),
  });

  categorie.diensten.forEach((dienst, dienstIndex) => {
    const sleutelNaam = `${categorie.slug}/${dienst.slug}`;
    const dienstConcept = dienstConcepten[sleutelNaam];
    if (!dienstConcept)
      throw new Error(`Geen concept voor dienst ${sleutelNaam}`);

    documenten.push({
      _id: `dienst-${categorie.slug}-${dienst.slug}`,
      _type: "dienst",
      naam: dienst.naam,
      categorie: categorie.slug,
      slug: dienst.slug,
      volgorde: (categorieIndex + 1) * 100 + dienstIndex + 1,
      intro: dienstConcept.intro,
      tekst: blokken(dienstConcept.alineas),
      voordelen: dienstConcept.voordelen,
      werkwijze: concept.werkwijze.map((stap) => ({
        _type: "stap",
        _key: sleutel(),
        ...stap,
      })),
      vragen: dienstConcept.vragen.map((vraag) => ({
        _type: "vraag",
        _key: sleutel(),
        ...vraag,
      })),
    });
  });
});

const doel = new URL("./seed.ndjson", import.meta.url);
writeFileSync(
  doel,
  documenten.map((doc) => JSON.stringify(doc)).join("\n") + "\n",
);
console.log(`${documenten.length} documenten geschreven naar ${doel.pathname}`);
