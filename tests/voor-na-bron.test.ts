import { describe, expect, it, vi } from "vitest";

import type { Foto } from "@/lib/cms";
import { dienstQuery, maakContentBron, projectenQuery } from "@/lib/cms/bron";

const velden =
  '{alt, "url": asset->url, "breedte": asset->metadata.dimensions.width, "hoogte": asset->metadata.dimensions.height}';

const voor: Foto = {
  url: "https://cdn.sanity.io/images/abc123/production/gevel-voor-1600x1200.jpg",
  alt: "Kale gevel van een bakkerij",
  breedte: 1600,
  hoogte: 1200,
};

const na: Foto = {
  url: "https://cdn.sanity.io/images/abc123/production/gevel-na-1200x800.jpg",
  alt: "Dezelfde gevel met doosletters en raamfolie",
  breedte: 1200,
  hoogte: 800,
};

function ruw(voorFoto: unknown, extra: Record<string, unknown> = {}) {
  return {
    titel: "Gevelreclame voor een bakkerij",
    slug: "gevel-bakkerij",
    samenvatting: "Doosletters en raamfolie in de huisstijl.",
    fotos: [na],
    voorFoto,
    ...extra,
  };
}

async function projecten(items: unknown[]) {
  const waarschuw = vi.fn();
  const bron = maakContentBron(async () => items, waarschuw);
  return { projecten: await bron.projecten(), waarschuw };
}

describe("de query voor projecten", () => {
  it("vraagt de foto vooraf op vóór de foto's, met dezelfde velden", () => {
    const voorFoto = projectenQuery.indexOf(`voorFoto${velden}`);
    const fotos = projectenQuery.indexOf(`fotos[]${velden}`);
    expect(voorFoto).toBeGreaterThan(0);
    expect(fotos).toBeGreaterThan(voorFoto);
  });

  it("vraagt bij een dienst geen foto vooraf op", () => {
    expect(dienstQuery).not.toContain("voorFoto");
    expect(dienstQuery).toContain(`fotos[]${velden}`);
  });
});

describe("de foto vooraf van een project", () => {
  it("neemt een complete foto vooraf over, met een getrimde beschrijving", async () => {
    const { projecten: lijst, waarschuw } = await projecten([
      ruw({ ...voor, alt: `  ${voor.alt}  `, _key: "x", extra: true }),
    ]);
    expect(lijst).toHaveLength(1);
    expect(lijst[0]?.voorFoto).toEqual(voor);
    expect(lijst[0]?.fotos).toEqual([na]);
    expect(waarschuw).not.toHaveBeenCalled();
  });

  it.each([
    ["geen veld", undefined],
    ["null", null],
    ["een lijst", [voor]],
    ["een getal", 42],
    ["geen adres", { ...voor, url: null }],
    [
      "http in plaats van https",
      { ...voor, url: voor.url.replace("https", "http") },
    ],
    [
      "een andere site",
      { ...voor, url: "https://cdn.sanity.io.example.com/a.jpg" },
    ],
    ["geen beschrijving", { ...voor, alt: null }],
    ["een lege beschrijving", { ...voor, alt: "" }],
    ["een negatieve hoogte", { ...voor, hoogte: -844 }],
    ["een breedte als tekst", { ...voor, breedte: "1600" }],
    ["geen afmetingen", { url: voor.url, alt: voor.alt }],
  ])(
    "laat de foto vooraf weg bij %s, en houdt het project zonder waarschuwing",
    async (_, waarde) => {
      const { projecten: lijst, waarschuw } = await projecten([ruw(waarde)]);
      expect(lijst).toHaveLength(1);
      expect(lijst[0]).not.toHaveProperty("voorFoto");
      expect(lijst[0]?.titel).toBe("Gevelreclame voor een bakkerij");
      expect(lijst[0]?.fotos).toEqual([na]);
      expect(waarschuw).not.toHaveBeenCalled();
    },
  );

  it("geeft elk project zijn eigen foto vooraf", async () => {
    const { projecten: lijst } = await projecten([
      ruw(voor, { slug: "met" }),
      ruw(null, { slug: "zonder" }),
    ]);
    expect(lijst.map((project) => [project.slug, project.voorFoto])).toEqual([
      ["met", voor],
      ["zonder", undefined],
    ]);
    expect(lijst[1]).not.toHaveProperty("voorFoto");
  });

  it("houdt een foto vooraf ook als het project geen andere foto's heeft", async () => {
    const { projecten: lijst } = await projecten([ruw(voor, { fotos: null })]);
    expect(lijst[0]?.voorFoto).toEqual(voor);
    expect(lijst[0]?.fotos).toEqual([]);
  });
});
