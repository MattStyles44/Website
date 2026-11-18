/**
 * Validatie van een offerteaanvraag op de server (docs/processen.md).
 *
 * De velden komen als tekst uit het formulier. Alle waarden worden getrimd en
 * lege waarden tellen als niet ingevuld. Welke projectvelden erbij horen, hangt
 * af van het formuliertype van de gekozen categorie (src/content/diensten.ts).
 */
import { z } from "zod";

import {
  getCategorie,
  getDienst,
  type FormulierType,
} from "@/content/diensten";

export type Velden = Record<string, string>;
export type Fouten = Record<string, string>; // veldnaam -> Nederlandse melding

export interface Aanvraag {
  naam: string;
  bedrijfsnaam?: string;
  email: string;
  telefoon: string;
  plaats: string;
  toelichting?: string;
  categorie: string;
  dienst?: string;
  details: Record<string, string | number>;
  afspraak?: {
    locatie: "locatie" | "werkplaats";
    datum: string;
    dagdeel: "ochtend" | "middag";
    adres?: string;
  };
}

type Invoer = Record<string, string>;

/** Een veld getrimd, of undefined als het leeg is of ontbreekt. */
function lees(velden: Velden, naam: string): string | undefined {
  if (!Object.hasOwn(velden, naam)) return undefined;
  const waarde = velden[naam];
  if (typeof waarde !== "string") return undefined;
  const getrimd = waarde.trim();
  return getrimd === "" ? undefined : getrimd;
}

/** Alleen de ingevulde velden uit de lijst; andere velden vallen weg. */
function leesVelden(velden: Velden, namen: readonly string[]): Invoer {
  const invoer: Invoer = {};
  for (const naam of namen) {
    const waarde = lees(velden, naam);
    if (waarde !== undefined) invoer[naam] = waarde;
  }
  return invoer;
}

/** Laat sleutels zonder waarde weg, zodat er nooit `undefined` of "" in staat. */
function zonderLeeg(
  object: Record<string, string | number | undefined>,
): Record<string, string | number> {
  const resultaat: Record<string, string | number> = {};
  for (const [sleutel, waarde] of Object.entries(object)) {
    if (waarde !== undefined) resultaat[sleutel] = waarde;
  }
  return resultaat;
}

// ---------------------------------------------------------------------------
// Bouwstenen
// ---------------------------------------------------------------------------

function verplichteTekst(
  leeg: string,
  label: string,
  min: number,
  max: number,
) {
  return z
    .string({ error: leeg })
    .min(min, `${label} moet minimaal ${min} tekens hebben.`)
    .max(max, `${label} mag maximaal ${max} tekens hebben.`);
}

function optioneleTekst(label: string, max: number) {
  return z
    .string()
    .max(max, `${label} mag maximaal ${max} tekens hebben.`)
    .optional();
}

const getalVorm = /^-?\d+(?:[.,]\d+)?$/;

/** Leest een getal met een punt of komma als decimaalteken ("250,5" → 250.5). */
export function leesGetal(tekst: string): number | undefined {
  const schoon = tekst.trim();
  return getalVorm.test(schoon) ? Number(schoon.replace(",", ".")) : undefined;
}

interface GetalRegels {
  /** Melding als een verplicht veld leeg is. */
  leeg?: string;
  /** Melding als de waarde geen getal is (of geen heel getal bij `geheel`). */
  ongeldig: string;
  /** Melding als het getal buiten het bereik valt. */
  bereik: string;
  min: number;
  max: number;
  /** Het minimum zelf mag niet (bijvoorbeeld: groter dan 0). */
  minUitgesloten?: boolean;
  geheel?: boolean;
}

function getal(regels: GetalRegels) {
  let nummer = z.number();
  if (regels.geheel) nummer = nummer.int(regels.ongeldig);
  nummer = regels.minUitgesloten
    ? nummer.gt(regels.min, regels.bereik)
    : nummer.gte(regels.min, regels.bereik);
  nummer = nummer.lte(regels.max, regels.bereik);

  return z
    .string({ error: regels.leeg ?? "Vul dit veld in." })
    .transform((tekst, ctx) => {
      const waarde = leesGetal(tekst);
      if (waarde === undefined) {
        ctx.addIssue({ code: "custom", message: regels.ongeldig });
        return z.NEVER;
      }
      return waarde;
    })
    .pipe(nummer);
}

function maat(veld: "breedte" | "hoogte") {
  return getal({
    leeg: `Vul de ${veld} in centimeters in.`,
    ongeldig: `Vul de ${veld} in als getal in centimeters, bijvoorbeeld 250.`,
    bereik: `De ${veld} moet groter zijn dan 0 en maximaal 100.000 cm.`,
    min: 0,
    minUitgesloten: true,
    max: 100_000,
  });
}

// ---------------------------------------------------------------------------
// Schema's
// ---------------------------------------------------------------------------

