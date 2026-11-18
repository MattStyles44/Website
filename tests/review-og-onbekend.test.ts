import { beforeEach, describe, expect, it, vi } from "vitest";

import DienstAfbeelding from "@/app/diensten/[categorie]/[dienst]/opengraph-image";
import CategorieAfbeelding from "@/app/diensten/[categorie]/opengraph-image";

// De afbeelding zelf tekenen is hier niet nodig; alleen of en met welke titel.
const { maakDeelafbeelding } = vi.hoisted(() => ({
  maakDeelafbeelding: vi.fn(() => new Response("png")),
}));
vi.mock("@/lib/seo/deelafbeelding", () => ({
  deelafbeeldingFormaat: { width: 1200, height: 630 },
  maakDeelafbeelding,
}));

/** De fout die notFound() gooit; Next.js maakt daar een 404 van. */
const nietGevonden = "NEXT_HTTP_ERROR_FALLBACK;404";

describe("deelafbeeldingen bij onbekende webadressen", () => {
  beforeEach(() => maakDeelafbeelding.mockClear());

  it("geeft een 404 voor een onbekende categorie", async () => {
    await expect(
      CategorieAfbeelding({
        params: Promise.resolve({ categorie: "bestaat-niet" }),
      }),
    ).rejects.toHaveProperty("digest", nietGevonden);
    expect(maakDeelafbeelding).not.toHaveBeenCalled();
  });

  it("geeft een 404 voor een onbekende of verkeerd gecombineerde dienst", async () => {
    for (const params of [
      { categorie: "voertuigreclame", dienst: "bestaat-niet" },
      { categorie: "interieur", dienst: "autobelettering" },
      { categorie: "bestaat-niet", dienst: "autobelettering" },
    ]) {
      await expect(
        DienstAfbeelding({ params: Promise.resolve(params) }),
        `${params.categorie}/${params.dienst}`,
      ).rejects.toHaveProperty("digest", nietGevonden);
    }
    expect(maakDeelafbeelding).not.toHaveBeenCalled();
  });

  it("maakt de afbeelding voor bestaande categorieën en diensten", async () => {
    await CategorieAfbeelding({
      params: Promise.resolve({ categorie: "raamfolie" }),
    });
    await DienstAfbeelding({
      params: Promise.resolve({
        categorie: "raamfolie",
        dienst: "zandstraalfolie",
      }),
    });
    expect(maakDeelafbeelding.mock.calls).toEqual([
      [
        {
          titel: "Raamfolies & glasdecoratie",
          ondertitel: "Op maat, met een vrijblijvende offerte",
        },
      ],
      [{ titel: "Zandstraalfolie", ondertitel: "Raamfolies & glasdecoratie" }],
    ]);
  });
});
