import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ContactPage from "@/app/contact/page";
import DienstPage from "@/app/diensten/[categorie]/[dienst]/page";
import CategoriePage from "@/app/diensten/[categorie]/page";
import DienstenPage from "@/app/diensten/page";
import NotFound from "@/app/not-found";
import OverOnsPage from "@/app/over-ons/page";
import Home from "@/app/page";
import PrivacyPage from "@/app/privacy/page";
import ProjectenPage from "@/app/projecten/page";
import { OfferteCta } from "@/components/offerte-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { menuPaneelId } from "@/components/site-menu";
import { categorieen } from "@/content/diensten";
import { hoofdmenu } from "@/content/navigatie";
import { site } from "@/content/site";
import type { Foto, ProjectKaart } from "@/lib/cms";

// De pagina's halen hun gegevens alleen via "@/lib/cms"; hier zonder Sanity.
const cms = vi.hoisted(() => ({
  projecten: [] as unknown[],
  fotos: [] as unknown[],
  extra: {} as Record<string, unknown>,
}));

vi.mock("@/lib/cms", async () => {
  const { maakContentBron } = await import("@/lib/cms/bron");
  const bron = maakContentBron(null);
  return {
    haalCategorieTekst: (slug: string) => bron.categorieTekst(slug),
    haalDienstTekst: async (categorie: string, dienst: string) => {
      const tekst = await bron.dienstTekst(categorie, dienst);
      return tekst ? { ...tekst, fotos: cms.fotos, ...cms.extra } : undefined;
    },
    haalProjecten: async () => cms.projecten,
  };
});

beforeEach(() => {
  cms.projecten = [];
  cms.fotos = [];
  cms.extra = {};
});

type Component = (props?: object) => ReactElement | Promise<ReactElement>;

async function render(component: unknown, props?: object): Promise<string> {
  return renderToStaticMarkup(await (component as Component)(props));
}

const params = <T extends object>(waarden: T) => ({
  params: Promise.resolve(waarden),
});

function foto(naam: string, breedte = 1200, hoogte = 800): Foto {
  return {
    url: `https://cdn.sanity.io/images/abc123/production/${naam}-${breedte}x${hoogte}.jpg`,
    alt: `Foto van ${naam}`,
    breedte,
    hoogte,
  };
}

function project(
  slug: string,
  velden: Partial<ProjectKaart> = {},
): ProjectKaart {
  return {
    titel: `Project ${slug}`,
    slug,
    plaats: "Assen",
    datum: "2026-09-15",
    samenvatting: `Samenvatting van ${slug}.`,
    uitgelicht: true,
    diensten: [],
    fotos: [foto(slug)],
    ...velden,
  };
}

