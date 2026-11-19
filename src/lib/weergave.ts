import type { Adres } from "@/content/site";

/**
 * Kleine hulpfuncties voor de weergave van de pagina's: het menu, datums,
 * foto's en de routeplanner. Zonder React, zodat ze los te testen zijn.
 */

/**
 * Hoe een menulink de huidige pagina markeert, voor `aria-current`.
 *
 * - `"page"`: de link gaat naar precies deze pagina.
 * - `"true"`: de pagina ligt onder deze link, zoals een dienst onder
 *   "Diensten".
 * - `undefined`: geen van beide.
 */
export function huidigeLink(
  pad: string | null | undefined,
  href: string,
): "page" | "true" | undefined {
  if (!pad) return undefined;
  const huidig = zonderSlash(pad);
  const doel = zonderSlash(href);
  if (huidig === doel) return "page";
  if (doel !== "/" && huidig.startsWith(`${doel}/`)) return "true";
  return undefined;
}

/** Een pad zonder slash aan het eind, behalve de homepage zelf. */
function zonderSlash(pad: string): string {
  return pad.length > 1 && pad.endsWith("/") ? pad.slice(0, -1) : pad;
}

const maandNotatie = new Intl.DateTimeFormat("nl-NL", {
  month: "long",
  year: "numeric",
  timeZone: "Europe/Amsterdam",
});

/** "oktober 2026" voor een datum als "2026-10-01". Leeg bij een onleesbare datum. */
export function maandEnJaar(datum: string): string {
  const tijd = new Date(datum);
  return Number.isNaN(tijd.getTime()) ? "" : maandNotatie.format(tijd);
}

/** Plaats en maand van een project: "Groningen · oktober 2026". */
export function projectGegevens(project: {
  plaats?: string;
  datum?: string;
}): string {
  return [project.plaats, project.datum ? maandEnJaar(project.datum) : ""]
    .filter(Boolean)
    .join(" · ");
}

/** De eerste letter als hoofdletter. */
export function metHoofdletter(tekst: string): string {
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

/** Een link naar een routeplanner voor een adres. Een gewone link, geen kaart. */
export function routeplannerLink(adres: Adres): string {
  const bestemming = `${adres.straat}, ${adres.postcode} ${adres.plaats}`;
  const query = new URLSearchParams({ api: "1", destination: bestemming });
  return `https://www.google.com/maps/dir/?${query.toString()}`;
}
