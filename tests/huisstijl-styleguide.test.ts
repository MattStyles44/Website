import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import Styleguide, { metadata } from "@/app/styleguide/page";
import { Kaart, Logo, Sectie, Sticker } from "@/components/ui";
import { hoofdmenu, footermenu } from "@/content/navigatie";
import { merkKleuren } from "@/content/merk";
import { tokenNaam } from "@/lib/kleuren";

const markup = renderToStaticMarkup(Styleguide());

describe("stijlgids", () => {
  it("staat niet in zoekmachines, de sitemap of het menu", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    const paden = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(paden).not.toContain("/styleguide");
    for (const item of [...hoofdmenu, ...footermenu]) {
      expect(item.href).not.toContain("styleguide");
    }
  });

  it("heeft precies één h1", () => {
    expect(markup.match(/<h1\b/g)).toHaveLength(1);
  });

  it("toont elke kleur met naam, waarde en token, uit merkKleuren", () => {
    for (const [naam, waarde] of Object.entries(merkKleuren)) {
      expect(markup).toContain(`<code class="font-semibold">${waarde}</code>`);
      expect(markup).toContain(`--color-${tokenNaam(naam)}`);
      expect(markup).toContain(`merkKleuren.${naam}`);
      expect(markup).toContain(`background-color:${waarde}`);
    }
  });

  it("toont alle knoppen, velden, vlakken, de sticker en beide logo's", () => {
    for (const variant of ["primair", "secundair", "tekst", "licht"]) {
      expect(markup).toMatch(new RegExp(`>${variant}<`, "i"));
    }
    for (const tag of [
      "<button",
      "<input",
      "<textarea",
      "<select",
      "<fieldset",
    ]) {
      expect(markup).toContain(tag);
    }
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('required=""');
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('type="radio"');
    for (const toon of ["bg-wit", "bg-vlak", "op-donker"]) {
      expect(markup).toContain(toon);
    }
    expect(markup).toContain("/brand/signup-logo.svg");
    expect(markup).toContain("/brand/signup-logo-wit.svg");
    expect(markup).toContain("-rotate-6");
  });

  it("gebruikt unieke ids", () => {
    const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("koppelt elk label aan een bestaand veld", () => {
    const doelen = [...markup.matchAll(/<label\b[^>]*\sfor="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(doelen.length).toBeGreaterThan(5);
    for (const doel of doelen) {
      expect(markup).toMatch(
        new RegExp(`<(input|textarea|select)\\b[^>]*\\sid="${doel}"`),
      );
    }
  });
});

describe("bouwstenen", () => {
  it("Sectie is een section over de volle breedte met een container", () => {
    const wit = renderToStaticMarkup(createElement(Sectie, null, "Inhoud"));
    expect(wit).toMatch(
      /^<section\b[^>]*class="[^"]*\bw-full\b[^"]*\bbg-wit\b/,
    );
    expect(wit).toMatch(/<div class="[^"]*\bmx-auto\b[^"]*">Inhoud<\/div>/);

    const donker = renderToStaticMarkup(
      createElement(Sectie, { toon: "donker", id: "cta" }, "Inhoud"),
    );
    expect(donker).toMatch(/^<section\b[^>]*\sid="cta"/);
    expect(donker).toContain("op-donker");
  });

  it("Kaart linkt de titel alleen met een href", () => {
    const metLink = renderToStaticMarkup(
      createElement(
        Kaart,
        { titel: "Raamfolie", href: "/diensten/raamfolie" },
        "Tekst",
      ),
    );
    expect(metLink).toMatch(
      /<h3\b[^>]*><a\b[^>]*href="\/diensten\/raamfolie"[^>]*>Raamfolie<\/a><\/h3>/,
    );

    const zonder = renderToStaticMarkup(
      createElement(Kaart, { titel: "Stap 1", kopNiveau: "h2" }, "Tekst"),
    );
    expect(zonder).not.toMatch(/<a\b/);
    expect(zonder).toMatch(/<h2\b[^>]*>Stap 1<\/h2>/);
  });

  it("Sticker is rond en iets gedraaid", () => {
    const sticker = renderToStaticMarkup(
      createElement(Sticker, null, "Sinds 2001"),
    );
    expect(sticker).toContain("rounded-full");
    expect(sticker).toContain("-rotate-6");
    expect(sticker).toContain("Sinds 2001");
  });

  it("Logo gebruikt de SVG uit public/brand zonder optimalisatie", () => {
    const logo = renderToStaticMarkup(createElement(Logo, { toon: "licht" }));
    expect(logo).toMatch(/^<img\b/);
    expect(logo).toContain('alt="SignUp Reclame"');
    expect(logo).toContain('src="/brand/signup-logo-wit.svg"');
    expect(logo).not.toContain("/_next/image");
  });
});