const telefoonVorm = /^\+?\d{10,15}$/;

const contactSchema = z.object({
  naam: verplichteTekst("Vul je naam in.", "Je naam", 2, 100),
  bedrijfsnaam: optioneleTekst("De bedrijfsnaam", 100),
  email: z
    .email({
      error: (issue) =>
        issue.input === undefined
          ? "Vul je e-mailadres in."
          : "Vul een geldig e-mailadres in, bijvoorbeeld naam@bedrijf.nl.",
    })
    .max(254, "Je e-mailadres is te lang."),
  telefoon: z
    .string({ error: "Vul je telefoonnummer in." })
    .refine(
      (telefoon) => telefoonVorm.test(telefoon.replace(/[\s().-]/g, "")),
      "Vul een geldig telefoonnummer in, bijvoorbeeld 06 12 34 56 78.",
    ),
  plaats: verplichteTekst("Vul je plaats in.", "De plaats", 2, 100),
  toelichting: optioneleTekst("De toelichting", 2000),
  categorie: z
    .string({ error: "Kies waar je aanvraag over gaat." })
    .refine(
      (slug) => getCategorie(slug) !== undefined,
      "Kies een categorie uit de lijst.",
    ),
  dienst: z.string().optional(),
});

function voertuigSchema(nu: Date) {
  const maxBouwjaar = nu.getUTCFullYear() + 1;
  return z.object({
    merk: z
      .string({ error: "Vul het merk van het voertuig in." })
      .max(50, "Het merk mag maximaal 50 tekens hebben."),
    model: z
      .string({ error: "Vul het model van het voertuig in." })
      .max(50, "Het model mag maximaal 50 tekens hebben."),
    aantalVoertuigen: getal({
      leeg: "Vul het aantal voertuigen in.",
      ongeldig: "Vul het aantal voertuigen in als heel getal, bijvoorbeeld 3.",
      bereik: "Het aantal voertuigen moet tussen 1 en 500 liggen.",
      min: 1,
      max: 500,
      geheel: true,
    }),
    bouwjaar: getal({
      ongeldig: "Vul het bouwjaar in als jaartal, bijvoorbeeld 2021.",
      bereik: `Het bouwjaar moet tussen 1950 en ${maxBouwjaar} liggen.`,
      min: 1950,
      max: maxBouwjaar,
      geheel: true,
    }).optional(),
    lengteHoogte: optioneleTekst("De lengte/hoogte-variant", 20),
    lakkleur: optioneleTekst("De lakkleur", 50),
  });
}

const gevelSchema = z.object({
  breedteCm: maat("breedte"),
  hoogteCm: maat("hoogte"),
  uitvoering: z
    .enum(
      ["lichtbak", "3d-letters", "gevelbord", "anders"],
      "Kies een uitvoering: lichtbak, 3D-letters, gevelbord of anders.",
    )
    .optional(),
  ondergrond: optioneleTekst("De ondergrond", 100),
  montagehoogteM: getal({
    ongeldig: "Vul de montagehoogte in als getal in meters, bijvoorbeeld 4,5.",
    bereik: "De montagehoogte moet tussen 0 en 100 meter liggen.",
    min: 0,
    max: 100,
  }).optional(),
});

const interieurSchema = z.object({
  breedteCm: maat("breedte"),
  hoogteCm: maat("hoogte"),
  ondergrond: optioneleTekst("De ondergrond", 100),
});

const raamSchema = z.object({
  breedteCm: maat("breedte"),
  hoogteCm: maat("hoogte"),
  aantalRamen: getal({
    leeg: "Vul het aantal ramen in.",
    ongeldig: "Vul het aantal ramen in als heel getal, bijvoorbeeld 4.",
    bereik: "Het aantal ramen moet tussen 1 en 500 liggen.",
    min: 1,
    max: 500,
    geheel: true,
  }),
  zijde: z.enum(["binnen", "buiten"], {
    error: (issue) =>
      issue.input === undefined
        ? "Kies of de folie aan de binnen- of buitenkant komt."
        : "Kies binnen of buiten.",
  }),
});

const algemeenSchema = z.object({});

function afspraakSchema(nu: Date) {
  const vandaag = nu.toISOString().slice(0, 10);
  return z.object({
    afspraakLocatie: z.enum(["locatie", "werkplaats"], {
      error: (issue) =>
        issue.input === undefined
          ? "Kies of de afspraak op locatie of in de werkplaats is."
          : "Kies op locatie of in de werkplaats.",
    }),
    afspraakDatum: z
      .string({ error: "Kies een datum voor de afspraak." })
      .refine(isKalenderdatum, {
        message: "Vul een bestaande datum in, bijvoorbeeld 2026-12-01.",
        abort: true,
      })
      .refine(
        (datum) => datum >= vandaag,
        "Kies een datum vanaf vandaag, niet in het verleden.",
      ),
    afspraakDagdeel: z.enum(["ochtend", "middag"], {
      error: (issue) =>
        issue.input === undefined
          ? "Kies een dagdeel: ochtend of middag."
          : "Kies ochtend of middag.",
    }),
    afspraakAdres: z.string().optional(),
  });
}

