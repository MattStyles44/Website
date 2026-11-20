import { describe, expect, it } from "vitest";

import type { ProjectKaart } from "@/lib/cms";
import {
  maxProjectenPerPagina,
  projectenInCategorie,
  projectenMetDienst,
} from "@/lib/projecten";

type Dienst = ProjectKaart["diensten"][number];

const dienst = (categorie: string, slug: string): Dienst => ({
  categorie,
  slug,
  naam: `${categorie}/${slug}`,
});

function project(slug: string, diensten: Dienst[]): ProjectKaart {
  return {
    titel: `Project ${slug}`,
    slug,
    samenvatting: `Samenvatting van ${slug}.`,
    uitgelicht: false,
    diensten,
    fotos: [],
  };
}

const autobelettering = dienst("voertuigreclame", "autobelettering");
const carwrapping = dienst("voertuigreclame", "carwrapping");
const lichtbakken = dienst("gevelreclame", "lichtbakken");
// Zelfde slug, andere categorie: telt niet als dezelfde dienst.
const vreemdeAutobelettering = dienst("gevelreclame", "autobelettering");

// Nieuwste eerst, zoals haalProjecten ze geeft.
const alle: readonly ProjectKaart[] = Object.freeze([
  project("a", [autobelettering, carwrapping]),
  project("b", [vreemdeAutobelettering]),
  project("c", [lichtbakken, autobelettering]),
  project("d", [carwrapping]),
  project("e", []),
  project("f", [autobelettering]),
  project("g", [autobelettering]),
]);

const slugs = (projecten: readonly ProjectKaart[]) =>
  projecten.map((p) => p.slug);

describe("projectenMetDienst", () => {
  it("toont standaard hoogstens drie projecten per pagina", () => {
    expect(maxProjectenPerPagina).toBe(3);
  });

  it("kiest alleen projecten met precies deze categorie en dienst", () => {
    expect(
      slugs(projectenMetDienst(alle, "voertuigreclame", "autobelettering")),
    ).toEqual(["a", "c", "f"]);
    expect(
      slugs(projectenMetDienst(alle, "gevelreclame", "autobelettering")),
    ).toEqual(["b"]);
    expect(
      slugs(projectenMetDienst(alle, "voertuigreclame", "carwrapping")),
    ).toEqual(["a", "d"]);
  });

  it("houdt de gegeven volgorde en respecteert een eigen maximum", () => {
    expect(
      slugs(projectenMetDienst(alle, "voertuigreclame", "autobelettering", 10)),
    ).toEqual(["a", "c", "f", "g"]);
    expect(
      slugs(projectenMetDienst(alle, "voertuigreclame", "autobelettering", 2)),
    ).toEqual(["a", "c"]);
    expect(
      projectenMetDienst(alle, "voertuigreclame", "autobelettering", 0),
    ).toEqual([]);
  });

  it("geeft een lege lijst zonder overeenkomst of zonder projecten", () => {
    expect(projectenMetDienst(alle, "interieur", "fotobehang")).toEqual([]);
    expect(projectenMetDienst([], "voertuigreclame", "carwrapping")).toEqual(
      [],
    );
  });

  it("laat de invoer ongemoeid en geeft een nieuwe lijst", () => {
    const invoer = [...alle];
    const uitkomst = projectenMetDienst(
      invoer,
      "voertuigreclame",
      "autobelettering",
    );
    expect(uitkomst).not.toBe(invoer);
    expect(slugs(invoer)).toEqual(["a", "b", "c", "d", "e", "f", "g"]);
    uitkomst.pop();
    expect(invoer).toHaveLength(7);
    // Werkt ook op een bevroren lijst.
    expect(() =>
      projectenMetDienst(alle, "voertuigreclame", "autobelettering"),
    ).not.toThrow();
  });
});

describe("projectenInCategorie", () => {
  it("kiest projecten met minstens één dienst uit de categorie", () => {
    expect(slugs(projectenInCategorie(alle, "voertuigreclame"))).toEqual([
      "a",
      "c",
      "d",
    ]);
    expect(slugs(projectenInCategorie(alle, "gevelreclame"))).toEqual([
      "b",
      "c",
    ]);
  });

  it("toont een project met meer diensten uit de categorie maar één keer", () => {
    const dubbel = [
      project("x", [autobelettering, carwrapping]),
      project("x", [carwrapping]),
      project("y", [carwrapping]),
    ];
    expect(slugs(projectenInCategorie(dubbel, "voertuigreclame"))).toEqual([
      "x",
      "y",
    ]);
  });

  it("houdt de gegeven volgorde en respecteert een eigen maximum", () => {
    expect(slugs(projectenInCategorie(alle, "voertuigreclame", 10))).toEqual([
      "a",
      "c",
      "d",
      "f",
      "g",
    ]);
    expect(slugs(projectenInCategorie(alle, "voertuigreclame", 1))).toEqual([
      "a",
    ]);
  });

  it("geeft een lege lijst zonder overeenkomst en laat de invoer ongemoeid", () => {
    const invoer = [...alle];
    expect(projectenInCategorie(invoer, "interieur")).toEqual([]);
    expect(projectenInCategorie([], "voertuigreclame")).toEqual([]);
    expect(projectenInCategorie(invoer, "voertuigreclame")).not.toBe(invoer);
    expect(slugs(invoer)).toEqual(["a", "b", "c", "d", "e", "f", "g"]);
  });
});
