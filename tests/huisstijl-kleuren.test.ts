import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { merkKleuren } from "@/content/merk";
import { contrast, contrastLabel, luminantie, tokenNaam } from "@/lib/kleuren";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

/** De inhoud van het eerste `@theme { … }`-blok (zonder `inline`). */
function themeBlok(): string {
  const start = css.search(/@theme\s*\{/);
  expect(start, "@theme-blok").toBeGreaterThanOrEqual(0);
  const einde = css.indexOf("}", start);
  return css.slice(start, einde);
}

/** Alle .tsx-bestanden onder een map, recursief. */
function tsxBestanden(map: string): string[] {
  return readdirSync(path.join(root, map), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((item) => item.isFile() && item.name.endsWith(".tsx"))
    .map((item) => path.join(item.parentPath, item.name));
}

describe("merkkleuren", () => {
  it("houdt de bevestigde kleuren uit docs/merk.md", () => {
    expect(merkKleuren.navy).toBe("#172746");
    expect(merkKleuren.blauw).toBe("#006D9A");
    expect(merkKleuren.wit).toBe("#FFFFFF");
    expect(merkKleuren.inktZacht).toBe("#666666");
  });

  it("heeft alleen kleuren in de vorm #RRGGBB, elk één keer", () => {
    const waarden = Object.values(merkKleuren);
    for (const waarde of waarden) expect(waarde).toMatch(/^#[0-9A-F]{6}$/);
    expect(new Set(waarden).size).toBe(waarden.length);
  });

  it("staat met dezelfde waarde als token in het @theme-blok", () => {
    const blok = themeBlok();
    for (const [naam, waarde] of Object.entries(merkKleuren)) {
      const regel = new RegExp(
        `--color-${tokenNaam(naam)}\\s*:\\s*${waarde}\\s*;`,
        "i",
      );
      expect(blok, naam).toMatch(regel);
    }
  });

  it("heeft geen andere kleurtokens dan merkKleuren", () => {
    const tokens = [...themeBlok().matchAll(/--color-([a-z-]+)\s*:/g)].map(
      (match) => match[1],
    );
    expect(tokens.sort()).toEqual(
      Object.keys(merkKleuren).map(tokenNaam).sort(),
    );
    // De standaardkleuren van Tailwind staan uit.
    expect(themeBlok()).toMatch(/--color-\*\s*:\s*initial\s*;/);
  });

  it.each([
    ["navy", "wit", 4.5],
    ["wit", "navy", 4.5],
    ["blauw", "wit", 4.5],
    ["wit", "blauw", 4.5],
    ["inktZacht", "wit", 4.5],
    ["inktZacht", "vlak", 4.5],
    ["navy", "vlak", 4.5],
    ["blauw", "vlak", 4.5],
    ["fout", "wit", 4.5],
    ["rand", "wit", 3],
  ] as const)("%s op %s haalt minstens %s:1", (tekst, achtergrond, minimum) => {
    expect(
      contrast(merkKleuren[tekst], merkKleuren[achtergrond]),
    ).toBeGreaterThanOrEqual(minimum);
  });
});

describe("stylesheet", () => {
  it("heeft geen donker startthema meer", () => {
    expect(css.toLowerCase()).not.toContain("#0a0a0a");
    expect(css).not.toMatch(/prefers-color-scheme:\s*dark/);
  });

  it("definieert de lettertypen als tokens, via de variabelen van next/font", () => {
    expect(css).toMatch(/--font-sans\s*:\s*var\(--font-barlow\)/);
    expect(css).toMatch(
      /--font-display\s*:\s*var\(--font-barlow-semi-condensed\)/,
    );
    // Zelf gehost: de stylesheet laadt niets van een andere site.
    expect(css).not.toMatch(/https?:\/\/|@import\s+url\(/);
  });

  it("zet beweging uit met prefers-reduced-motion", () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it("geeft de body de merkkleuren en het lettertype", () => {
    const body = css.match(/\bbody\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(body).toContain("var(--color-wit)");
    expect(body).toContain("var(--color-navy)");
    expect(body).toContain("var(--font-sans)");
  });
});

describe("geen losse kleurcodes", () => {
  it("in componenten en pagina's", () => {
    const bestanden = [
      ...tsxBestanden("src/components"),
      ...tsxBestanden("src/app"),
    ];
    expect(bestanden.length).toBeGreaterThan(0);
    for (const bestand of bestanden) {
      const inhoud = readFileSync(bestand, "utf8");
      expect(inhoud, path.relative(root, bestand)).not.toMatch(
        /#[0-9A-Fa-f]{3,8}\b/,
      );
    }
  });
});

describe("hulpfuncties voor kleuren", () => {
  it("zet de naam om naar het token", () => {
    expect(tokenNaam("navy")).toBe("navy");
    expect(tokenNaam("inktZacht")).toBe("inkt-zacht");
  });

  it("berekent luminantie en contrast volgens WCAG", () => {
    expect(luminantie("#FFFFFF")).toBeCloseTo(1, 5);
    expect(luminantie("#000000")).toBe(0);
    expect(contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrast("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
    expect(contrast("#777777", "#FFFFFF")).toBeCloseTo(4.48, 2);
  });

  it("weigert iets anders dan #RRGGBB", () => {
    expect(() => luminantie("#FFF")).toThrow();
    expect(() => luminantie("navy")).toThrow();
  });

  it("toont een verhouding afgerond naar beneden, met een komma", () => {
    expect(contrastLabel(4.4999)).toBe("4,4:1");
    expect(contrastLabel(14.84)).toBe("14,8:1");
    expect(contrastLabel(3)).toBe("3,0:1");
  });
});
