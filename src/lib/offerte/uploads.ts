/**
 * Controle van de bestanden bij een offerteaanvraag (docs/processen.md:
 * upload van EPS, AI, PDF, JPG en PNG).
 */

export interface Bestand {
  naam: string;
  type: string;
  inhoud: Uint8Array;
}

export const toegestaneExtensies = [
  "eps",
  "ai",
  "pdf",
  "jpg",
  "jpeg",
  "png",
] as const;

export const maxBestanden = 10;

/** Samen maximaal 20 MiB. */
export const maxTotaleGrootte = 20 * 1024 * 1024;

/** Een leeg bestandsveld: het formulier stuurt dan een naamloos bestand van 0 bytes mee. */
export function isLeegBestandsveld(bestand: Bestand): boolean {
  return bestand.naam === "" && bestand.inhoud.byteLength === 0;
}

/** De bestanden die echt zijn gekozen, zonder lege bestandsvelden. */
export function gekozenBestanden(bestanden: Bestand[]): Bestand[] {
  return bestanden.filter((bestand) => !isLeegBestandsveld(bestand));
}

function extensie(naam: string): string | undefined {
  const punt = naam.lastIndexOf(".");
  return punt === -1 ? undefined : naam.slice(punt + 1).toLowerCase();
}

function isToegestaan(naam: string): boolean {
  const ext = extensie(naam);
  return (
    ext !== undefined &&
    (toegestaneExtensies as readonly string[]).includes(ext)
  );
}

export function valideerUploads(
  bestanden: Bestand[],
): { ok: true } | { ok: false; fout: string } {
  const gekozen = gekozenBestanden(bestanden);

  if (gekozen.length > maxBestanden) {
    return {
      ok: false,
      fout: `Je kunt maximaal ${maxBestanden} bestanden meesturen.`,
    };
  }

  const verkeerd = gekozen.find((bestand) => !isToegestaan(bestand.naam));
  if (verkeerd) {
    const naam = verkeerd.naam === "" ? "Een bestand" : `"${verkeerd.naam}"`;
    return {
      ok: false,
      fout: `${naam} heeft een bestandstype dat we niet accepteren. Stuur een EPS-, AI-, PDF-, JPG- of PNG-bestand.`,
    };
  }

  const totaal = gekozen.reduce(
    (som, bestand) => som + bestand.inhoud.byteLength,
    0,
  );
  if (totaal > maxTotaleGrootte) {
    return {
      ok: false,
      fout: "Je bestanden zijn samen groter dan 20 MB. Stuur minder of kleinere bestanden.",
    };
  }

  return { ok: true };
}
