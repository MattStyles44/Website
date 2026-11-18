/**
 * Hulpfuncties voor de merkkleuren: de naam van het Tailwind-token en het
 * kleurcontrast volgens WCAG 2.x.
 */

const hexKleur = /^#[0-9A-Fa-f]{6}$/;

/** `inktZacht` wordt `inkt-zacht`, zoals in `--color-inkt-zacht` en `bg-inkt-zacht`. */
export function tokenNaam(naam: string): string {
  return naam.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/** Relatieve luminantie van een `#RRGGBB`-kleur (WCAG 2.x). */
export function luminantie(kleur: string): number {
  if (!hexKleur.test(kleur)) {
    throw new Error(`Geen kleur in de vorm #RRGGBB: ${kleur}`);
  }
  const [r, g, b] = [1, 3, 5].map((start) => {
    const kanaal = parseInt(kleur.slice(start, start + 2), 16) / 255;
    return kanaal <= 0.03928
      ? kanaal / 12.92
      : ((kanaal + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrastverhouding van twee `#RRGGBB`-kleuren, van 1 tot 21. */
export function contrast(voorgrond: string, achtergrond: string): number {
  const [licht, donker] = [luminantie(voorgrond), luminantie(achtergrond)].sort(
    (a, b) => b - a,
  ) as [number, number];
  return (licht + 0.05) / (donker + 0.05);
}

/** Een contrastverhouding zoals `5,7:1`, afgerond naar beneden. */
export function contrastLabel(verhouding: number): string {
  const afgerond = Math.floor(verhouding * 10) / 10;
  return `${afgerond.toFixed(1).replace(".", ",")}:1`;
}
