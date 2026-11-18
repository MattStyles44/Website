import { describe, expect, it } from "vitest";

import {
  categorieMetadata,
  dienstMetadata,
  paginaMetadata,
  paginas,
  vastePaginas,
} from "@/content/paginas";
import { site } from "@/content/site";

describe("deelafbeelding op vaste pagina's", () => {
  it("verwijst elke vaste pagina behalve de homepage naar de algemene deelafbeelding", () => {
    const anderePaginas = vastePaginas.filter((pagina) => pagina.pad !== "/");
    expect(anderePaginas.length).toBeGreaterThan(0);
    for (const pagina of anderePaginas) {
      expect(paginaMetadata(pagina).openGraph?.images, pagina.pad).toEqual([
        {
          url: "/opengraph-image",
          alt: `${site.naam}: ${site.slogan}`,
          type: "image/png",
          width: 1200,
          height: 630,
        },
      ]);
    }
  });

  it("laat de afbeelding uit de eigen map staan bij de homepage, categorieën en diensten", () => {
    // Een eigen `images` zou de afbeelding van opengraph-image.tsx in die map overschrijven.
    expect(paginaMetadata(paginas.home).openGraph).not.toHaveProperty("images");
    expect(categorieMetadata("gevelreclame").openGraph).not.toHaveProperty(
      "images",
    );
    expect(
      dienstMetadata("raamfolie", "zandstraalfolie").openGraph,
    ).not.toHaveProperty("images");
  });
});
