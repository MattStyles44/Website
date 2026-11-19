import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Kruimelpad } from "@/components/kruimelpad";
import { SnelleActies } from "@/components/snelle-acties";
import { site } from "@/content/site";

describe("snelle acties op kleine schermen", () => {
  const html = renderToStaticMarkup(createElement(SnelleActies));

  it("biedt offerte, WhatsApp en bellen in een eigen navigatie", () => {
    expect(html).toMatch(/<nav[^>]*aria-label="Snel contact"/);
    expect(html).toContain('href="/offerte"');
    expect(html).toContain(`href="${site.whatsapp}"`);
    expect(html).toContain(`href="${site.telefoon.link}"`);
  });

  it("geeft de knoppen zonder tekst een toegankelijke naam", () => {
    expect(html).toContain('aria-label="Stuur een WhatsApp"');
    expect(html).toContain(`aria-label="Bel ${site.telefoon.weergave}"`);
  });

  it("staat alleen op kleine schermen", () => {
    expect(html).toMatch(/<nav[^>]*class="[^"]*\blg:hidden\b/);
  });
});

describe("kruimelpad", () => {
  const html = renderToStaticMarkup(
    createElement(Kruimelpad, {
      items: [
        { label: "Home", href: "/" },
        { label: "Diensten", href: "/diensten" },
        { label: "Voertuigreclame", href: "/diensten/voertuigreclame" },
        { label: "Carwrapping" },
      ],
    }),
  );
  const items = [...html.matchAll(/<li class="([^"]*)"/g)].map((m) => m[1]);

  it("toont op kleine schermen alleen de terug-link naar de bovenliggende pagina", () => {
    expect(items).toHaveLength(4);
    expect(items[2]).not.toMatch(/\bhidden\b/);
    for (const index of [0, 1, 3])
      expect(items[index]).toMatch(/\bhidden sm:flex\b/);
  });

  it("houdt het hele pad en de huidige pagina in de markup", () => {
    expect(html).toContain('href="/diensten"');
    expect(html).toContain('aria-current="page"');
  });
});
