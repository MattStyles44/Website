import { getDienst } from "@/content/diensten";
import { dienstPad } from "@/content/paginas";
import { site, vestiging, werkgebied } from "@/content/site";

/**
 * Teksten van de homepage, uit de goedgekeurde SEO-analyse (zoekterm
 * "belettering Groningen"). Waar ze bestaan komen gegevens uit `site` en
 * `vestiging`, zodat een wijziging daar ook hier doorwerkt.
 */

/** "a, b en c" */
function opsomming(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} en ${items[items.length - 1]}`;
}

/** De eerste letter als kleine letter, voor midden in een zin. */
function metKleineLetter(tekst: string): string {
  return tekst.charAt(0).toLowerCase() + tekst.slice(1);
}

/** "Groningen, Friesland en Drenthe" */
const provincies = opsomming(werkgebied);

/** "aan de Koldingweg 9 in Groningen"; leeg zonder vestigingsadres. */
const werkplaatsAdres = vestiging
  ? ` aan de ${vestiging.straat} in ${vestiging.plaats}`
  : "";

/** De teamfoto in het openingsvlak, ook gebruikt in de gestructureerde gegevens. */
export const teamfoto = {
  src: "/fotos/team-etalage.jpg",
  alt: "Het team van SignUp Reclame bij een etalage met grote zwart-witte raamfolie",
} as const;

export const homeKop = "Belettering en reclame in Groningen";

export const homeIntro = `Van autobelettering en carwrapping tot gevelreclame en raamfolie: ${site.naam} maakt en monteert al ${site.ervaring} reclame voor ondernemers in ${provincies}. Met alleen A-merk gietfolie en strakke afwerking. Je spreekt direct met de vakman die het werk ook uitvoert.`;

/** Korte punten onder de knoppen in het openingsvlak. */
export const vertrouwenspunten: readonly string[] = [
  "A-merk folie van 3M, Avery Dennison en Oracal",
  `${site.ervaring} vakmanschap`,
  site.reactiebelofte,
  ...(werkplaatsAdres ? [`Eigen werkplaats${werkplaatsAdres}`] : []),
];

/** De koppen (`<h2>`) van de secties, in volgorde op de pagina. */
export const homeSecties = {
  diensten: "Onze diensten: van bedrijfsbus tot gevel",
  wagenpark: "Voor wagenparken en complete panden",
  projecten: "Recent werk in Groningen en omgeving",
  waarom: "Waarom ondernemers in Noord-Nederland voor SignUp kiezen",
  werkwijze: "Zo werkt het: van aanvraag tot montage",
  vragen: "Veelgestelde vragen over belettering",
} as const;

export const wagenparkTekst =
  "Rijdt je bedrijf met meerdere bussen, of krijgt je pand een nieuwe uitstraling? Dan regel je alles bij één aanspreekpunt: ontwerp, productie en montage. Zo krijgen je bedrijfswagens, gevel, ramen en bewegwijzering één herkenbare huisstijl.";

/** Veelgevraagde diensten voor wagenparken en panden: [categorie, dienst]. */
const veelgevraagd = [
  ["voertuigreclame", "autobelettering"],
  ["voertuigreclame", "carwrapping"],
  ["gevelreclame", "3d-doosletters"],
  ["gevelreclame", "lichtbakken"],
  ["raamfolie", "raambelettering"],
] as const;

/** De veelgevraagde diensten als links, met de naam uit src/content/diensten.ts. */
export const veelgevraagdeDiensten: ReadonlyArray<{
  naam: string;
  href: string;
}> = veelgevraagd.flatMap(([categorie, slug]) => {
  const dienst = getDienst(categorie, slug);
  return dienst
    ? [{ naam: dienst.naam, href: dienstPad(categorie, dienst.slug) }]
    : [];
});

/** Van aanvraag tot montage, in vier stappen. */
export const stappen: ReadonlyArray<{ titel: string; tekst: string }> = [
  {
    titel: "Aanvraag",
    tekst:
      "Via het offerteformulier of WhatsApp, met je logo en foto's. Elk bestand is welkom.",
  },
  {
    titel: "Reactie en advies",
    tekst: `${site.reactiebelofte}. Waar nodig volgt een meet- of adviesafspraak op locatie of in de werkplaats.`,
  },
  {
    titel: "Offerte op maat",
    tekst:
      "Vrijblijvend, als PDF per e-mail. Waar nodig met een ontwerp vooraf.",
  },
  {
    titel: "Productie en montage",
    tekst: "We maken de belettering en brengen die zelf aan.",
  },
];

/** Veelgestelde vragen: zichtbaar op de pagina en als FAQPage in de JSON-LD. */
export const homeVragen: ReadonlyArray<{ vraag: string; antwoord: string }> = [
  {
    vraag: "Wat kost belettering van een bedrijfsbus?",
    antwoord: `Dat hangt af van het voertuig, hoeveel je laat beletteren of wrappen, of er al een ontwerp is en hoeveel voertuigen het zijn. Elke klus is maatwerk: je krijgt vooraf een vrijblijvende offerte, met een ${metKleineLetter(site.reactiebelofte)}.`,
  },
  {
    vraag: "Hoe lang gaat autobelettering mee?",
    antwoord: `We werken alleen met gietfolies van A-merken, zoals ${opsomming(site.materialen)}. Daarop zit fabrieksgarantie van 3 tot 5 jaar of langer, afhankelijk van de folie en de toepassing.`,
  },
  {
    vraag: "Welke bestanden moet ik aanleveren?",
    antwoord:
      "Elk bestand is welkom: EPS, AI, PDF, JPG of PNG. We controleren of het geschikt is en maken je logo zo nodig opnieuw op.",
  },
  {
    vraag: "Werken jullie ook buiten de stad Groningen?",
    antwoord: `Ja, in heel Noord-Nederland: ${provincies}. Een meet- of adviesafspraak kan op locatie of in onze werkplaats${werkplaatsAdres}.`,
  },
];
