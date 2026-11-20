import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8")
  // Commentaar telt niet mee.
  .replace(/\/\*[\s\S]*?\*\//g, "");

interface Blok {
  /** Alles vóór de `{`, zoals `.onthul` of `@media (…)`. */
  kop: string;
  /** De koppen van de omringende blokken, van buiten naar binnen. */
  ouders: string[];
  /** Alles tussen `{` en `}`, inclusief geneste blokken. */
  inhoud: string;
}

/** Alle blokken van de stylesheet, ook de geneste. */
function alleBlokken(tekst: string): Blok[] {
  const uit: Blok[] = [];
  const open: { kop: string; start: number }[] = [];
  let begin = 0;
  for (let i = 0; i < tekst.length; i++) {
    const teken = tekst[i];
    if (teken === "{") {
      open.push({ kop: tekst.slice(begin, i).trim(), start: i + 1 });
      begin = i + 1;
    } else if (teken === "}") {
      const blok = open.pop();
      if (blok) {
        uit.push({
          kop: blok.kop,
          ouders: open.map((ouder) => ouder.kop),
          inhoud: tekst.slice(blok.start, i),
        });
      }
      begin = i + 1;
    } else if (teken === ";") {
      begin = i + 1;
    }
  }
  return uit;
}

const blokken = alleBlokken(css);
const regels = blokken.filter((blok) => !blok.kop.startsWith("@"));

const metOndersteuning = (blok: Blok) =>
  blok.ouders.some((kop) =>
    /^@supports\b[^{]*animation-timeline\s*:\s*view\(\)/.test(kop),
  );
const zonderVoorkeur = (blok: Blok) =>
  blok.ouders.some((kop) =>
    /^@media\b[^{]*prefers-reduced-motion\s*:\s*no-preference/.test(kop),
  );
const minderBeweging = (blok: Blok) =>
  blok.ouders.some((kop) =>
    /^@media\b[^{]*prefers-reduced-motion\s*:\s*reduce/.test(kop),
  );
const inKeyframes = (blok: Blok) =>
  blok.ouders.some((kop) => kop.startsWith("@keyframes"));

/** De waarde van een declaratie in een blok. */
const waarde = (blok: Blok, eigenschap: string) =>
  blok.inhoud
    .match(new RegExp(`(?:^|[;\\s])${eigenschap}\\s*:\\s*([^;]+)`))?.[1]
    ?.trim();

/** Een tijd als `250ms` of `0.25s` in milliseconden. */
function milliseconden(tijd: string): number {
  const match = tijd.match(/^([\d.]+)(ms|s)$/);
  expect(match, tijd).not.toBeNull();
  const getal = Number(match?.[1]);
  return match?.[2] === "s" ? getal * 1000 : getal;
}

describe("onthullen bij scrollen", () => {
  const onthul = regels.filter((blok) => /\.onthul\b/.test(blok.kop));

  it("heeft een klasse onthul met een view-tijdlijn in de entry-fase", () => {
    expect(onthul).toHaveLength(1);
    const [regel] = onthul;
    if (!regel) return;
    expect(waarde(regel, "animation-timeline")).toBe("view()");
    expect(waarde(regel, "animation-range")).toMatch(/^entry\b/);
    expect(waarde(regel, "animation-fill-mode")).toBe("both");
  });

  it("gebruikt een @keyframes die rustig opkomt en hooguit 1.5rem beweegt", () => {
    const naam = onthul[0] ? waarde(onthul[0], "animation-name") : undefined;
    expect(naam).toBeDefined();
    const stappen = blokken.filter((blok) =>
      blok.ouders.includes(`@keyframes ${naam}`),
    );
    expect(stappen.length).toBeGreaterThan(0);
    const tekst = stappen.map((stap) => stap.inhoud).join("\n");
    expect(tekst).toMatch(/opacity\s*:\s*0\s*(;|$)/m);
    const verschuiving = tekst.match(/translateY\(\s*([\d.]+)rem\s*\)/);
    expect(verschuiving, "verschuiving in rem").not.toBeNull();
    expect(Number(verschuiving?.[1])).toBeGreaterThan(0);
    expect(Number(verschuiving?.[1])).toBeLessThanOrEqual(1.5);
    // Geen verende of stuiterende beweging.
    expect(tekst).not.toMatch(/cubic-bezier|scale|rotate/);
  });

  it("beweegt alleen met ondersteuning en zonder voorkeur voor minder beweging", () => {
    const betrokken = regels.filter(
      (blok) =>
        /\.onthul\b/.test(blok.kop) ||
        /animation-timeline\s*:/.test(blok.inhoud),
    );
    expect(betrokken.length).toBeGreaterThan(0);
    for (const blok of betrokken) {
      expect(metOndersteuning(blok), blok.kop).toBe(true);
      expect(zonderVoorkeur(blok), blok.kop).toBe(true);
    }
  });

  it("verbergt buiten die voorwaarden niets, behalve in een @keyframes", () => {
    for (const blok of regels) {
      if (!/opacity\s*:\s*0(?![.\d])|visibility\s*:\s*hidden/.test(blok.inhoud))
        continue;
      const veilig =
        inKeyframes(blok) || (metOndersteuning(blok) && zonderVoorkeur(blok));
      expect(veilig, blok.kop).toBe(true);
    }
  });
});

describe("paginawissels", () => {
  it("laat klikken door tijdens een overgang", () => {
    const overlay = regels.find((blok) => blok.kop === "::view-transition");
    expect(overlay).toBeDefined();
    if (overlay) expect(waarde(overlay, "pointer-events")).toBe("none");
  });

  it("vloeit kort en rustig over, alleen zonder voorkeur voor minder beweging", () => {
    const overgangen = regels.filter(
      (blok) =>
        /::view-transition-(old|new)\(\*\)/.test(blok.kop) &&
        zonderVoorkeur(blok),
    );
    expect(overgangen.length).toBeGreaterThan(0);
    for (const blok of overgangen) {
      const duur = milliseconden(waarde(blok, "animation-duration") ?? "");
      expect(duur).toBeGreaterThanOrEqual(200);
      expect(duur).toBeLessThanOrEqual(300);
      expect(waarde(blok, "animation-timing-function")).toBe("ease-out");
    }
    // Buiten die voorwaarde krijgen de overgangen geen eigen duur.
    for (const blok of regels.filter((regel) =>
      /::view-transition-/.test(regel.kop),
    )) {
      if (waarde(blok, "animation-duration")) {
        expect(zonderVoorkeur(blok), blok.kop).toBe(true);
      }
    }
  });

  it("zet de overgangen uit voor wie minder beweging wil", () => {
    const uit = regels.filter(
      (blok) => minderBeweging(blok) && /::view-transition-/.test(blok.kop),
    );
    const selectors = uit.flatMap((blok) =>
      blok.kop.split(",").map((selector) => selector.trim()),
    );
    expect(selectors).toEqual(
      expect.arrayContaining([
        "::view-transition-group(*)",
        "::view-transition-old(*)",
        "::view-transition-new(*)",
      ]),
    );
    for (const blok of uit) {
      expect(waarde(blok, "animation")).toBe("none !important");
    }
  });

  it("geeft de blokken in main geen eigen naam, zodat er niets schuift", () => {
    const regel = regels.find((blok) => blok.kop === "#inhoud > *");
    expect(regel).toBeDefined();
    if (regel) {
      expect(waarde(regel, "view-transition-name")).toBe("none !important");
    }
  });
});

describe("bestaande regels voor beweging", () => {
  it("houdt het algemene blok voor minder beweging", () => {
    const algemeen = regels.find(
      (blok) => minderBeweging(blok) && /^\*\s*,/.test(blok.kop),
    );
    expect(algemeen).toBeDefined();
    if (!algemeen) return;
    expect(waarde(algemeen, "animation-duration")).toBe("0.01ms !important");
    expect(waarde(algemeen, "transition-duration")).toBe("0.01ms !important");
    expect(waarde(algemeen, "scroll-behavior")).toBe("auto !important");
  });

  it("houdt hover en focus op hooguit 200 ms", () => {
    const thema = blokken.find(
      (blok) =>
        blok.kop === "@theme" &&
        blok.inhoud.includes("--default-transition-duration"),
    );
    expect(thema).toBeDefined();
    if (thema) {
      expect(
        milliseconden(waarde(thema, "--default-transition-duration") ?? ""),
      ).toBeLessThanOrEqual(200);
    }
  });
});
