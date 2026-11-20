import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProjectBlok, UitgelichteProjecten } from "@/components/project";
import { SanityFoto } from "@/components/sanity-foto";
import type { Foto, ProjectKaart } from "@/lib/cms";

function foto(naam: string, breedte: number, hoogte: number): Foto {
  return {
    url: `https://cdn.sanity.io/images/abc123/production/${naam}-${breedte}x${hoogte}.jpg`,
    alt: `Foto van ${naam}`,
    breedte,
    hoogte,
  };
}

const voor = foto("raam-voor", 1200, 1600);
const na = foto("raam-na", 1600, 1200);
const detail = foto("raam-detail", 1000, 1000);
const achter = foto("raam-achter", 1200, 800);

function project(velden: Partial<ProjectKaart> = {}): ProjectKaart {
  return {
    titel: "Raamfolie voor een kantoor",
    slug: "raamfolie-kantoor",
    samenvatting: "Zandstraalfolie met logo op de pui.",
    uitgelicht: true,
    diensten: [],
    fotos: [na, detail, achter],
    ...velden,
  };
}

const render = (props: Parameters<typeof ProjectBlok>[0]) =>
  renderToStaticMarkup(createElement(ProjectBlok, props));

/** Alle <img>-tags, in volgorde. */
const afbeeldingen = (markup: string) => markup.match(/<img\b[^>]*>/g) ?? [];

const alts = (markup: string) =>
  afbeeldingen(markup).map((img) => img.match(/\salt="([^"]*)"/)?.[1]);

const figuren = (markup: string) =>
  markup.match(/<figure\b[\s\S]*?<\/figure>/g) ?? [];

const bijschrift = (figuur: string) =>
  figuur.match(/<figcaption\b([^>]*)>([\s\S]*?)<\/figcaption>/);

const sizes = (img: string) => img.match(/\ssizes="([^"]*)"/)?.[1];

describe("voor en na in een projectblok", () => {
  it("zet Voor en Na elk in een eigen figuur met een zichtbaar label", () => {
    const markup = render({ project: project({ voorFoto: voor }) });
    const [eerste, tweede] = figuren(markup);
    expect(figuren(markup)).toHaveLength(2);
    expect(alts(eerste ?? "")).toEqual([voor.alt]);
    expect(alts(tweede ?? "")).toEqual([na.alt]);
    expect(bijschrift(eerste ?? "")?.[2]).toBe("Voor");
    expect(bijschrift(tweede ?? "")?.[2]).toBe("Na");
    for (const figuur of [eerste, tweede]) {
      const klassen = bijschrift(figuur ?? "")?.[1] ?? "";
      expect(klassen).not.toMatch(/\bsr-only\b/);
      expect(klassen).toMatch(/\bbg-wit\b/);
      expect(klassen).toMatch(/\btext-navy\b/);
    }
  });

  it("stapelt het paar op smalle schermen en zet het vanaf sm naast elkaar", () => {
    const markup = render({ project: project({ voorFoto: voor }) });
    const paar = markup.match(/<div class="([^"]*)"><figure\b/)?.[1] ?? "";
    expect(paar.split(" ")).toEqual(
      expect.arrayContaining(["grid", "grid-cols-1", "sm:grid-cols-2"]),
    );
  });

  it("geeft beide foto's de verhouding van de foto vooraf, ook als Na anders is", () => {
    const markup = render({ project: project({ voorFoto: voor }) });
    const [voorImg, naImg] = afbeeldingen(markup);
    for (const img of [voorImg, naImg]) {
      expect(img).toMatch(/aspect-ratio:\s*1200\s*\/\s*1600/);
      expect(img).toMatch(/\bobject-cover\b/);
      expect(img).not.toMatch(/aspect-\[/);
    }
  });

  it("laat de overige foto's als kleine foto's eronder staan, zonder iets dubbel", () => {
    const markup = render({ project: project({ voorFoto: voor }) });
    expect(alts(markup)).toEqual([voor.alt, na.alt, detail.alt, achter.alt]);
    const [, , ...kleine] = afbeeldingen(markup);
    for (const img of kleine) {
      expect(img).toMatch(/\baspect-square\b/);
      expect(img).not.toMatch(/aspect-ratio:/);
    }
  });

  it("geeft elke helft een sizes die past bij de halve breedte", () => {
    for (const groot of [false, true]) {
      const markup = render({ project: project({ voorFoto: voor }), groot });
      const [voorImg, naImg] = afbeeldingen(markup);
      expect(sizes(voorImg ?? "")).toBe(sizes(naImg ?? ""));
      expect(sizes(voorImg ?? "")).toMatch(/\(min-width: 40rem\) 50vw, 100vw$/);
    }
  });

  it("toont een project met alleen een foto vooraf en één resultaat als paar", () => {
    const markup = render({
      project: project({ voorFoto: voor, fotos: [na] }),
    });
    expect(alts(markup)).toEqual([voor.alt, na.alt]);
    expect(markup).not.toContain('<ul class="grid grid-cols-3');
  });
});

describe("zonder voor-en-na-paar", () => {
  it("houdt zonder foto vooraf de grote eerste foto, zonder figuren", () => {
    for (const groot of [false, true]) {
      const markup = render({ project: project(), groot });
      expect(figuren(markup)).toEqual([]);
      expect(markup).not.toContain("<figcaption");
      const [eerste] = afbeeldingen(markup);
      expect(eerste).toMatch(groot ? /aspect-\[3\/2\]/ : /aspect-\[4\/3\]/);
      expect(eerste).not.toMatch(/aspect-ratio:/);
      expect(alts(markup)).toEqual([na.alt, detail.alt, achter.alt]);
    }
  });

  it("toont geen foto vooraf zonder resultaat, maar wel het project", () => {
    const markup = render({ project: project({ voorFoto: voor, fotos: [] }) });
    expect(afbeeldingen(markup)).toEqual([]);
    expect(markup).not.toContain("<figure");
    expect(markup).toContain("Raamfolie voor een kantoor");
    expect(markup).toContain("Zandstraalfolie met logo op de pui.");
  });

  it("toont op de homepage alleen het resultaat, zonder labels", () => {
    const markup = renderToStaticMarkup(
      createElement(UitgelichteProjecten, {
        projecten: [
          project({ voorFoto: voor }),
          project({ slug: "tweede", voorFoto: voor }),
        ],
      }),
    );
    expect(alts(markup)).toEqual([na.alt, na.alt]);
    expect(markup).not.toContain(voor.url);
    expect(markup).not.toContain("<figure");
  });
});

describe("SanityFoto", () => {
  it("geeft een stijl door aan de afbeelding", () => {
    const markup = renderToStaticMarkup(
      createElement(SanityFoto, {
        foto: na,
        sizes: "100vw",
        style: { aspectRatio: "4 / 3" },
      }),
    );
    expect(markup).toMatch(/style="[^"]*aspect-ratio:\s*4\s*\/\s*3/);
  });

  it("werkt zonder stijl zoals voorheen", () => {
    const markup = renderToStaticMarkup(
      createElement(SanityFoto, { foto: na, sizes: "100vw" }),
    );
    expect(markup).not.toContain("aspect-ratio");
    expect(markup).toContain(`alt="${na.alt}"`);
  });
});
