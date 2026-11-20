import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DienstPage from "@/app/diensten/[categorie]/[dienst]/page";
import CategoriePage from "@/app/diensten/[categorie]/page";
import type { ProjectKaart } from "@/lib/cms";

// De pagina's halen hun gegevens alleen via "@/lib/cms"; hier zonder Sanity.
const cms = vi.hoisted(() => ({
  projecten: [] as unknown[],
  extra: {} as Record<string, unknown>,
}));

vi.mock("@/lib/cms", async () => {
  const { maakContentBron } = await import("@/lib/cms/bron");
  const bron = maakContentBron(null);
  return {
    haalCategorieTekst: (slug: string) => bron.categorieTekst(slug),
    haalDienstTekst: async (categorie: string, dienst: string) => {
      const tekst = await bron.dienstTekst(categorie, dienst);
      return tekst ? { ...tekst, ...cms.extra } : undefined;
    },
    haalProjecten: async () => cms.projecten,
  };
});

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
    plaats: "Groningen",
    samenvatting: `Samenvatting van ${slug}.`,
    uitgelicht: false,
    diensten,
    fotos: [],
  };
}

const carwrapping = dienst("voertuigreclame", "carwrapping");
const magneetplaten = dienst("voertuigreclame", "magneetplaten");
const muurteksten = dienst("interieur", "muurteksten");
const fotobehang = dienst("interieur", "fotobehang");

beforeEach(() => {
  cms.projecten = [
    project("alpha", [carwrapping]),
    project("beta", [muurteksten, fotobehang]),
    project("gamma", [magneetplaten, carwrapping]),
    project("delta", [fotobehang]),
  ];
  cms.extra = {};
});

type Component = (props: object) => ReactElement | Promise<ReactElement>;
async function render(component: unknown, waarden: object): Promise<string> {
  return renderToStaticMarkup(
    await (component as Component)({ params: Promise.resolve(waarden) }),
  );
}

const projectenSectie = (markup: string) =>
  markup.match(
    /<section\b[^>]*aria-labelledby="projecten-kop"[\s\S]*?<\/section>/,
  )?.[0] ?? null;

const projectTitels = (markup: string) =>
  [...markup.matchAll(/<h3\b[^>]*>(Project [a-z]+)<\/h3>/g)].map((m) => m[1]);

/** De lichte toon (bg-wit of bg-vlak) per sectie na de paginakop, op volgorde. */
const toonVolgorde = (markup: string) =>
  [...markup.matchAll(/<section\b[^>]*class="[^"]*\b(bg-wit|bg-vlak)\b/g)]
    .map((m) => m[1])
    .slice(1);

/** De niveaus van alle koppen, op volgorde. */
const koppen = (markup: string) =>
  [...markup.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));

