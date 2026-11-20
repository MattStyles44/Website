import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PaginaKop, SectieKop } from "@/components/pagina-kop";
import { ProjectBlok, UitgelichteProjecten } from "@/components/project";
import { Kaart, Sticker } from "@/components/ui";
import type { Foto, ProjectKaart } from "@/lib/cms";

function foto(naam: string, breedte: number, hoogte: number): Foto {
  return {
    url: `https://cdn.sanity.io/images/abc123/production/${naam}-${breedte}x${hoogte}.jpg`,
    alt: `Foto van ${naam}`,
    breedte,
    hoogte,
  };
}

function project(velden: Partial<ProjectKaart> = {}): ProjectKaart {
  return {
    titel: "Gevelreclame voor een bakkerij",
    slug: "gevel-bakkerij",
    samenvatting: "Freesletters op de gevel en raamfolie in de etalage.",
    uitgelicht: true,
    diensten: [],
    fotos: [
      foto("gevel", 1600, 1200),
      foto("letters", 1000, 1000),
      foto("etalage", 1200, 800),
    ],
    ...velden,
  };
}

const html = (element: ReactElement) => renderToStaticMarkup(element);

/** De classes van het eerste element in de markup. */
const eersteKlassen = (markup: string) =>
  (markup.match(/^<[a-z0-9]+\b[^>]*\sclass="([^"]*)"/)?.[1] ?? "").split(/\s+/);

/** Alle classes in de markup. */
const alleKlassen = (markup: string) =>
  [...markup.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) =>
    (m[1] ?? "").split(/\s+/),
  );

/** De classes van elk element met een bepaalde tag. */
const klassenVan = (markup: string, tag: string) =>
  [
    ...markup.matchAll(new RegExp(`<${tag}\\b[^>]*\\sclass="([^"]*)"`, "g")),
  ].map((m) => (m[1] ?? "").split(/\s+/));

/** Elke foto met de classes van zijn kader (het element er direct omheen). */
function fotosMetKader(markup: string) {
  return [
    ...markup.matchAll(
      /<([a-z]+) class="([^"]*)"><img\b[^>]*\sclass="([^"]*)"[^>]*>/g,
    ),
  ].map((m) => ({
    kader: (m[2] ?? "").split(/\s+/),
    foto: (m[3] ?? "").split(/\s+/),
  }));
}

describe("kaarten", () => {
  const zonderLink = html(
    createElement(Kaart, { titel: "Autobelettering" }, "Tekst"),
  );
  const metLink = html(
    createElement(
      Kaart,
      { titel: "Carwrapping", href: "/diensten/voertuigen/carwrapping" },
      "Tekst",
    ),
  );

  it("komen allebei rustig in beeld bij scrollen", () => {
    for (const markup of [zonderLink, metLink]) {
      expect(markup).toMatch(/^<article\b/);
      expect(eersteKlassen(markup)).toContain("onthul");
    }
  });

  it("komen met een link iets omhoog bij hover, kort en zonder veren", () => {
    const klassen = eersteKlassen(metLink);
    expect(klassen).toEqual(
      expect.arrayContaining([
        "hover:-translate-y-1",
        "hover:border-blauw",
        "duration-150",
        "ease-out",
      ]),
    );
    const overgang = klassen.find((klas) => klas.startsWith("transition-"));
    expect(overgang).toMatch(/translate/);
    expect(overgang).toMatch(/border-color/);
  });

  it("bewegen niet voor wie minder beweging wil", () => {
    const klassen = eersteKlassen(metLink);
    expect(klassen).toContain("motion-reduce:transition-none");
    expect(klassen).toContain("motion-reduce:hover:translate-y-0");
  });

  it("bewegen zonder link niet bij hover", () => {
    expect(
      alleKlassen(zonderLink).some((klas) => klas.includes("hover:")),
    ).toBe(false);
  });

  it("blijven vlak, zonder schaduw", () => {
    for (const markup of [zonderLink, metLink]) {
      expect(alleKlassen(markup).some((klas) => /(^|:)shadow/.test(klas))).toBe(
        false,
      );
    }
  });
});

