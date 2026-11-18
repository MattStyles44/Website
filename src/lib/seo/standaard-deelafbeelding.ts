import { site } from "@/content/site";

/** Standaardformaat voor Open Graph-afbeeldingen (Facebook, LinkedIn, WhatsApp). */
export const deelafbeeldingFormaat = { width: 1200, height: 630 } as const;

/**
 * De algemene deelafbeelding (src/app/opengraph-image.tsx). Een pagina met
 * eigen `openGraph` vervangt die van de layout, afbeelding inbegrepen; vaste
 * pagina's verwijzen daarom zelf naar deze afbeelding (zie paginaMetadata).
 */
export const standaardDeelafbeelding = {
  url: "/opengraph-image",
  alt: `${site.naam}: ${site.slogan}`,
  type: "image/png",
  ...deelafbeeldingFormaat,
} as const;
