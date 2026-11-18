import { describe, expect, it, vi } from "vitest";

import { getDienst } from "@/content/diensten";
import {
  categorieQuery,
  dienstQuery,
  maakContentBron,
  projectenQuery,
  type SanityOphalen,
} from "@/lib/cms/bron";

/** Een nep-Sanity die per query een vast antwoord geeft en de aanroepen bijhoudt. */
function nepSanity(antwoorden: Partial<Record<string, unknown>>) {
  const aanroepen: Array<{ query: string; params: Record<string, string> }> =
    [];
  const ophalen: SanityOphalen = async (query, params) => {
    aanroepen.push({ query, params });
    return antwoorden[query] ?? null;
  };
  return { ophalen, aanroepen };
}

const blok = {
  _type: "block",
  _key: "a1",
  style: "normal",
  children: [{ _type: "span", _key: "s1", text: "Hallo", marks: [] }],
  markDefs: [],
};

describe("zonder Sanity (terugval op de code)", () => {
  const bron = maakContentBron(null);

  it("geeft de omschrijving uit de code als introductie van een dienst", async () => {
    const tekst = await bron.dienstTekst("voertuigreclame", "autobelettering");
    expect(tekst).toEqual({
      intro: getDienst("voertuigreclame", "autobelettering")?.omschrijving,
      tekst: [],
      voordelen: [],
      werkwijze: [],
      vragen: [],
    });
  });

  it("geeft een lege categorietekst en geen projecten", async () => {
    expect(await bron.categorieTekst("gevelreclame")).toEqual({ tekst: [] });
    expect(await bron.projecten()).toEqual([]);
  });

  it("geeft undefined voor onbekende categorieën en diensten", async () => {
    expect(await bron.categorieTekst("bestaat-niet")).toBeUndefined();
    expect(
      await bron.dienstTekst("voertuigreclame", "bestaat-niet"),
    ).toBeUndefined();
    expect(
      await bron.dienstTekst("ontwerp", "autobelettering"),
    ).toBeUndefined();
  });
});

describe("met Sanity", () => {
  it("vraagt de juiste dienst op en neemt de teksten over", async () => {
    const { ophalen, aanroepen } = nepSanity({
      [dienstQuery]: {
        intro: "  Je bus als rijdend visitekaartje.  ",
        tekst: [blok],
        voordelen: ["Strak gemonteerd"],
        werkwijze: [{ titel: "Aanvraag", tekst: "Je stuurt foto's." }],
        vragen: [
          { vraag: "Hoe lang duurt het?", antwoord: "Meestal een dag." },
        ],
        garantie: null,
      },
    });
    const tekst = await maakContentBron(ophalen).dienstTekst(
      "voertuigreclame",
      "autobelettering",
    );

    expect(aanroepen).toEqual([
      {
        query: dienstQuery,
        params: { categorie: "voertuigreclame", slug: "autobelettering" },
      },
    ]);
    expect(tekst).toEqual({
      intro: "Je bus als rijdend visitekaartje.",
      tekst: [blok],
      voordelen: ["Strak gemonteerd"],
      werkwijze: [{ titel: "Aanvraag", tekst: "Je stuurt foto's." }],
      vragen: [{ vraag: "Hoe lang duurt het?", antwoord: "Meestal een dag." }],
    });
  });

  it("valt terug op de code bij een lege introductie of een ontbrekend document", async () => {
    const omschrijving = getDienst(
      "raamfolie",
      "zandstraalfolie",
    )?.omschrijving;
    const leeg = maakContentBron(
      nepSanity({ [dienstQuery]: { intro: "   ", tekst: null } }).ophalen,
    );
    expect(
      (await leeg.dienstTekst("raamfolie", "zandstraalfolie"))?.intro,
    ).toBe(omschrijving);

    const ontbrekend = maakContentBron(nepSanity({}).ophalen);
    expect(
      (await ontbrekend.dienstTekst("raamfolie", "zandstraalfolie"))?.intro,
    ).toBe(omschrijving);
  });

  it("vraagt Sanity niet om onbekende diensten", async () => {
    const { ophalen, aanroepen } = nepSanity({});
    expect(
      await maakContentBron(ophalen).dienstTekst("voertuigreclame", "fietsen"),
    ).toBeUndefined();
    expect(aanroepen).toEqual([]);
  });

  it("valt terug en waarschuwt bij een onleesbaar document", async () => {
    const waarschuw = vi.fn();
    const bron = maakContentBron(
      nepSanity({ [dienstQuery]: { intro: 42 } }).ophalen,
      waarschuw,
    );
    const tekst = await bron.dienstTekst("interieur", "fotobehang");
    expect(tekst?.intro).toBe(
      getDienst("interieur", "fotobehang")?.omschrijving,
    );
    expect(waarschuw).toHaveBeenCalledOnce();
  });

  it("geeft een netwerkfout door, zodat de vorige versie blijft staan", async () => {
    const bron = maakContentBron(async () => {
      throw new Error("Sanity onbereikbaar");
    });
    await expect(bron.dienstTekst("interieur", "fotobehang")).rejects.toThrow(
      "Sanity onbereikbaar",
    );
  });

  it("neemt de categorietekst over", async () => {
    const { ophalen, aanroepen } = nepSanity({
      [categorieQuery]: { intro: "Gevels die opvallen.", tekst: [blok] },
    });
    expect(
      await maakContentBron(ophalen).categorieTekst("gevelreclame"),
    ).toEqual({
      intro: "Gevels die opvallen.",
      tekst: [blok],
    });
    expect(aanroepen[0]?.params).toEqual({ slug: "gevelreclame" });
  });
});

describe("projecten", () => {
  it("zet projecten om en gebruikt de dienstnamen uit de code", async () => {
    const { ophalen } = nepSanity({
      [projectenQuery]: [
        {
          titel: "Vlootbelettering voor een installateur",
          slug: "vloot-installateur",
          klant: null,
          plaats: "Groningen",
          datum: "2026-10-01",
          samenvatting: "Twaalf bussen in de nieuwe huisstijl.",
          uitgelicht: null,
          diensten: [
            { categorie: "voertuigreclame", slug: "autobelettering" },
            { categorie: "voertuigreclame", slug: "bestaat-niet" },
            null,
          ],
        },
      ],
    });

    expect(await maakContentBron(ophalen).projecten()).toEqual([
      {
        titel: "Vlootbelettering voor een installateur",
        slug: "vloot-installateur",
        plaats: "Groningen",
        datum: "2026-10-01",
        samenvatting: "Twaalf bussen in de nieuwe huisstijl.",
        uitgelicht: false,
        diensten: [
          {
            categorie: "voertuigreclame",
            slug: "autobelettering",
            naam: getDienst("voertuigreclame", "autobelettering")?.naam,
          },
        ],
      },
    ]);
  });

  it("slaat onleesbare projecten over en waarschuwt", async () => {
    const waarschuw = vi.fn();
    const { ophalen } = nepSanity({
      [projectenQuery]: [
        { titel: "Zonder samenvatting", slug: "x" },
        { titel: "Goed", slug: "goed", samenvatting: "Kort." },
      ],
    });
    const projecten = await maakContentBron(ophalen, waarschuw).projecten();
    expect(projecten.map((project) => project.slug)).toEqual(["goed"]);
    expect(waarschuw).toHaveBeenCalledOnce();
  });

  it("geeft een lege lijst bij een onverwacht antwoord", async () => {
    const { ophalen } = nepSanity({ [projectenQuery]: { niet: "een lijst" } });
    expect(await maakContentBron(ophalen).projecten()).toEqual([]);
  });
});
