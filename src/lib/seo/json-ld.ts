import type { Categorie, Dienst } from "@/content/diensten";
import { paginas } from "@/content/paginas";
import { site, werkgebied, type Adres } from "@/content/site";

/**
 * Gestructureerde gegevens (JSON-LD, schema.org) voor zoekmachines en AI.
 * Alleen feiten uit src/content; geen beoordelingen, prijzen of adressen die
 * niet vaststaan.
 */

export type JsonLd = { "@context": "https://schema.org" } & Record<
  string,
  unknown
>;

const context = "https://schema.org" as const;

export function absoluteUrl(pad: string, basis: string): string {
  return new URL(pad, basis).toString();
}

/** Vaste verwijzing naar de organisatie, zodat andere gegevens ernaar linken. */
export function organisatieId(basis: string): string {
  return `${absoluteUrl("/", basis)}#organisatie`;
}

const gebied = werkgebied.map((naam) => ({
  "@type": "AdministrativeArea",
  name: naam,
}));

/**
 * SignUp als organisatie; met een vestigingsadres als lokaal bedrijf.
 * Geef `vestiging` uit src/content/site.ts mee, of undefined voor geen adres.
 */
export function organisatieJsonLd(
  basis: string,
  adres: Adres | undefined,
): JsonLd {
  return {
    "@context": context,
    "@type": adres ? "LocalBusiness" : "Organization",
    "@id": organisatieId(basis),
    name: site.naam,
    url: absoluteUrl("/", basis),
    slogan: site.slogan,
    description: paginas.home.omschrijving,
    telephone: site.telefoon.link.replace(/^tel:/, ""),
    email: site.email,
    areaServed: gebied,
    ...(adres
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: adres.straat,
            postalCode: adres.postcode,
            addressLocality: adres.plaats,
            addressCountry: "NL",
          },
        }
      : {}),
  };
}

export function websiteJsonLd(basis: string): JsonLd {
  const url = absoluteUrl("/", basis);
  return {
    "@context": context,
    "@type": "WebSite",
    "@id": `${url}#website`,
    name: site.naam,
    url,
    inLanguage: "nl-NL",
    publisher: { "@id": organisatieId(basis) },
  };
}

/** Een dienst van SignUp, gekoppeld aan de organisatie. */
export function dienstJsonLd(
  categorie: Categorie,
  dienst: Dienst,
  omschrijving: string,
  pad: string,
  basis: string,
): JsonLd {
  const url = absoluteUrl(pad, basis);
  return {
    "@context": context,
    "@type": "Service",
    "@id": `${url}#dienst`,
    name: dienst.naam,
    serviceType: dienst.naam,
    category: categorie.naam,
    description: omschrijving,
    url,
    provider: { "@id": organisatieId(basis) },
    areaServed: gebied,
  };
}

/** Veelgestelde vragen; undefined als er geen vragen zijn. */
export function veelgesteldeVragenJsonLd(
  vragen: ReadonlyArray<{ vraag: string; antwoord: string }>,
): JsonLd | undefined {
  if (vragen.length === 0) return undefined;
  return {
    "@context": context,
    "@type": "FAQPage",
    mainEntity: vragen.map((item) => ({
      "@type": "Question",
      name: item.vraag,
      acceptedAnswer: { "@type": "Answer", text: item.antwoord },
    })),
  };
}

/** Kruimelpad; het laatste item zonder link is de huidige pagina. */
export function kruimelpadJsonLd(
  items: ReadonlyArray<{ label: string; href?: string }>,
  huidigPad: string,
  basis: string,
): JsonLd {
  return {
    "@context": context,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href ?? huidigPad, basis),
    })),
  };
}

/**
 * JSON voor in een <script>-tag. `<` wordt ge-escapet, zodat tekst uit het
 * CMS de tag niet kan afsluiten (aanbevolen in de Next.js-gids over JSON-LD).
 */
export function serialiseerJsonLd(
  data: JsonLd | ReadonlyArray<JsonLd>,
): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
