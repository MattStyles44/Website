import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Stappenplan } from "@/components/stappenplan";
import { VragenLijst } from "@/components/vragen-lijst";
import { categorieen } from "@/content/diensten";
import { homeVragen, stappen, teamfoto } from "@/content/home";
import { categoriePad, paginas } from "@/content/paginas";
import { site, vestiging } from "@/content/site";
import { organisatieJsonLd, serialiseerJsonLd } from "@/lib/seo/json-ld";

const basis = "https://www.sign-up.nl";

describe("gestructureerde gegevens van het bedrijf", () => {
  const data = organisatieJsonLd(basis, vestiging);

  it("geeft het logo en de teamfoto als absolute URL", () => {
    expect(data.logo).toBe("https://www.sign-up.nl/brand/signup-logo.svg");
    expect(data.image).toBe("https://www.sign-up.nl/fotos/team-etalage.jpg");
    expect(teamfoto.src).toBe("/fotos/team-etalage.jpg");
  });

  it("noemt de vakgebieden", () => {
    expect(data.knowsAbout).toEqual(
      expect.arrayContaining([
        "Autobelettering",
        "Carwrapping",
        "Gevelreclame",
        "Lichtreclame",
        "Raamfolie",
        "Bewegwijzering",
      ]),
    );
  });

  it("zet de zes categorieën op volgorde in een aanbodcatalogus", () => {
    const catalogus = data.hasOfferCatalog as Record<string, unknown>;
    expect(catalogus).toMatchObject({
      "@type": "OfferCatalog",
      name: paginas.diensten.titel,
    });
    const items = catalogus.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(categorieen.length);
    items.forEach((item, index) => {
      const categorie = categorieen[index]!;
      expect(item).toEqual({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: categorie.naam,
          url: `${basis}${categoriePad(categorie.slug)}`,
        },
      });
    });
  });

  it("houdt de bestaande velden, ook zonder vestigingsadres", () => {
    expect(data).toMatchObject({
      "@type": "LocalBusiness",
      "@id": "https://www.sign-up.nl/#organisatie",
      name: site.naam,
      slogan: site.slogan,
      description: paginas.home.omschrijving,
      telephone: "+31651556433",
      address: { streetAddress: "Koldingweg 9", postalCode: "9723 HL" },
    });
    expect(data.areaServed).toHaveLength(3);
    const zonderAdres = organisatieJsonLd(basis, undefined);
    expect(zonderAdres["@type"]).toBe("Organization");
    expect(zonderAdres).toHaveProperty("hasOfferCatalog");
    expect(zonderAdres).toHaveProperty("logo");
  });

  it("blijft geldige JSON in een script-tag", () => {
    const json = serialiseerJsonLd(data);
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual(JSON.parse(JSON.stringify(data)));
  });
});

describe("stappenplan", () => {
  it("is een <ol> met per stap een h3 en tekst", () => {
    const markup = renderToStaticMarkup(
      createElement(Stappenplan, { stappen }),
    );
    expect(markup).toMatch(/^<ol\b/);
    expect(markup.match(/<li\b/g)).toHaveLength(stappen.length);
    expect(markup.match(/<h3\b/g)).toHaveLength(stappen.length);
    expect(markup).toContain("Productie en montage");
  });

  it("steekt af tegen het vlak van de sectie", () => {
    const opWit = renderToStaticMarkup(
      createElement(Stappenplan, { stappen, toon: "wit" }),
    );
    const opVlak = renderToStaticMarkup(
      createElement(Stappenplan, { stappen, toon: "vlak" }),
    );
    expect(opWit).toMatch(/<li\b[^>]*\bbg-vlak\b/);
    expect(opWit).not.toMatch(/\bbg-wit\b/);
    expect(opVlak).toMatch(/<li\b[^>]*\bbg-wit\b/);
    expect(opVlak).not.toMatch(/\bbg-vlak\b/);
  });
});

describe("vragenlijst", () => {
  it("zet elke vraag in een <summary> en het antwoord ernaast in de HTML", () => {
    const markup = renderToStaticMarkup(
      createElement(VragenLijst, { vragen: homeVragen }),
    );
    const items = markup.match(/<details\b[\s\S]*?<\/details>/g) ?? [];
    expect(items).toHaveLength(homeVragen.length);
    expect(markup).not.toMatch(/<details\b[^>]*\sopen/);
    expect(markup).not.toMatch(/<h[1-6]\b/);
    items.forEach((item, index) => {
      expect(item).toContain(`<summary`);
      expect(item).toContain(homeVragen[index]!.vraag);
      expect(item).toContain(
        homeVragen[index]!.antwoord.replace(/'/g, "&#x27;"),
      );
    });
  });

  it("steekt af tegen het vlak van de sectie", () => {
    const opVlak = renderToStaticMarkup(
      createElement(VragenLijst, { vragen: homeVragen, toon: "vlak" }),
    );
    expect(opVlak).toMatch(/<details\b[^>]*\bbg-wit\b/);
    expect(opVlak).not.toMatch(/\bbg-vlak\b/);
  });
});