describe("recent werk op de dienstpagina", () => {
  it("toont de projecten met deze dienst, met een tekstlink naar alle projecten", async () => {
    const markup = await render(DienstPage, {
      categorie: "voertuigreclame",
      dienst: "carwrapping",
    });
    const sectie = projectenSectie(markup) ?? "";
    expect(sectie).toMatch(
      /<h2\b[^>]*id="projecten-kop"[^>]*>Recent werk<\/h2>/,
    );
    expect(sectie).toMatch(
      /<a\b[^>]*href="\/projecten"[^>]*>Alle projecten<svg\b/,
    );
    expect(sectie).toContain("underline");
    expect(projectTitels(sectie)).toEqual(["Project alpha", "Project gamma"]);
    expect(sectie).not.toContain("Project beta");
  });

  it("staat tussen de inhoud en de andere diensten, en de offerte blijft laatst", async () => {
    const markup = await render(DienstPage, {
      categorie: "voertuigreclame",
      dienst: "magneetplaten",
    });
    const projecten = markup.indexOf('aria-labelledby="projecten-kop"');
    const meer = markup.indexOf('aria-labelledby="meer-kop"');
    const cta = markup.indexOf('aria-labelledby="cta-kop"');
    expect(projecten).toBeGreaterThan(markup.indexOf('id="pagina-kop"'));
    expect(projecten).toBeLessThan(meer);
    expect(meer).toBeLessThan(cta);
    expect(projectTitels(markup)).toEqual(["Project gamma"]);
  });

  it("houdt een logische kopvolgorde", async () => {
    cms.extra = { voordelen: ["Strak gemonteerd."] };
    const markup = await render(DienstPage, {
      categorie: "voertuigreclame",
      dienst: "carwrapping",
    });
    const niveaus = koppen(markup);
    expect(niveaus.filter((niveau) => niveau === 1)).toHaveLength(1);
    niveaus.forEach((niveau, index) => {
      if (index > 0)
        expect(niveau - niveaus[index - 1]!).toBeLessThanOrEqual(1);
    });
  });

  it("wisselt wit en licht af, met en zonder inhoud en projecten", async () => {
    const waarden = { categorie: "voertuigreclame", dienst: "carwrapping" };

    expect(toonVolgorde(await render(DienstPage, waarden))).toEqual([
      "bg-wit",
      "bg-vlak",
    ]);

    cms.extra = { voordelen: ["Strak gemonteerd."] };
    expect(toonVolgorde(await render(DienstPage, waarden))).toEqual([
      "bg-wit",
      "bg-vlak",
      "bg-wit",
    ]);

    cms.projecten = [];
    expect(toonVolgorde(await render(DienstPage, waarden))).toEqual([
      "bg-wit",
      "bg-vlak",
    ]);

    cms.extra = {};
    expect(toonVolgorde(await render(DienstPage, waarden))).toEqual(["bg-wit"]);
  });

  it("laat de sectie weg zonder passend project", async () => {
    const markup = await render(DienstPage, {
      categorie: "voertuigreclame",
      dienst: "autobelettering",
    });
    expect(projectenSectie(markup)).toBeNull();
    expect(markup).not.toContain("Recent werk");
    expect(markup).toContain('aria-labelledby="meer-kop"');
  });
});

describe("recent werk op de categoriepagina", () => {
  it("toont elk project met een dienst uit de categorie één keer, in een lichte sectie", async () => {
    const markup = await render(CategoriePage, { categorie: "interieur" });
    const sectie = projectenSectie(markup) ?? "";
    expect(sectie).toMatch(/^<section\b[^>]*class="[^"]*\bbg-vlak\b/);
    expect(sectie).toMatch(
      /<h2\b[^>]*id="projecten-kop"[^>]*>Recent werk<\/h2>/,
    );
    expect(sectie).toContain('href="/projecten"');
    expect(projectTitels(sectie)).toEqual(["Project beta", "Project delta"]);
  });

  it("staat na de diensten en vóór de offerte-oproep", async () => {
    const markup = await render(CategoriePage, {
      categorie: "voertuigreclame",
    });
    const projecten = markup.indexOf('aria-labelledby="projecten-kop"');
    expect(markup.indexOf('id="diensten-kop"')).toBeLessThan(projecten);
    expect(projecten).toBeLessThan(markup.indexOf('aria-labelledby="cta-kop"'));
    expect(toonVolgorde(markup)).toEqual(["bg-wit", "bg-vlak"]);
  });

  it("toont hoogstens drie projecten", async () => {
    cms.projecten = ["een", "twee", "drie", "vier"].map((slug) =>
      project(slug, [muurteksten]),
    );
    const markup = await render(CategoriePage, { categorie: "interieur" });
    expect(projectTitels(markup)).toEqual([
      "Project een",
      "Project twee",
      "Project drie",
    ]);
  });

  it("laat de sectie weg zonder projecten in de categorie", async () => {
    const markup = await render(CategoriePage, { categorie: "raamfolie" });
    expect(projectenSectie(markup)).toBeNull();
    expect(toonVolgorde(markup)).toEqual(["bg-wit"]);
  });
});
