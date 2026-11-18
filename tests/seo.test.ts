import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { alleDiensten, categorieen } from "@/content/diensten";
import {
  allePaden,
  categorieMetadata,
  dienstMetadata,
  paginaMetadata,
  paginas,
  vastePaginas,
} from "@/content/paginas";
import { env } from "@/env";

describe("sitemap", () => {
  const urls = sitemap().map((entry) => entry.url);

  it("bevat elke vaste pagina, categorie en dienst als absolute URL", () => {
    expect(urls).toHaveLength(
      vastePaginas.length + categorieen.length + alleDiensten().length,
    );
    for (const pad of allePaden()) {
      expect(urls).toContain(new URL(pad, env.APP_URL).toString());
    }
  });

  it("bevat de geneste dienst-URL's", () => {
    expect(urls).toContain(
      new URL(
        "/diensten/voertuigreclame/autobelettering",
        env.APP_URL,
      ).toString(),
    );
  });

  it("heeft geen dubbele URL's", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("robots", () => {
  it("staat de site toe en wijst naar de sitemap", () => {
    const result = robots();
    expect(result.sitemap).toBe(
      new URL("/sitemap.xml", env.APP_URL).toString(),
    );
    expect(result.rules).toMatchObject({ userAgent: "*", allow: "/" });
  });
});

describe("metadata", () => {
  it("geeft elke vaste pagina een titel, omschrijving en canonical", () => {
    for (const pagina of vastePaginas) {
      const meta = paginaMetadata(pagina);
      expect(meta.title, pagina.pad).toBeTruthy();
      expect(meta.description, pagina.pad).toBeTruthy();
      expect(meta.alternates?.canonical).toBe(pagina.pad);
    }
  });

  it("geeft de homepage een absolute titel zonder sjabloon", () => {
    expect(paginaMetadata(paginas.home).title).toEqual({
      absolute: paginas.home.titel,
    });
  });

  it("vat een categorie samen met haar diensten", () => {
    const meta = categorieMetadata("ontwerp");
    expect(meta.title).toBe("Ontwerp, DTP & maatwerk in Groningen");
    expect(meta.description).toContain("DTP & bestandsvoorbereiding");
    expect(meta.description).toContain("demontage & verwijdering");
    expect(meta.alternates?.canonical).toBe("/diensten/ontwerp");
  });

  it("noemt de dienst in de metadata van een dienstpagina", () => {
    const meta = dienstMetadata("raamfolie", "zandstraalfolie");
    expect(meta.title).toBe("Zandstraalfolie in Groningen");
    expect(meta.description).toContain("Privacyfolie");
    expect(meta.alternates?.canonical).toBe(
      "/diensten/raamfolie/zandstraalfolie",
    );
  });

  it("geeft elke pagina eigen Open Graph-gegevens met de vaste velden", () => {
    const voorbeelden = [
      [paginaMetadata(paginas.contact), paginas.contact.pad],
      [categorieMetadata("gevelreclame"), "/diensten/gevelreclame"],
      [
        dienstMetadata("voertuigreclame", "carwrapping"),
        "/diensten/voertuigreclame/carwrapping",
      ],
    ] as const;
    for (const [meta, pad] of voorbeelden) {
      expect(meta.openGraph, pad).toMatchObject({
        locale: "nl_NL",
        siteName: "SignUp Reclame",
        type: "website",
        url: pad,
        description: meta.description,
      });
      expect(meta.openGraph?.title, pad).toBeTruthy();
    }
  });

  it("geeft lege metadata voor onbekende of verkeerd gecombineerde slugs", () => {
    expect(categorieMetadata("bestaat-niet")).toEqual({});
    expect(dienstMetadata("interieur", "autobelettering")).toEqual({});
  });

  it("houdt omschrijvingen van vaste pagina's onder 160 tekens", () => {
    for (const pagina of vastePaginas) {
      expect(pagina.omschrijving.length, pagina.pad).toBeLessThanOrEqual(160);
    }
  });
});
