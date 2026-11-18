import { describe, expect, it } from "vitest";

import { allePaden } from "@/content/paginas";
import { doorverwijzingen, nextRedirects } from "@/content/redirects";

/** Alle pagina's uit de sitemap van de oude site (18 november 2026). */
const oudePaden = [
  "/",
  "/interieur/",
  "/carwrapping/",
  "/autobelettering/",
  "/bewegwijzering/",
  "/specials/",
  "/groot-formaat-print/",
  "/onze-diensten/lichtreclame/",
  "/onze-diensten/raambelettering/",
  "/onze-diensten/totaal-signing/",
  "/onze-diensten/reclameborden/",
  "/onze-diensten/muurteksten/",
  "/onze-diensten/fotobehang/",
  "/groot-formaat-print-2/",
  "/raambelettering-gevel-en-lichtreclame/",
  "/contact-met-sign-up/",
  "/onze-diensten/gevelreclame/",
  "/over-ons/",
  "/offerte-aanvragen/",
  "/onze-diensten/",
  "/onze-diensten/carwrapping/",
  "/onze-diensten/signing/",
  "/onze-diensten/auto-belettering/",
  "/contact/",
  "/project/",
  "/project/specials/",
  "/project/contact/",
  "/project/raambelettering-gevel-en-lichtreclame/",
  "/project/interieur/",
  "/project/groot-formaat-print/",
  "/project/carwrapping/",
  "/project/bewegwijzering/",
  "/project/autobelettering/",
  "/project_category/signup/",
];

const zonderSlash = (pad: string) =>
  pad.length > 1 && pad.endsWith("/") ? pad.slice(0, -1) : pad;

describe("doorverwijzingen van de oude site", () => {
  const nieuwePaden = new Set(allePaden());
  const bronnen = new Set(doorverwijzingen.map((d) => d.van));

  it("dekt elke oude URL: als bestaande pagina of als doorverwijzing", () => {
    for (const oud of oudePaden.map(zonderSlash)) {
      expect(nieuwePaden.has(oud) || bronnen.has(oud), oud).toBe(true);
    }
  });

  it("verwijst alleen naar pagina's die bestaan", () => {
    for (const { van, naar } of doorverwijzingen) {
      expect(nieuwePaden.has(naar), `${van} -> ${naar}`).toBe(true);
    }
  });

  it("overschrijft geen bestaande pagina en heeft geen dubbele bronnen", () => {
    expect(bronnen.size).toBe(doorverwijzingen.length);
    for (const bron of bronnen) expect(nieuwePaden.has(bron), bron).toBe(false);
  });

  it("levert permanente redirects voor next.config.ts", () => {
    const redirects = nextRedirects();
    expect(redirects).toHaveLength(doorverwijzingen.length);
    for (const r of redirects) {
      expect(r.permanent).toBe(true);
      expect(r.source.startsWith("/")).toBe(true);
    }
  });
});
