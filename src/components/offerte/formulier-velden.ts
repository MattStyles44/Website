/**
 * De velden van het offerteformulier (docs/processen.md). De namen zijn die
 * van src/lib/offerte/aanvraag.ts; welke projectvelden erbij horen, hangt af
 * van `formulier` van de gekozen categorie (src/content/diensten.ts).
 */
import type { Optie } from "@/components/ui";
import {
  categorieen,
  getCategorie,
  getDienst,
  type FormulierType,
} from "@/content/diensten";
import type { Fouten } from "@/lib/offerte/aanvraag";

interface VeldBasis {
  naam: string;
  label: string;
  hint?: string;
  verplicht?: boolean;
}

export interface TekstVeld extends VeldBasis {
  soort: "tekst";
  /** Toetsenbord met cijfers op een telefoon. */
  invoer?: "numeric" | "decimal";
  maxLengte?: number;
  /** Een smal veld, voor korte antwoorden zoals een getal. */
  kort?: boolean;
}

export interface KeuzeVeld extends VeldBasis {
  soort: "keuze";
  /** De tekst van de eerste, lege keuze. */
  leeg: string;
  opties: readonly Optie[];
}

export type ProjectVeld = TekstVeld | KeuzeVeld;

export interface ProjectGroep {
  titel: string;
  uitleg?: string;
  velden: readonly ProjectVeld[];
}

function breedte(label: string): TekstVeld {
  return {
    soort: "tekst",
    naam: "breedteCm",
    label,
    hint: "Een globale maat is genoeg, bijvoorbeeld 250.",
    verplicht: true,
    invoer: "decimal",
    kort: true,
  };
}

function hoogte(label: string): TekstVeld {
  return {
    soort: "tekst",
    naam: "hoogteCm",
    label,
    hint: "Bijvoorbeeld 120.",
    verplicht: true,
    invoer: "decimal",
    kort: true,
  };
}

/** De projectvelden per formuliertype; `algemeen` heeft er geen. */
export const projectGroepen: Record<FormulierType, ProjectGroep | undefined> = {
  voertuig: {
    titel: "Over je voertuig",
    velden: [
      {
        soort: "tekst",
        naam: "merk",
        label: "Merk",
        hint: "Bijvoorbeeld Volkswagen of Ford.",
        verplicht: true,
        maxLengte: 50,
      },
      {
        soort: "tekst",
        naam: "model",
        label: "Model",
        hint: "Bijvoorbeeld Transporter of Transit.",
        verplicht: true,
        maxLengte: 50,
      },
      {
        soort: "tekst",
        naam: "bouwjaar",
        label: "Bouwjaar",
        hint: "Bijvoorbeeld 2021.",
        invoer: "numeric",
        kort: true,
      },
      {
        soort: "tekst",
        naam: "lengteHoogte",
        label: "Lengte/hoogte-variant",
        hint: "Bij een bestelbus, bijvoorbeeld L1H1 of L2H2.",
        maxLengte: 20,
        kort: true,
      },
      {
        soort: "tekst",
        naam: "aantalVoertuigen",
        label: "Aantal voertuigen",
        hint: "Gaat het om je hele wagenpark? Vul dan het aantal in.",
        verplicht: true,
        invoer: "numeric",
        kort: true,
      },
      {
        soort: "tekst",
        naam: "lakkleur",
        label: "Lakkleur",
        hint: "Bijvoorbeeld wit of zwart metallic.",
        maxLengte: 50,
      },
    ],
  },
  gevel: {
    titel: "Afmetingen en uitvoering",
    uitleg:
      "Heb je een overzichtsfoto van de gevel of de plek? Voeg die toe bij de bestanden.",
    velden: [
      breedte("Breedte in centimeters"),
      hoogte("Hoogte in centimeters"),
      {
        soort: "keuze",
        naam: "uitvoering",
        label: "Gewenste uitvoering",
        leeg: "Weet ik nog niet",
        opties: [
          { waarde: "lichtbak", label: "Lichtbak" },
          { waarde: "3d-letters", label: "3D-letters" },
          { waarde: "gevelbord", label: "Gevelbord" },
          { waarde: "anders", label: "Anders" },
        ],
      },
      {
        soort: "tekst",
        naam: "ondergrond",
        label: "Ondergrond",
        hint: "Bijvoorbeeld baksteen, beton, hout of glas.",
        maxLengte: 100,
      },
      {
        soort: "tekst",
        naam: "montagehoogteM",
        label: "Montagehoogte in meters",
        hint: "Hoe hoog het ongeveer komt, bijvoorbeeld 4,5.",
        invoer: "decimal",
        kort: true,
      },
    ],
  },
  interieur: {
    titel: "Over de wand",
    uitleg:
      "Heb je foto's van de ruimte? Voeg ze toe bij de bestanden, dat helpt.",
    velden: [
      breedte("Breedte van de wand in centimeters"),
      hoogte("Hoogte van de wand in centimeters"),
      {
        soort: "tekst",
        naam: "ondergrond",
        label: "Type ondergrond",
        hint: "Bijvoorbeeld gestuukt, behang, hout of glas.",
        maxLengte: 100,
      },
    ],
  },
  raam: {
    titel: "Over de ramen",
    uitleg:
      "Zijn de ramen niet allemaal even groot? Geef de maat van het grootste raam en zet de rest in de toelichting.",
    velden: [
      breedte("Breedte per raam in centimeters"),
      hoogte("Hoogte per raam in centimeters"),
      {
        soort: "tekst",
        naam: "aantalRamen",
        label: "Aantal ramen",
        verplicht: true,
        invoer: "numeric",
        kort: true,
      },
      {
        soort: "keuze",
        naam: "zijde",
        label: "Binnen- of buitenkant",
        hint: "Aan welke kant van het glas de folie komt.",
        verplicht: true,
        leeg: "Kies binnen of buiten",
        opties: [
          { waarde: "binnen", label: "Aan de binnenkant" },
          { waarde: "buiten", label: "Aan de buitenkant" },
        ],
      },
    ],
  },
  algemeen: undefined,
};

