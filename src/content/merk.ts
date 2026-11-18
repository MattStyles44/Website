/**
 * Merkkleuren uit docs/merk.md: de enige lijst met kleuren van de site.
 *
 * Elke kleur staat met precies dezelfde waarde als Tailwind-token in
 * `src/app/globals.css` (`--color-<naam>`, de naam in kebab-case). In
 * componenten gebruik je die tokens (`bg-navy`, `text-blauw`). Deze waarden
 * zijn voor plekken waar de tokens niet werken, zoals gegenereerde
 * deelafbeeldingen en de kleurstalen op `/styleguide`.
 *
 * Contrast (WCAG 2.x): tekst minstens 4,5:1 op wit en op `vlak`, de rand van
 * formuliervelden minstens 3:1 op wit (zie tests/huisstijl-kleuren.test.ts).
 */
export const merkKleuren = {
  /** Primair: koppen, tekst en donkere vlakken. */
  navy: "#172746",
  /** Merkblauw: knoppen, links en accenten. */
  blauw: "#006D9A",
  /** Achtergrond en tekst op donkere vlakken. */
  wit: "#FFFFFF",
  /** Secundaire tekst, zoals hints en bijschriften. */
  inktZacht: "#666666",
  /** Lichte tint voor afwisselende secties. */
  vlak: "#EEF3F7",
  /** Rand van formuliervelden. */
  rand: "#7A8699",
  /** Foutmeldingen. */
  fout: "#B42318",
} as const;

export type MerkKleur = keyof typeof merkKleuren;