/** De niveaus van alle koppen, in volgorde. */
function koppen(markup: string): number[] {
  return [...markup.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
}

/** Eén h1 vooraan, en nergens een niveau overgeslagen. */
function koppenInOrde(markup: string) {
  const niveaus = koppen(markup);
  expect(niveaus[0], "eerste kop").toBe(1);
  expect(niveaus.filter((niveau) => niveau === 1)).toHaveLength(1);
  niveaus.forEach((niveau, index) => {
    if (index === 0) return;
    expect(niveau - niveaus[index - 1]!, `kop ${index}`).toBeLessThanOrEqual(1);
  });
}

/** De pagina eindigt met de offerte-oproep: daarna komt geen kop meer. */
function eindigtMetOfferte(markup: string) {
  const cta = markup.indexOf('id="cta-kop"');
  expect(cta, "OfferteCta").toBeGreaterThan(0);
  expect(markup.slice(cta).match(/<h[1-6]\b/g)).toBeNull();
  const naCta = markup.slice(cta);
  expect(naCta).toContain(`href="${site.whatsapp}"`);
  expect(naCta).toContain(`href="${site.telefoon.link}"`);
}

describe("kop van de site", () => {
  const markup = renderToStaticMarkup(createElement(SiteHeader));

  it("zet het menupaneel dicht in de HTML, met een knop van minstens 44px", () => {
    const knop = markup.match(/<button\b[^>]*>/)?.[0] ?? "";
    expect(knop).toContain(`aria-controls="${menuPaneelId}"`);
    expect(knop).toContain('aria-expanded="false"');
    expect(knop).toContain('type="button"');
    expect(knop).toMatch(/\bmin-h-11\b/);
    const paneel = markup.match(
      new RegExp(`<div\\b[^>]*\\sid="${menuPaneelId}"[^>]*>`),
    )?.[0];
    expect(paneel, "paneel").toBeDefined();
    expect(paneel).toMatch(/\shidden=""/);
  });

  it("heeft het menu twee keer: breed en in het paneel", () => {
    const paneel = markup.slice(markup.indexOf(` id="${menuPaneelId}"`));
    const breed = markup.slice(0, markup.indexOf(` id="${menuPaneelId}"`));
    for (const item of hoofdmenu) {
      expect(breed).toContain(`href="${item.href}"`);
      expect(paneel).toContain(`href="${item.href}"`);
    }
    expect(paneel).toContain(`href="${site.whatsapp}"`);
    expect(paneel).toContain(`href="${site.telefoon.link}"`);
    expect(paneel).toContain('href="/offerte"');
  });

  it("toont het telefoonnummer en blijft zonder kop", () => {
    expect(markup).toContain(site.telefoon.weergave);
    expect(koppen(markup)).toEqual([]);
  });
});

describe("voet van de site", () => {
  const markup = renderToStaticMarkup(createElement(SiteFooter));

  it("is een navy vlak met de slogan, de reactiebelofte en het werkgebied", () => {
    expect(markup).toMatch(/<footer\b[^>]*class="op-donker"/);
    expect(markup).toContain(site.slogan);
    expect(markup).toContain(site.reactiebelofte);
    expect(markup).toContain(site.regio);
  });
});

describe("offerte-oproep", () => {
  it("vult categorie en dienst in de link in", () => {
    const markup = renderToStaticMarkup(
      createElement(OfferteCta, {
        categorie: "gevelreclame",
        dienst: "lichtbakken",
      }),
    );
    expect(markup).toContain(
      'href="/offerte?categorie=gevelreclame&amp;dienst=lichtbakken"',
    );
    expect(markup).toContain("op-donker");
  });
});

describe("pagina's", () => {
  const vastePaginas: Array<[string, unknown, object?]> = [
    ["home", Home],
    ["diensten", DienstenPage],
    ["categorie", CategoriePage, params({ categorie: "interieur" })],
    [
      "dienst",
      DienstPage,
      params({ categorie: "ontwerp", dienst: "ontwerp-en-visualisatie" }),
    ],
    ["projecten", ProjectenPage],
    ["over ons", OverOnsPage],
    ["contact", ContactPage],
    ["privacy", PrivacyPage],
    ["niet gevonden", NotFound],
  ];

  it.each(vastePaginas)(
    "%s heeft een logische kopvolgorde en eindigt met de offerte-oproep",
    async (_naam, pagina, props) => {
      const markup = await render(pagina, props);
      koppenInOrde(markup);
      eindigtMetOfferte(markup);
      expect(markup).not.toMatch(/<iframe\b/);
    },
  );

  it("houdt de kopvolgorde ook met alle inhoud uit Sanity", async () => {
    cms.projecten = [project("a"), project("b"), project("c")];
    cms.fotos = [foto("bus"), foto("gevel", 800, 1200)];
    cms.extra = {
      voordelen: ["Strak gemonteerd"],
      werkwijze: [{ titel: "Meten", tekst: "We meten je bus op." }],
      garantie: "Garantie op de folie.",
      vragen: [{ vraag: "Hoe lang?", antwoord: "Een dag." }],
    };
    koppenInOrde(await render(Home));
    koppenInOrde(await render(ProjectenPage));
    const dienst = await render(
      DienstPage,
      params({ categorie: "voertuigreclame", dienst: "carwrapping" }),
    );
    koppenInOrde(dienst);
    eindigtMetOfferte(dienst);
    // Werkwijze als genummerde stappen, vragen als uitklapbare items.
    expect(dienst).toMatch(/<ol\b[\s\S]*Meten[\s\S]*<\/ol>/);
    expect(dienst).toMatch(/<details\b[\s\S]*<summary\b[\s\S]*Hoe lang\?/);
    expect(dienst).toContain("Garantie op de folie.");
  });

  it("toont op de homepage de diensten als kaarten en de drie uitgelichte projecten", async () => {
    cms.projecten = [
      project("een"),
      project("twee", { uitgelicht: false }),
      project("drie"),
      project("vier"),
      project("vijf"),
    ];
    const markup = await render(Home);
    for (const categorie of categorieen) {
      expect(markup).toContain(categorie.naam.replace(/&/g, "&amp;"));
    }
    expect(markup).toContain("Project een");
    expect(markup).toContain("Project drie");
    expect(markup).toContain("Project vier");
    expect(markup).not.toContain("Project twee");
    expect(markup).not.toContain("Project vijf");
    expect(markup).toContain(`${site.ervaring} vakmanschap`);
  });

  it("laat de projectensectie op de homepage weg zonder uitgelichte projecten", async () => {
    cms.projecten = [project("een", { uitgelicht: false })];
    const markup = await render(Home);
    expect(markup).not.toContain('id="projecten-kop"');
    expect(markup).not.toContain("Project een");
    expect(markup).toContain('href="/projecten"');
  });

  it("geeft foto's hun afmetingen, een sizes-attribuut en de beschrijving uit Sanity", async () => {
    cms.projecten = [
      project("met", { fotos: [foto("bus"), foto("detail", 1000, 1000)] }),
      project("zonder", { fotos: [] }),
    ];
    const markup = await render(ProjectenPage);
    const imgs = markup.match(/<img\b[^>]*>/g) ?? [];
    expect(imgs).toHaveLength(2);
    for (const img of imgs) {
      expect(img).toMatch(/\ssizes="[^"]+"/);
      expect(img).toMatch(/\swidth="\d+"/);
      expect(img).toMatch(/\sheight="\d+"/);
    }
    expect(imgs[0]).toContain('alt="Foto van bus"');
    expect(imgs[0]).toContain('width="1200"');
    expect(imgs[1]).toContain('alt="Foto van detail"');
    expect(imgs[1]).toContain('height="1000"');
    expect(markup).toContain(
      '<time dateTime="2026-09-15">september 2026</time>',
    );
  });

  it("toont zonder projecten een vriendelijke lege staat met een weg verder", async () => {
    const markup = await render(ProjectenPage);
    expect(markup).toContain("Binnenkort te zien");
    expect(markup).toContain('href="/diensten"');
    expect(markup).not.toMatch(/<img\b/);
  });

  it("geeft het adres op de contactpagina met een gewone link naar een routeplanner", async () => {
    const markup = await render(ContactPage);
    expect(markup).toMatch(/<address\b/);
    expect(markup).toContain("https://www.google.com/maps/dir/?api=1&amp;");
    expect(markup).toContain(site.regio);
  });
});