describe("koppen", () => {
  it("laat een sectiekop rustig in beeld komen", () => {
    const markup = html(
      createElement(SectieKop, { id: "werk", titel: "Recent werk" }),
    );
    expect(eersteKlassen(markup)).toContain("onthul");
    expect(markup).toContain("<h2");
  });

  it("toont de paginakop met de h1 meteen, zonder onthullen", () => {
    const markup = html(
      createElement(
        PaginaKop,
        {
          titel: "Over ons",
          kruimels: [{ label: "Home", href: "/" }],
          naast: createElement(Sticker, null, "Sinds 2001"),
        },
        "Intro",
      ),
    );
    expect(markup).toContain("<h1");
    expect(alleKlassen(markup)).not.toContain("onthul");
  });
});

describe("projecten", () => {
  const blokken = [
    html(createElement(ProjectBlok, { project: project() })),
    html(createElement(ProjectBlok, { project: project(), groot: true })),
    html(
      createElement(ProjectBlok, {
        project: project({ voorFoto: foto("gevel-voor", 1200, 1600) }),
      }),
    ),
  ];
  const uitgelicht = [
    html(createElement(UitgelichteProjecten, { projecten: [project()] })),
    html(
      createElement(UitgelichteProjecten, {
        projecten: [
          project(),
          project({ slug: "tweede" }),
          project({ slug: "derde" }),
        ],
      }),
    ),
  ];

  it("laten elk project rustig in beeld komen", () => {
    for (const markup of [...blokken, ...uitgelicht]) {
      const artikelen = klassenVan(markup, "article");
      expect(artikelen.length).toBeGreaterThan(0);
      for (const klassen of artikelen) expect(klassen).toContain("onthul");
    }
  });

  it("zoomen elke foto bij hover hooguit 3% in, binnen een afgerond kader", () => {
    for (const markup of [...blokken, ...uitgelicht]) {
      const fotos = fotosMetKader(markup);
      expect(fotos).toHaveLength((markup.match(/<img\b/g) ?? []).length);
      expect(fotos.length).toBeGreaterThan(0);
      for (const { kader, foto: klassen } of fotos) {
        expect(kader).toContain("overflow-hidden");
        const hoek = klassen.find((klas) => /^rounded-/.test(klas));
        expect(hoek).toBeDefined();
        expect(kader).toContain(hoek);

        const zoom = klassen
          .map((klas) => klas.match(/^group-hover\/foto:scale-\[([\d.]+)\]$/))
          .find(Boolean);
        expect(zoom, klassen.join(" ")).toBeDefined();
        expect(Number(zoom?.[1])).toBeGreaterThan(1);
        expect(Number(zoom?.[1])).toBeLessThanOrEqual(1.03);
        expect(kader).toContain("group/foto");
      }
    }
  });

  it("zoomen niet voor wie minder beweging wil", () => {
    for (const markup of [...blokken, ...uitgelicht]) {
      for (const { foto: klassen } of fotosMetKader(markup)) {
        expect(klassen).toContain("motion-reduce:transition-none");
        expect(klassen).toContain("motion-reduce:group-hover/foto:scale-100");
      }
    }
  });

  it("houden de verhouding op de foto zelf, zodat het kader niet verspringt", () => {
    const [klein, groot] = blokken;
    expect(fotosMetKader(klein ?? "")[0]?.foto).toContain("aspect-[4/3]");
    expect(fotosMetKader(groot ?? "")[0]?.foto).toContain("aspect-[3/2]");
    for (const { foto: klassen } of fotosMetKader(klein ?? "").slice(1)) {
      expect(klassen).toContain("aspect-square");
    }
  });
});
