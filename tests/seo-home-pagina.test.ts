import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home, { metadata } from "@/app/page";
import { categorieen, getDienst } from "@/content/diensten";
import {
  homeIntro,
  homeKop,
  homeSecties,
  homeVragen,
  stappen,
  vertrouwenspunten,
  wagenparkTekst,
} from "@/content/home";
import { categoriePad, dienstPad, paginas } from "@/content/paginas";
import { site } from "@/content/site";
import type { ProjectKaart } from "@/lib/cms";

// De homepage haalt projecten alleen via "@/lib/cms"; hier zonder Sanity.
const cms = vi.hoisted(() => ({ projecten: [] as unknown[] }));
vi.mock("@/lib/cms", () => ({
  haalCategorieTekst: async () => ({ tekst: [] }),
  haalDienstTekst: async () => undefined,
  haalProjecten: async () => cms.projecten,
}));

beforeEach(() => {
  cms.projecten = [];
});

function project(slug: string): ProjectKaart {
  return {
    titel: `Project ${slug}`,
    slug,
    samenvatting: `Samenvatting van ${slug}.`,
    uitgelicht: true,
    diensten: [],
    fotos: [],
  };
}

async function home(): Promise<string> {
  return renderToStaticMarkup(await (Home as () => Promise<ReactElement>)());
}

