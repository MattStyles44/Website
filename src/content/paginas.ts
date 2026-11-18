import type { Metadata } from "next";

import {
  alleDiensten,
  categorieen,
  getCategorie,
  getDienst,
  type Categorie,
} from "@/content/diensten";
import { site } from "@/content/site";

/**
 * Alle vaste pagina's van de site. Eén bron voor metadata, sitemap,
 * navigatie en de controle van redirects.
 */
export interface Pagina {
  pad: string;
  titel: string;
  omschrijving: string;
}

export const paginas = {
  home: {
    pad: "/",
    titel: `${site.naam} | ${site.slogan}`,
    omschrijving:
      "Voertuigreclame, carwrapping, gevel- en lichtreclame, bewegwijzering en interieurdecoratie in Groningen en Noord-Nederland. 25 jaar vakmanschap.",
  },
  diensten: {
    pad: "/diensten",
    titel: "Diensten",
    omschrijving:
      "Alle diensten van SignUp Reclame: van autobelettering en carwrapping tot gevelreclame, raamfolie en interieurdecoratie. Alles op maat.",
  },
  projecten: {
    pad: "/projecten",
    titel: "Projecten",
    omschrijving:
      "Projecten van SignUp Reclame: voertuigbelettering, carwraps, gevelreclame en interieur in Groningen en Noord-Nederland.",
  },
  overOns: {
    pad: "/over-ons",
    titel: "Over ons",
    omschrijving:
      "SignUp Reclame: al 25 jaar specialist in signing en visuele communicatie in Groningen. Korte lijnen, eerlijk advies en A-merk materialen.",
  },
  contact: {
    pad: "/contact",
    titel: "Contact",
    omschrijving: `Neem contact op met SignUp Reclame via WhatsApp, telefoon of e-mail. ${site.reactiebelofte}.`,
  },
  offerte: {
    pad: "/offerte",
    titel: "Offerte aanvragen",
    omschrijving: `Vraag een vrijblijvende offerte op maat aan of plan een meet- of adviesafspraak. ${site.reactiebelofte}.`,
  },
  privacy: {
    pad: "/privacy",
    titel: "Privacyverklaring",
    omschrijving:
      "Hoe SignUp Reclame omgaat met de gegevens die je via deze website verstuurt.",
  },
} as const satisfies Record<string, Pagina>;

export const vastePaginas: readonly Pagina[] = Object.values(paginas);

export function categoriePad(categorieSlug: string): string {
  return `${paginas.diensten.pad}/${categorieSlug}`;
}

export function dienstPad(categorieSlug: string, dienstSlug: string): string {
  return `${categoriePad(categorieSlug)}/${dienstSlug}`;
}

/** Alle paden die de site bedient: vaste pagina's, categorieën en diensten. */
export function allePaden(): string[] {
  return [
    ...vastePaginas.map((pagina) => pagina.pad),
    ...categorieen.map((categorie) => categoriePad(categorie.slug)),
    ...alleDiensten().map(({ categorie, dienst }) =>
      dienstPad(categorie.slug, dienst.slug),
    ),
  ];
}

/** Metadata voor een vaste pagina, met canonical URL. */
export function paginaMetadata(pagina: Pagina): Metadata {
  return {
    // De homepage heeft al een volledige titel; andere pagina's krijgen het sjabloon uit de root layout.
    title: pagina.pad === "/" ? { absolute: pagina.titel } : pagina.titel,
    description: pagina.omschrijving,
    alternates: { canonical: pagina.pad },
  };
}

/** "a, b en c" */
function opsomming(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} en ${items[items.length - 1]}`;
}

/** Eerste letter klein, behalve bij afkortingen en cijfers ("DTP", "3D-..."). */
function kleineBeginletter(naam: string): string {
  if (/^(\d|[A-Z]{2})/.test(naam)) return naam;
  return naam.charAt(0).toLowerCase() + naam.slice(1);
}

/** Korte samenvatting van een categorie, opgebouwd uit de namen van haar diensten. */
export function categorieSamenvatting(categorie: Categorie): string {
  return opsomming(
    categorie.diensten.map((dienst) => kleineBeginletter(dienst.naam)),
  );
}

/** Metadata voor een categoriepagina. Leeg als de categorie niet bestaat. */
export function categorieMetadata(categorieSlug: string): Metadata {
  const categorie = getCategorie(categorieSlug);
  if (!categorie) return {};

  const samenvatting = categorieSamenvatting(categorie);
  return {
    title: `${categorie.naam} in Groningen`,
    description: `${samenvatting.charAt(0).toUpperCase()}${samenvatting.slice(1)}, op maat gemaakt door ${site.naam}. Vraag een vrijblijvende offerte aan.`,
    alternates: { canonical: categoriePad(categorie.slug) },
  };
}

/** Metadata voor een dienstpagina. Leeg als de combinatie niet bestaat. */
export function dienstMetadata(
  categorieSlug: string,
  dienstSlug: string,
): Metadata {
  const dienst = getDienst(categorieSlug, dienstSlug);
  if (!dienst) return {};

  return {
    title: `${dienst.naam} in Groningen`,
    description: `${dienst.omschrijving} Vraag een vrijblijvende offerte aan bij ${site.naam}.`,
    alternates: { canonical: dienstPad(categorieSlug, dienst.slug) },
  };
}
