/**
 * Controle in het formulier, vóór het versturen. Dezelfde regels als op de
 * server (src/lib/offerte/aanvraag.ts en uploads.ts), zodat de bezoeker
 * meteen ziet wat er mist. De server controleert alles daarna opnieuw.
 */
import {
  parseAanvraag,
  type Fouten,
  type Velden,
} from "@/lib/offerte/aanvraag";
import { isSpam } from "@/lib/offerte/spam";
import {
  maxBestanden,
  maxTotaleGrootte,
  toegestaneExtensies,
} from "@/lib/offerte/uploads";

/** Dezelfde melding als de server geeft bij velden die niet goed zijn. */
export const ongeldigBericht =
  "Niet alle velden zijn goed ingevuld. Controleer de velden met een melding en verstuur je aanvraag opnieuw.";

const megabyte = 1024 * 1024;

/** De maximale totale grootte in MB (20). */
export const maxMegabytes = maxTotaleGrootte / megabyte;

/** Het `accept`-attribuut van het bestandsveld: `.eps,.ai,.pdf,…`. */
export const bestandenAccept = toegestaneExtensies
  .map((extensie) => `.${extensie}`)
  .join(",");

/** De bestandstypen voor mensen: "EPS, AI, PDF, JPG of PNG" (JPEG is JPG). */
export const bestandstypen = (() => {
  const namen = [
    ...new Set(
      toegestaneExtensies.map((extensie) =>
        extensie === "jpeg" ? "JPG" : extensie.toUpperCase(),
      ),
    ),
  ];
  const laatste = namen.pop();
  return namen.length === 0
    ? (laatste ?? "")
    : `${namen.join(", ")} of ${laatste}`;
})();

/** De hulptekst bij het bestandsveld (docs/processen.md: hulp bij aanleveren). */
export const bestandenHint = `Elk bestand is welkom: ${bestandstypen}, maximaal ${maxBestanden} bestanden en samen ${maxMegabytes} MB. We controleren of je bestand geschikt is en maken je logo zo nodig opnieuw op.`;

/** Wat het formulier van een gekozen bestand nodig heeft (een `File` past). */
export interface GekozenBestand {
  name: string;
  size: number;
}

function heeftToegestaneExtensie(naam: string): boolean {
  const punt = naam.lastIndexOf(".");
  if (punt === -1) return false;
  const extensie = naam.slice(punt + 1).toLowerCase();
  return (toegestaneExtensies as readonly string[]).includes(extensie);
}

/** Een grootte voor mensen: 12 kB onder 1 MB, daarboven 3,4 MB (met een komma). */
export function formatGrootte(bytes: number): string {
  if (bytes < megabyte) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  const mb = Math.round((bytes / megabyte) * 10) / 10;
  return `${String(mb).replace(".", ",")} MB`;
}

/**
 * Controleert de gekozen bestanden op de grenzen van uploads.ts, in dezelfde
 * volgorde als de server: aantal, type, totale grootte.
 */
export function controleerBestanden(
  bestanden: readonly GekozenBestand[],
): string | undefined {
  if (bestanden.length > maxBestanden) {
    return `Je hebt ${bestanden.length} bestanden gekozen. Je kunt maximaal ${maxBestanden} bestanden meesturen.`;
  }
  const verkeerd = bestanden.find(
    (bestand) => !heeftToegestaneExtensie(bestand.name),
  );
  if (verkeerd !== undefined) {
    const naam = verkeerd.name === "" ? "Een bestand" : `"${verkeerd.name}"`;
    return `${naam} heeft een bestandstype dat we niet accepteren. Stuur een EPS-, AI-, PDF-, JPG- of PNG-bestand.`;
  }
  const totaal = bestanden.reduce((som, bestand) => som + bestand.size, 0);
  if (totaal > maxTotaleGrootte) {
    return `Je bestanden zijn samen ${formatGrootte(totaal)}. Dat is meer dan ${maxMegabytes} MB: kies minder of kleinere bestanden.`;
  }
  return undefined;
}

/** "1 bestand gekozen (0,2 MB)." of "3 bestanden gekozen, samen 4,1 MB." */
export function bestandenSamenvatting(
  bestanden: readonly GekozenBestand[],
): string {
  const totaal = bestanden.reduce((som, bestand) => som + bestand.size, 0);
  return bestanden.length === 1
    ? `1 bestand gekozen (${formatGrootte(totaal)}).`
    : `${bestanden.length} bestanden gekozen, samen ${formatGrootte(totaal)}.`;
}

/** Een leeg bestandsveld stuurt een naamloos bestand van 0 bytes mee. */
function isLeegBestandsveld(bestand: GekozenBestand): boolean {
  return bestand.name === "" && bestand.size === 0;
}

/**
 * Controleert het formulier zoals de server dat doet. Geeft de fouten per
 * veld, of `undefined` als alles klopt. Een ingevuld honeypotveld laat de
 * controle aan de server over.
 */
export function controleerFormulier(
  formData: FormData,
  nu: Date,
): Fouten | undefined {
  const velden: Velden = {};
  const bestanden: GekozenBestand[] = [];
  for (const [naam, waarde] of formData.entries()) {
    if (typeof waarde === "string") {
      // Bij dubbele namen telt de eerste waarde, net als op de server.
      if (!Object.hasOwn(velden, naam)) velden[naam] = waarde;
    } else if (naam === "bestanden" && !isLeegBestandsveld(waarde)) {
      bestanden.push(waarde);
    }
  }
  if (isSpam(velden)) return undefined;

  const aanvraag = parseAanvraag(velden, { nu });
  const fouten: Fouten = aanvraag.ok ? {} : { ...aanvraag.fouten };
  const bestandFout = controleerBestanden(bestanden);
  if (bestandFout !== undefined) fouten.bestanden = bestandFout;
  return Object.keys(fouten).length > 0 ? fouten : undefined;
}

/**
 * De vroegste datum voor een afspraak: vandaag. De server rekent met de datum
 * in UTC; de latere van die twee geldt, zodat de keuze altijd geaccepteerd wordt.
 */
export function vroegsteAfspraakDatum(nu: Date): string {
  const lokaal = [
    String(nu.getFullYear()).padStart(4, "0"),
    String(nu.getMonth() + 1).padStart(2, "0"),
    String(nu.getDate()).padStart(2, "0"),
  ].join("-");
  const utc = nu.toISOString().slice(0, 10);
  return lokaal > utc ? lokaal : utc;
}