/** Een echte datum in de vorm JJJJ-MM-DD (dus geen 30 februari). */
export function isKalenderdatum(tekst: string): boolean {
  const delen = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tekst);
  if (!delen) return false;
  const [jaar, maand, dag] = [delen[1], delen[2], delen[3]].map(Number);
  const datum = new Date(Date.UTC(jaar, maand - 1, dag));
  return (
    datum.getUTCFullYear() === jaar &&
    datum.getUTCMonth() === maand - 1 &&
    datum.getUTCDate() === dag
  );
}

// ---------------------------------------------------------------------------
// Parsen
// ---------------------------------------------------------------------------

/** Valideert de velden van één schema; meldingen komen in `fouten`, eerste per veld. */
function valideer<S extends z.ZodObject>(
  schema: S,
  velden: Velden,
  fouten: Fouten,
): z.output<S> | undefined {
  const resultaat = schema.safeParse(
    leesVelden(velden, Object.keys(schema.shape)),
  );
  if (resultaat.success) return resultaat.data;
  for (const issue of resultaat.error.issues) {
    const veld = String(issue.path[0] ?? "");
    if (veld !== "" && !Object.hasOwn(fouten, veld)) {
      fouten[veld] = issue.message;
    }
  }
  return undefined;
}

function valideerDetails(
  formulier: FormulierType,
  velden: Velden,
  fouten: Fouten,
  nu: Date,
): Record<string, string | number> | undefined {
  const details = (() => {
    switch (formulier) {
      case "voertuig":
        return valideer(voertuigSchema(nu), velden, fouten);
      case "gevel":
        return valideer(gevelSchema, velden, fouten);
      case "interieur":
        return valideer(interieurSchema, velden, fouten);
      case "raam":
        return valideer(raamSchema, velden, fouten);
      case "algemeen":
        return valideer(algemeenSchema, velden, fouten);
    }
  })();
  return details === undefined ? undefined : zonderLeeg(details);
}

function valideerAfspraak(
  velden: Velden,
  fouten: Fouten,
  nu: Date,
): Aanvraag["afspraak"] {
  const afspraak = valideer(afspraakSchema(nu), velden, fouten);
  const opLocatie = lees(velden, "afspraakLocatie") === "locatie";
  const adres = lees(velden, "afspraakAdres");
  if (opLocatie && adres === undefined) {
    fouten.afspraakAdres = "Vul het adres in waar de afspraak plaatsvindt.";
    return undefined;
  }
  if (afspraak === undefined) return undefined;
  return {
    locatie: afspraak.afspraakLocatie,
    datum: afspraak.afspraakDatum,
    dagdeel: afspraak.afspraakDagdeel,
    // Het adres hoort alleen bij een afspraak op locatie.
    ...(opLocatie && adres !== undefined ? { adres } : {}),
  };
}

export function parseAanvraag(
  velden: Velden,
  opties: { nu?: Date } = {},
): { ok: true; aanvraag: Aanvraag } | { ok: false; fouten: Fouten } {
  const nu = opties.nu ?? new Date();
  const fouten: Fouten = {};

  const contact = valideer(contactSchema, velden, fouten);

  const categorie = getCategorie(lees(velden, "categorie") ?? "");
  const dienst = lees(velden, "dienst");
  if (
    categorie !== undefined &&
    dienst !== undefined &&
    getDienst(categorie.slug, dienst) === undefined
  ) {
    fouten.dienst = "Kies een dienst die bij de gekozen categorie hoort.";
  }

  const details =
    categorie === undefined
      ? undefined
      : valideerDetails(categorie.formulier, velden, fouten, nu);

  const afspraak =
    lees(velden, "afspraak") === "ja"
      ? valideerAfspraak(velden, fouten, nu)
      : undefined;

  if (
    Object.keys(fouten).length > 0 ||
    contact === undefined ||
    categorie === undefined ||
    details === undefined
  ) {
    return { ok: false, fouten };
  }

  const aanvraag: Aanvraag = {
    naam: contact.naam,
    ...(contact.bedrijfsnaam !== undefined && {
      bedrijfsnaam: contact.bedrijfsnaam,
    }),
    email: contact.email,
    telefoon: contact.telefoon,
    plaats: contact.plaats,
    ...(contact.toelichting !== undefined && {
      toelichting: contact.toelichting,
    }),
    categorie: categorie.slug,
    ...(dienst !== undefined && { dienst }),
    details,
    ...(afspraak !== undefined && { afspraak }),
  };
  return { ok: true, aanvraag };
}
