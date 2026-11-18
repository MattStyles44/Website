/**
 * Het dienstenaanbod van SignUp Reclame: zes categorieën met hun diensten.
 * Bron: dienstenlijst van SignUp (docs/brief.md, 18 november 2026).
 *
 * Op de site staan geen prijzen: alles is maatwerk en elke aanvraag krijgt
 * een offerte op maat (docs/processen.md). Voeg hier dus geen prijzen toe.
 */

/** Welke set formuliervelden bij een categorie hoort (docs/processen.md, fase 6). */
export type FormulierType =
  "voertuig" | "gevel" | "interieur" | "raam" | "algemeen";

export interface Dienst {
  slug: string;
  naam: string;
  omschrijving: string;
}

export interface Categorie {
  slug: string;
  naam: string;
  formulier: FormulierType;
  diensten: readonly Dienst[];
}

export const categorieen: readonly Categorie[] = [
  {
    slug: "voertuigreclame",
    naam: "Voertuigreclame & carwrapping",
    formulier: "voertuig",
    diensten: [
      {
        slug: "autobelettering",
        naam: "Autobelettering & vlootbelettering",
        omschrijving:
          "Logo's, contactgegevens, striping en huisstijlelementen voor personenauto's, bestelbussen, vrachtwagens en aanhangers.",
      },
      {
        slug: "carwrapping",
        naam: "Full carwrapping",
        omschrijving:
          "Volledige kleurverandering of een volledig bedrukte custom wrap met hoogwaardige gietfolies (3M, Avery Dennison, Oracal).",
      },
      {
        slug: "partial-wrapping",
        naam: "Partial wrapping",
        omschrijving:
          "Accenten wrappen, zoals het dak, de spiegelkappen, de motorkap of spoilers.",
      },
      {
        slug: "chrome-delete",
        naam: "Chrome delete (de-chromen)",
        omschrijving:
          "Raamlijsten, grilles, dakrails en sierlijsten strak afwerken in hoogglans, satin of mat zwart.",
      },
      {
        slug: "magneetplaten",
        naam: "Magneetplaten",
        omschrijving: "Tijdelijke, verwisselbare voertuigreclame op maat.",
      },
    ],
  },
  {
    slug: "gevelreclame",
    naam: "Gevelreclame & lichtreclame",
    formulier: "gevel",
    diensten: [
      {
        slug: "3d-freesletters",
        naam: "3D-freesletters (onverlicht)",
        omschrijving:
          "Gevelletters en logo's uit gefreesd acrylaat (plexiglas), Dibond of RVS, eventueel op afstandshouders.",
      },
      {
        slug: "3d-doosletters",
        naam: "3D-doosletters (verlicht)",
        omschrijving:
          "Aluminium of kunststof doosletters met energiezuinige ledverlichting, direct verlicht of indirect (halo-lit).",
      },
      {
        slug: "lichtbakken",
        naam: "Lichtbakken & uitsteekbakken",
        omschrijving:
          "Enkelzijdige gevellichtbakken en dubbelzijdige haakse uitsteeklichtbakken.",
      },
      {
        slug: "gevelborden",
        naam: "Gevelborden & spandoekframes",
        omschrijving:
          "Aluminium buizenframes met peesdoek of spandoek, en strakke Dibond-gevelpanelen.",
      },
    ],
  },
  {
    slug: "buitenreclame",
    naam: "Buitenreclame & bewegwijzering",
    formulier: "gevel",
    diensten: [
      {
        slug: "reclameborden",
        naam: "Reclameborden & bouwborden",
        omschrijving:
          "Weerbestendige borden op Dibond, Trespa of Forex, inclusief uv- en krasbestendig laminaat.",
      },
      {
        slug: "reclamezuilen",
        naam: "Reclamezuilen & vrijstaande pylonen",
        omschrijving:
          "Verlichte of onverlichte informatiezuilen bij bedrijfspanden.",
      },
      {
        slug: "bewegwijzering",
        naam: "Bewegwijzering (buiten en binnen)",
        omschrijving:
          "Parkeerborden, routebordjes, naamborden en verdiepingsaanduidingen.",
      },
      {
        slug: "vlaggen",
        naam: "Vlaggen & banieren",
        omschrijving: "Bedrukte bedrijfsvlaggen, gevelbanieren en beachflags.",
      },
    ],
  },
  {
    slug: "interieur",
    naam: "Interieurdecoratie & wandbekleding",
    formulier: "interieur",
    diensten: [
      {
        slug: "fotobehang",
        naam: "Naadloos fotobehang",
        omschrijving:
          "Grootformaat wandprints uit één stuk (Airtex of Sanotex) voor kantoren, winkels, horeca en exposities.",
      },
      {
        slug: "muurteksten",
        naam: "Muurteksten & wandstickers",
        omschrijving: "Gesneden matte muurvinyl-teksten, quotes en logo's.",
      },
      {
        slug: "interieurwrapping",
        naam: "Interieurwrapping",
        omschrijving:
          "Meubels, balies, deuren en kasten een nieuwe look geven (hout-, beton- of staalstructuur) met architecturale wrapfolie.",
      },
      {
        slug: "wandpanelen",
        naam: "Plexiglas & wandpanelen",
        omschrijving:
          "Luxe foto- en logopanelen op helder acrylaat of geborsteld aluminium, met RVS-afstandshouders.",
      },
    ],
  },
  {
    slug: "raamfolie",
    naam: "Raamfolies & glasdecoratie",
    formulier: "raam",
    diensten: [
      {
        slug: "zandstraalfolie",
        naam: "Zandstraalfolie",
        omschrijving:
          "Privacyfolie voor kantoorramen, spreekkamers en voordeuren, eventueel met een uitgesneden logo of patroon.",
      },
      {
        slug: "raambelettering",
        naam: "Raambelettering & etalagereclame",
        omschrijving:
          "Actieteksten, openingstijden, logo's en one-way-visionfolie op winkelruiten.",
      },
      {
        slug: "zonwerende-folie",
        naam: "Zonwerende & veiligheidsfolie",
        omschrijving:
          "Warmtewerende, uv-filterende of inbraakvertragende raamfolies.",
      },
    ],
  },
  {
    slug: "ontwerp",
    naam: "Ontwerp, DTP & maatwerk",
    formulier: "algemeen",
    diensten: [
      {
        slug: "ontwerp-en-visualisatie",
        naam: "Ontwerp & visualisatie",
        omschrijving:
          "Je huisstijl vertaald naar voertuigen en gevels, met vooraf schaaltekeningen (werktekeningen).",
      },
      {
        slug: "dtp",
        naam: "DTP & bestandsvoorbereiding",
        omschrijving:
          "Logo's vectoriseren en snij- en printbestanden drukklaar maken.",
      },
      {
        slug: "beurssigning",
        naam: "Beurs- & evenementensigning",
        omschrijving:
          "Presentatiewanden, peesdoekframes, displays en tijdelijke bewegwijzering.",
      },
      {
        slug: "demontage",
        naam: "Demontage & verwijdering",
        omschrijving:
          "Professioneel verwijderen van oude folie, belettering en lijmresten.",
      },
    ],
  },
];

export function getCategorie(slug: string): Categorie | undefined {
  return categorieen.find((categorie) => categorie.slug === slug);
}

/** Een dienst binnen een categorie; undefined als de combinatie niet bestaat. */
export function getDienst(
  categorieSlug: string,
  dienstSlug: string,
): Dienst | undefined {
  return getCategorie(categorieSlug)?.diensten.find(
    (dienst) => dienst.slug === dienstSlug,
  );
}

/** Alle diensten met hun categorie, in volgorde. */
export function alleDiensten(): Array<{
  categorie: Categorie;
  dienst: Dienst;
}> {
  return categorieen.flatMap((categorie) =>
    categorie.diensten.map((dienst) => ({ categorie, dienst })),
  );
}
