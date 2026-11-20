import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// De Studio is een eigen package; de schema's worden hier als tekst gelezen.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lees = (bestand: string) =>
  readFileSync(path.join(root, "studio/schemaTypes", bestand), "utf8");

const project = lees("project.ts");
const velden = lees("velden.ts");

/** Het `defineField({ … })`-blok met deze naam. */
function veld(bron: string, naam: string): string {
  const start = bron.indexOf(`name: "${naam}"`);
  expect(start, naam).toBeGreaterThan(0);
  const begin = bron.lastIndexOf("defineField({", start);
  const einde = bron.indexOf("\n    }),", start);
  return bron.slice(begin, einde);
}

describe("de foto vooraf in de Studio", () => {
  it("staat als optioneel afbeeldingsveld direct vóór de foto's", () => {
    const voorFoto = veld(project, "voorFoto");
    expect(voorFoto).toContain('type: "image"');
    expect(voorFoto).toContain('title: "Foto vooraf"');
    expect(voorFoto).toContain("options: { hotspot: true }");
    expect(voorFoto).toContain(
      "Optioneel: de situatie vóór het werk. De site toont hem als Voor naast de eerste foto (Na).",
    );
    expect(voorFoto).not.toContain("validation");
    const namen = [...project.matchAll(/^ {6}name: "([^"]+)"/gm)].map(
      (m) => m[1],
    );
    expect(namen.indexOf("fotos") - namen.indexOf("voorFoto")).toBe(1);
  });

  it("deelt de verplichte beschrijving met de foto's", () => {
    expect(veld(project, "voorFoto")).toContain("fields: [fotoBeschrijving]");
    expect(velden).toMatch(
      /export const foto = defineArrayMember\(\{[\s\S]*?fields: \[fotoBeschrijving\],/,
    );
    const beschrijving = velden.slice(
      velden.indexOf("export const fotoBeschrijving"),
      velden.indexOf("export const foto ="),
    );
    expect(beschrijving).toContain('name: "alt"');
    expect(beschrijving).toContain('title: "Beschrijving"');
    expect(beschrijving).toContain("rule.required().min(5).max(160)");
  });

  it("houdt de foto's van een project zoals ze waren", () => {
    const fotos = veld(project, "fotos");
    expect(fotos).toContain('type: "array"');
    expect(fotos).toContain("of: [foto]");
    expect(fotos).toContain("rule.max(20)");
  });
});