/** De zes categorieën als keuzes. */
export const categorieOpties: readonly Optie[] = categorieen.map(
  (categorie) => ({ waarde: categorie.slug, label: categorie.naam }),
);

/** De diensten van één categorie als keuzes; leeg bij een onbekende categorie. */
export function dienstOpties(categorieSlug: string): readonly Optie[] {
  return (getCategorie(categorieSlug)?.diensten ?? []).map((dienst) => ({
    waarde: dienst.slug,
    label: dienst.naam,
  }));
}

/**
 * De keuze waarmee het formulier begint, uit de link. Alleen een bekende
 * categorie telt, en een dienst alleen als die bij die categorie hoort.
 */
export function beginKeuze(
  categorie?: string,
  dienst?: string,
): { categorie: string; dienst: string } {
  const gevonden =
    categorie === undefined ? undefined : getCategorie(categorie);
  if (gevonden === undefined) return { categorie: "", dienst: "" };
  const hoortErbij =
    dienst !== undefined && getDienst(gevonden.slug, dienst) !== undefined;
  return { categorie: gevonden.slug, dienst: hoortErbij ? dienst : "" };
}

/** De volgorde van de velden in het formulier, voor het foutenoverzicht. */
export const veldVolgorde: readonly string[] = [
  "categorie",
  "dienst",
  "merk",
  "model",
  "bouwjaar",
  "lengteHoogte",
  "aantalVoertuigen",
  "lakkleur",
  "breedteCm",
  "hoogteCm",
  "uitvoering",
  "ondergrond",
  "montagehoogteM",
  "aantalRamen",
  "zijde",
  "toelichting",
  "bestanden",
  "naam",
  "bedrijfsnaam",
  "email",
  "telefoon",
  "plaats",
  "afspraak",
  "afspraakLocatie",
  "afspraakAdres",
  "afspraakDatum",
  "afspraakDagdeel",
];

/**
 * Het id van het veld bij een naam. Het afspraakvinkje staat in een
 * Keuzegroep, die elke keuze een eigen id geeft: de eerste is `afspraak-1`.
 */
export function veldId(naam: string): string {
  return naam === "afspraak" ? "afspraak-1" : naam;
}

export interface FoutRegel {
  naam: string;
  melding: string;
  /** Het id om naartoe te linken; ontbreekt als het veld niet in beeld is. */
  id?: string;
}

/**
 * De fouten in de volgorde van het formulier. Een fout bij een veld dat niet
 * (meer) in beeld is, krijgt geen link.
 */
export function foutRegels(
  fouten: Fouten,
  zichtbaar: ReadonlySet<string>,
): FoutRegel[] {
  const plek = (naam: string) => {
    const index = veldVolgorde.indexOf(naam);
    return index === -1 ? veldVolgorde.length : index;
  };
  return Object.entries(fouten)
    .sort(([a], [b]) => plek(a) - plek(b))
    .map(([naam, melding]) => ({
      naam,
      melding,
      ...(zichtbaar.has(naam) ? { id: veldId(naam) } : {}),
    }));
}
