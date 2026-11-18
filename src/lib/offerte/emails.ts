/**
 * De twee e-mails bij een offerteaanvraag (docs/processen.md): de aanvraag
 * voor SignUp, met de bestanden erbij, en een bevestiging voor de klant.
 */
import { getCategorie, getDienst } from "@/content/diensten";
import { site } from "@/content/site";
import type { Bijlage, Mail } from "@/lib/mail";
import type { Aanvraag } from "@/lib/offerte/aanvraag";
import { isGroteKlus } from "@/lib/offerte/kwalificatie";

const entiteiten: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Maakt tekst veilig voor HTML: `&`, `<`, `>`, `"` en `'`. */
export function escapeHtml(tekst: string): string {
  return tekst.replace(/[&<>"']/g, (teken) => entiteiten[teken] ?? teken);
}

interface Regel {
  label: string;
  waarde: string;
}

interface Blok {
  kop: string;
  regels: Regel[];
}

const detailLabels: Record<string, { label: string; eenheid?: string }> = {
  merk: { label: "Merk" },
  model: { label: "Model" },
  bouwjaar: { label: "Bouwjaar" },
  lengteHoogte: { label: "Lengte/hoogte-variant" },
  aantalVoertuigen: { label: "Aantal voertuigen" },
  lakkleur: { label: "Lakkleur" },
  breedteCm: { label: "Breedte", eenheid: "cm" },
  hoogteCm: { label: "Hoogte", eenheid: "cm" },
  uitvoering: { label: "Gewenste uitvoering" },
  ondergrond: { label: "Ondergrond" },
  montagehoogteM: { label: "Montagehoogte", eenheid: "m" },
  aantalRamen: { label: "Aantal ramen" },
  zijde: { label: "Binnen- of buitenkant" },
};

/** Getallen met een komma als decimaalteken, zoals de klant ze invult. */
function formatGetal(getal: number): string {
  return String(getal).replace(".", ",");
}

function formatDatum(datum: string): string {
  const leesbaar = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${datum}T00:00:00Z`));
  return `${leesbaar} (${datum})`;
}

function categorieNaam(aanvraag: Aanvraag): string {
  return getCategorie(aanvraag.categorie)?.naam ?? aanvraag.categorie;
}

function dienstNaam(aanvraag: Aanvraag): string | undefined {
  if (aanvraag.dienst === undefined) return undefined;
  return (
    getDienst(aanvraag.categorie, aanvraag.dienst)?.naam ?? aanvraag.dienst
  );
}

/** Laat regels zonder waarde weg. */
function regels(...lijst: Array<[string, string | undefined]>): Regel[] {
  return lijst.flatMap(([label, waarde]) =>
    waarde === undefined ? [] : [{ label, waarde }],
  );
}

function projectRegels(aanvraag: Aanvraag): Regel[] {
  const details = Object.entries(aanvraag.details).map(([veld, waarde]) => {
    const info = detailLabels[veld] ?? { label: veld };
    const tekst = typeof waarde === "number" ? formatGetal(waarde) : waarde;
    return {
      label: info.label,
      waarde: info.eenheid ? `${tekst} ${info.eenheid}` : tekst,
    };
  });
  return [
    ...regels(
      ["Categorie", categorieNaam(aanvraag)],
      ["Dienst", dienstNaam(aanvraag)],
    ),
    ...details,
  ];
}

function afspraakRegels(aanvraag: Aanvraag): Regel[] {
  const afspraak = aanvraag.afspraak;
  if (afspraak === undefined) {
    return [{ label: "Afspraakverzoek", waarde: "geen" }];
  }
  return regels(
    [
      "Waar",
      afspraak.locatie === "locatie" ? "op locatie" : "in de werkplaats",
    ],
    ["Voorkeursdatum", formatDatum(afspraak.datum)],
    ["Dagdeel", afspraak.dagdeel],
    ["Adres", afspraak.adres],
  );
}

function tekstVanBlokken(blokken: Blok[]): string {
  return blokken
    .map((blok) =>
      [
        blok.kop,
        ...blok.regels.map((regel) => `${regel.label}: ${regel.waarde}`),
      ].join("\n"),
    )
    .join("\n\n");
}

function htmlVanBlokken(blokken: Blok[]): string {
  return blokken
    .map((blok) => {
      const rijen = blok.regels
        .map(
          (regel) =>
            `<tr><th align="left" valign="top" style="padding:2px 12px 2px 0">${escapeHtml(regel.label)}</th><td style="padding:2px 0">${escapeHtml(regel.waarde)}</td></tr>`,
        )
        .join("");
      return `<h2>${escapeHtml(blok.kop)}</h2><table role="presentation">${rijen}</table>`;
    })
    .join("");
}

function alinea(tekst: string): string {
  return `<p>${escapeHtml(tekst).replace(/\r?\n/g, "<br>")}</p>`;
}

function htmlDocument(inhoud: string): string {
  return `<!doctype html><html lang="nl"><body style="font-family:sans-serif;line-height:1.5">${inhoud}</body></html>`;
}

/** Eén regel tekst voor een onderwerpregel: geen regeleinden. */
function enkeleRegel(tekst: string): string {
  return tekst.replace(/\s+/g, " ").trim();
}

function grootte(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${formatGetal(Math.round(bytes / 1024))} kB`;
  return `${formatGetal(Math.round((bytes / (1024 * 1024)) * 10) / 10)} MB`;
}

/** De aanvraag voor SignUp, met antwoorden naar de klant. */
export function maakInterneMail(aanvraag: Aanvraag, bijlagen: Bijlage[]): Mail {
  const grote = isGroteKlus(aanvraag);
  const onderwerp = `${grote ? "[GROTE KLUS] " : ""}Offerteaanvraag ${categorieNaam(aanvraag)} - ${enkeleRegel(aanvraag.naam)}`;

  const intro = grote
    ? "Nieuwe offerteaanvraag via de website. Dit is een grote klus."
    : "Nieuwe offerteaanvraag via de website.";

  const blokken: Blok[] = [
    {
      kop: "Contactgegevens",
      regels: regels(
        ["Naam", aanvraag.naam],
        ["Bedrijfsnaam", aanvraag.bedrijfsnaam],
        ["E-mail", aanvraag.email],
        ["Telefoon", aanvraag.telefoon],
        ["Plaats", aanvraag.plaats],
      ),
    },
    { kop: "Aanvraag", regels: projectRegels(aanvraag) },
    { kop: "Afspraakverzoek", regels: afspraakRegels(aanvraag) },
    {
      kop: "Bijlagen",
      regels:
        bijlagen.length === 0
          ? [{ label: "Bijlagen", waarde: "geen" }]
          : bijlagen.map((bijlage, index) => ({
              label: `Bestand ${index + 1}`,
              waarde: `${bijlage.naam} (${grootte(bijlage.inhoud.byteLength)})`,
            })),
    },
  ];

  const toelichting = aanvraag.toelichting;
  const tekst = [
    intro,
    tekstVanBlokken(blokken),
    ...(toelichting === undefined ? [] : [`Toelichting\n${toelichting}`]),
    `Antwoorden op deze mail gaan naar ${aanvraag.email}.`,
  ].join("\n\n");

  const html = htmlDocument(
    [
      alinea(intro),
      htmlVanBlokken(blokken),
      ...(toelichting === undefined
        ? []
        : [`<h2>Toelichting</h2>${alinea(toelichting)}`]),
      alinea(`Antwoorden op deze mail gaan naar ${aanvraag.email}.`),
    ].join(""),
  );

  return {
    aan: site.email,
    antwoordAan: aanvraag.email,
    onderwerp,
    tekst,
    html,
    bijlagen,
  };
}

/**
 * De bevestiging voor de klant, met een samenvatting van de aanvraag. De vrije
 * toelichting staat er bewust niet in: zo kan niemand het formulier gebruiken
 * om eigen tekst naar het adres van een ander te laten mailen.
 */
export function maakBevestigingsMail(aanvraag: Aanvraag): Mail {
  const aanhef = `Beste ${aanvraag.naam},`;
  const bedankt = `Bedankt voor je aanvraag bij ${site.naam}. We hebben alles goed ontvangen.`;
  const belofte = `${site.reactiebelofte}. Je hebt dan direct contact met de specialist die het werk ook uitvoert.`;
  const afspraakNoot =
    aanvraag.afspraak === undefined
      ? undefined
      : "Je afspraakverzoek is nog niet definitief: we bevestigen de afspraak persoonlijk.";
  const contact = `Wil je iets aanvullen of heb je haast? Stuur een WhatsApp of bel ${site.telefoon.weergave}. Je kunt ook gewoon op deze mail antwoorden.`;
  const groet = `Met vriendelijke groet,\n${site.naam}`;

  const blokken: Blok[] = [
    { kop: "Samenvatting van je aanvraag", regels: projectRegels(aanvraag) },
    ...(aanvraag.afspraak === undefined
      ? []
      : [{ kop: "Je afspraakverzoek", regels: afspraakRegels(aanvraag) }]),
  ];

  const tekst = [
    aanhef,
    bedankt,
    belofte,
    tekstVanBlokken(blokken),
    ...(afspraakNoot === undefined ? [] : [afspraakNoot]),
    `${contact}\nWhatsApp: ${site.whatsapp}`,
    groet,
  ].join("\n\n");

  const html = htmlDocument(
    [
      alinea(aanhef),
      alinea(bedankt),
      alinea(belofte),
      htmlVanBlokken(blokken),
      ...(afspraakNoot === undefined ? [] : [alinea(afspraakNoot)]),
      `<p>${escapeHtml(contact)} <a href="${escapeHtml(site.whatsapp)}">Open WhatsApp</a></p>`,
      alinea(groet),
    ].join(""),
  );

  return {
    aan: aanvraag.email,
    antwoordAan: site.email,
    onderwerp: "We hebben je aanvraag ontvangen",
    tekst,
    html,
    bijlagen: [],
  };
}
