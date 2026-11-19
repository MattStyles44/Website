import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function lees(bestand: string): string {
  return readFileSync(path.join(root, bestand), "utf8");
}

/** Alle .tsx-bestanden onder een map, als pad vanaf de root. */
function tsxBestanden(map: string): string[] {
  return readdirSync(path.join(root, map), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((item) => item.isFile() && item.name.endsWith(".tsx"))
    .map((item) =>
      path
        .relative(root, path.join(item.parentPath, item.name))
        .split(path.sep)
        .join("/"),
    );
}

const isClient = (inhoud: string) => /^\s*["']use client["']/.test(inhoud);

describe("server en browser", () => {
  it("houdt pagina's, layouts, de kop en de voet als Server Components", () => {
    const bestanden = [
      ...tsxBestanden("src/app").filter((bestand) =>
        /\/(page|layout|not-found)\.tsx$/.test(bestand),
      ),
      "src/components/site-header.tsx",
      "src/components/site-footer.tsx",
    ];
    expect(bestanden.length).toBeGreaterThan(8);
    for (const bestand of bestanden) {
      expect(isClient(lees(bestand)), bestand).toBe(false);
    }
  });

  it("draait alleen het menu, de snelle acties, het offerteformulier en de foutpagina in de browser", () => {
    const client = [
      ...tsxBestanden("src/app"),
      ...tsxBestanden("src/components"),
    ].filter((bestand) => isClient(lees(bestand)));
    expect(client.sort()).toEqual([
      "src/app/error.tsx",
      "src/components/offerte/offerte-formulier.tsx",
      "src/components/site-menu.tsx",
      "src/components/snelle-acties.tsx",
    ]);
  });

  it("geeft de menuknop aria-expanded en aria-controls", () => {
    const menu = lees("src/components/site-menu.tsx");
    expect(menu).toMatch(/aria-expanded=\{open\}/);
    expect(menu).toMatch(/aria-controls=\{menuPaneelId\}/);
    expect(menu).toMatch(/hidden=\{!open\}/);
    expect(menu).toContain('"Escape"');
  });
});

describe("regels voor de opmaak", () => {
  const bestanden = [
    ...tsxBestanden("src/app"),
    ...tsxBestanden("src/components"),
  ];

  it("gebruikt alleen next/image, geen <img> en geen <iframe>", () => {
    for (const bestand of bestanden) {
      const inhoud = lees(bestand);
      expect(inhoud, bestand).not.toMatch(/<img\b/);
      expect(inhoud, bestand).not.toMatch(/<iframe\b/);
    }
  });

  it("gebruikt dangerouslySetInnerHTML alleen voor de JSON-LD", () => {
    const met = bestanden.filter((bestand) =>
      lees(bestand).includes("dangerouslySetInnerHTML"),
    );
    expect(met).toEqual(["src/components/json-ld.tsx"]);
  });

  it("toont geen prijzen en laadt niets van andere sites", () => {
    for (const bestand of bestanden) {
      const inhoud = lees(bestand);
      expect(inhoud, bestand).not.toContain("€");
      expect(inhoud, bestand).not.toMatch(/<script\b[^>]*\ssrc=/);
      expect(inhoud, bestand).not.toMatch(/<link\b[^>]*\shref="https?:/);
    }
  });

  it("laat next/image alleen foto's van het CDN van Sanity laden", () => {
    const config = lees("next.config.ts");
    expect(config).toMatch(/hostname:\s*"cdn\.sanity\.io"/);
    expect(config).toMatch(/protocol:\s*"https"/);
  });
});
