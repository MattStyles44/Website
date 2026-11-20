import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const layout = readFileSync(path.join(root, "src/app/layout.tsx"), "utf8");

const main = layout.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? "";

describe("paginawissels in de layout", () => {
  it("blijft een Server Component", () => {
    expect(layout).not.toMatch(/^\s*["']use client["']/);
  });

  it("importeert ViewTransition uit react", () => {
    expect(layout).toMatch(
      /import\s*\{[^}]*\bViewTransition\b[^}]*\}\s*from\s*"react";/,
    );
  });

  it("zet alleen de inhoud van main in een ViewTransition", () => {
    expect(main).toMatch(/^<main id="inhoud"/);
    expect(main).toMatch(
      /<ViewTransition>\s*\{children\}\s*<\/ViewTransition>/,
    );
    expect(layout.match(/<ViewTransition\b/g)).toHaveLength(1);
  });

  it("laat de kop, de voet en de balk onderaan erbuiten staan", () => {
    const voor = layout.slice(0, layout.indexOf("<main"));
    const na = layout.slice(layout.indexOf("</main>"));
    expect(voor).toContain("<SiteHeader />");
    expect(na).toContain("<SiteFooter />");
    expect(na).toContain("<SnelleActies />");
    for (const onderdeel of ["SiteHeader", "SiteFooter", "SnelleActies"]) {
      expect(main).not.toContain(onderdeel);
    }
  });

  it("houdt de structured data van het bedrijf", () => {
    expect(layout).toContain("<JsonLdScript");
    expect(layout).toContain("organisatieJsonLd(env.APP_URL, vestiging)");
    expect(layout).toContain("websiteJsonLd(env.APP_URL)");
  });
});