/** Zichtbare tekst: zonder scripts en tags, met gewone tekens en spaties. */
function tekst(markup: string): string {
  return markup
    .replace(/<script\b[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ");
}

function koppen(markup: string, niveau: number): string[] {
  return [
    ...markup.matchAll(
      new RegExp(`<h${niveau}\\b[^>]*>([\\s\\S]*?)</h${niveau}>`, "g"),
    ),
  ].map((m) => tekst(m[1]!).trim());
}

/** De toon van elke sectie op de pagina, op volgorde. */
function tonen(markup: string): string[] {
  return [
    ...markup.matchAll(
      /<section\b[^>]*aria-labelledby="([^"]+)"[^>]*class="[^"]*\b(bg-wit|bg-vlak|op-donker)\b/g,
    ),
  ].map((m) => `${m[1]}:${m[2]}`);
}

function jsonLd(markup: string): Array<Record<string, unknown>> {
  return [
    ...markup.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => JSON.parse(m[1]!) as Record<string, unknown>);
}

describe("metadata van de homepage", () => {
  it("gebruikt de titel en omschrijving voor 'belettering Groningen'", () => {
    expect(metadata.title).toEqual({
      absolute: "Belettering en reclame in Groningen | SignUp Reclame",
    });
    expect(metadata.description).toBe(
      "Autobelettering, gevelreclame en raamfolie in Groningen en Noord-Nederland. A-merk folie, 25 jaar vakmanschap. Vraag vrijblijvend een offerte aan.",
    );
    expect(paginas.home.titel.length).toBeLessThanOrEqual(60);
    expect(paginas.home.omschrijving.length).toBeLessThanOrEqual(155);
  });

  it("laat de slogan voor de voet en de deelafbeelding staan", () => {
    expect(site.slogan).toBe("Signing en visuele communicatie in Groningen");
  });
});

describe("openingsvlak", () => {
  it("heeft één h1 met de zoekterm, de intro en de vier vertrouwenspunten", async () => {
    const markup = await home();
    expect(koppen(markup, 1)).toEqual(["Belettering en reclame in Groningen"]);
    expect(homeKop).toBe("Belettering en reclame in Groningen");
    expect(tekst(markup)).toContain(
      "Van autobelettering en carwrapping tot gevelreclame en raamfolie: SignUp Reclame maakt en monteert al 25 jaar reclame voor ondernemers in Groningen, Friesland en Drenthe. Met alleen A-merk gietfolie en strakke afwerking. Je spreekt direct met de vakman die het werk ook uitvoert.",
    );
    expect(tekst(markup)).toContain(homeIntro);
    expect(vertrouwenspunten).toEqual([
      "A-merk folie van 3M, Avery Dennison en Oracal",
      "25 jaar vakmanschap",
      "Reactie binnen 24 uur op werkdagen",
      "Eigen werkplaats aan de Koldingweg 9 in Groningen",
    ]);
  });

  it("zet de vertrouwenspunten na de knoppen in een lijst met een vinkje", async () => {
    const markup = await home();
    const knoppen = markup.indexOf('href="/projecten"');
    const lijst = markup.match(
      /<ul\b[^>]*>(?:(?!<\/ul>)[\s\S])*?Koldingweg 9[\s\S]*?<\/ul>/,
    )?.[0];
    expect(lijst, "lijst met vertrouwenspunten").toBeDefined();
    expect(markup.indexOf(lijst!)).toBeGreaterThan(knoppen);
    expect(lijst!.match(/<li\b/g)).toHaveLength(4);
    expect(lijst!.match(/<svg\b[^>]*aria-hidden="true"/g)).toHaveLength(4);
    for (const punt of vertrouwenspunten) expect(tekst(lijst!)).toContain(punt);
  });

  it("houdt de knoppen, de teamfoto en de sticker", async () => {
    const markup = await home();
    expect(markup).toContain('href="/offerte"');
    expect(markup).toContain('href="/projecten"');
    expect(markup).toMatch(
      /<img\b[^>]*alt="Het team van SignUp Reclame bij een etalage met grote zwart-witte raamfolie"[^>]*>/,
    );
    expect(markup).toContain("team-etalage");
    expect(tekst(markup)).toContain(`${site.ervaring} vakmanschap`);
  });
});

describe("secties", () => {
  it("heeft de h2's in de afgesproken volgorde, zonder projecten", async () => {
    expect(koppen(await home(), 2)).toEqual([
      "Onze diensten: van bedrijfsbus tot gevel",
      "Voor wagenparken en complete panden",
      "Waarom ondernemers in Noord-Nederland voor SignUp kiezen",
      "Zo werkt het: van aanvraag tot montage",
      "Veelgestelde vragen over belettering",
      "Vrijblijvende offerte op maat",
    ]);
  });

  it("zet de projecten tussen wagenparken en waarom, alleen met uitgelichte projecten", async () => {
    cms.projecten = [project("vloot")];
    const h2 = koppen(await home(), 2);
    expect(h2.slice(0, 4)).toEqual([
      homeSecties.diensten,
      homeSecties.wagenpark,
      "Recent werk in Groningen en omgeving",
      homeSecties.waarom,
    ]);
    cms.projecten = [{ ...project("vloot"), uitgelicht: false }];
    expect(koppen(await home(), 2)).not.toContain(homeSecties.projecten);
  });

  it("wisselt witte en lichte vlakken af, met en zonder projecten", async () => {
    expect(tonen(await home())).toEqual([
      "home-kop:bg-wit",
      "diensten-kop:bg-vlak",
      "wagenpark-kop:bg-wit",
      "waarom-kop:bg-vlak",
      "werkwijze-kop:bg-wit",
      "vragen-kop:bg-vlak",
      "cta-kop:op-donker",
    ]);
    cms.projecten = [project("vloot")];
    expect(tonen(await home())).toEqual([
      "home-kop:bg-wit",
      "diensten-kop:bg-vlak",
      "wagenpark-kop:bg-wit",
      "projecten-kop:bg-vlak",
      "waarom-kop:bg-wit",
      "werkwijze-kop:bg-vlak",
      "vragen-kop:bg-wit",
      "cta-kop:op-donker",
    ]);
  });

  it("slaat met en zonder projecten nooit een kopniveau over", async () => {
    for (const lijst of [[], [project("vloot")]]) {
      cms.projecten = lijst;
      const niveaus = [...(await home()).matchAll(/<h([1-6])\b/g)].map((m) =>
        Number(m[1]),
      );
      expect(niveaus[0]).toBe(1);
      niveaus.forEach((niveau, index) => {
        if (index > 0)
          expect(niveau).toBeLessThanOrEqual(niveaus[index - 1]! + 1);
      });
    }
  });

  it("houdt de zes categorieën als h3 met hun links, en de links naar meer", async () => {
    const markup = await home();
    const h3 = koppen(markup, 3);
    for (const categorie of categorieen) {
      expect(h3).toContain(categorie.naam);
      expect(markup).toContain(`href="${categoriePad(categorie.slug)}"`);
    }
    expect(markup).toContain(`href="${paginas.diensten.pad}"`);
    expect(markup).toContain(`href="${paginas.overOns.pad}"`);
  });
});

describe("wagenparken en complete panden", () => {
  it("toont de tekst, een offertelink en vijf diensten met hun eigen naam", async () => {
    const markup = await home();
    const sectie = markup.match(
      /<section\b[^>]*aria-labelledby="wagenpark-kop"[\s\S]*?<\/section>/,
    )?.[0];
    expect(sectie, "sectie").toBeDefined();
    expect(tekst(sectie!)).toContain(wagenparkTekst);
    expect(sectie).toContain('href="/offerte"');
    const diensten: Array<[string, string]> = [
      ["voertuigreclame", "autobelettering"],
      ["voertuigreclame", "carwrapping"],
      ["gevelreclame", "3d-doosletters"],
      ["gevelreclame", "lichtbakken"],
      ["raamfolie", "raambelettering"],
    ];
    const links = new Map(
      [
        ...sectie!.matchAll(/<a\b[^>]*\shref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g),
      ].map((m) => [m[1]!, tekst(m[2]!).trim()]),
    );
    for (const [categorie, slug] of diensten) {
      expect(links.get(dienstPad(categorie, slug)), slug).toBe(
        getDienst(categorie, slug)!.naam,
      );
    }
  });
});

describe("zo werkt het", () => {
  it("toont vier stappen in een <ol>, elk met een h3 en de tekst", async () => {
    const markup = await home();
    const lijst = markup.match(/<ol\b[\s\S]*?<\/ol>/)?.[0] ?? "";
    expect(lijst.match(/<li\b/g)).toHaveLength(4);
    expect(koppen(lijst, 3)).toEqual([
      "Aanvraag",
      "Reactie en advies",
      "Offerte op maat",
      "Productie en montage",
    ]);
    expect(tekst(lijst)).toContain(
      "Reactie binnen 24 uur op werkdagen. Waar nodig volgt een meet- of adviesafspraak op locatie of in de werkplaats.",
    );
    for (const stap of stappen) expect(tekst(lijst)).toContain(stap.tekst);
  });
});

describe("veelgestelde vragen", () => {
  it("toont elke vraag als <summary> met het antwoord in de HTML", async () => {
    const markup = await home();
    const items = markup.match(/<details\b[\s\S]*?<\/details>/g) ?? [];
    expect(items).toHaveLength(4);
    homeVragen.forEach((item, index) => {
      const summary = items[index]!.match(/<summary\b[\s\S]*?<\/summary>/)?.[0];
      expect(tekst(summary ?? "")).toContain(item.vraag);
      expect(tekst(items[index]!)).toContain(item.antwoord);
    });
    expect(tekst(markup)).toContain(
      "Ja, in heel Noord-Nederland: Groningen, Friesland en Drenthe. Een meet- of adviesafspraak kan op locatie of in onze werkplaats aan de Koldingweg 9 in Groningen.",
    );
  });

  it("geeft precies dezelfde vragen als FAQPage aan zoekmachines", async () => {
    const markup = await home();
    const faq = jsonLd(markup).filter((item) => item["@type"] === "FAQPage");
    expect(faq).toHaveLength(1);
    const vragen = (faq[0]!.mainEntity as Array<Record<string, unknown>>).map(
      (vraag) => ({
        vraag: vraag.name,
        antwoord: (vraag.acceptedAnswer as Record<string, unknown>).text,
      }),
    );
    expect(vragen).toEqual(homeVragen);
    for (const item of homeVragen) {
      expect(tekst(markup)).toContain(item.vraag);
      expect(tekst(markup)).toContain(item.antwoord);
    }
  });

  it("noemt geen prijzen", async () => {
    expect(tekst(await home())).not.toMatch(/€|\beuro\b/i);
  });
});
