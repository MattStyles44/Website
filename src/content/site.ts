/**
 * Vaste bedrijfsgegevens van SignUp Reclame.
 * Bron: docs/brief.md en docs/processen.md. Wijzig hier, niet in losse pagina's.
 */
export const site = {
  naam: "SignUp Reclame",
  slogan: "Signing en visuele communicatie in Groningen",
  regio: "Groningen en Noord-Nederland (Groningen, Friesland, Drenthe)",
  ervaring: "25 jaar",
  reactiebelofte: "Reactie binnen 24 uur op werkdagen",
  telefoon: {
    weergave: "06 51 55 64 33",
    link: "tel:+31651556433",
  },
  whatsapp: "https://wa.me/31651556433",
  email: "info@sign-up.nl",
  materialen: ["Oracal 751C", "3M 2080", "Avery Dennison SW900"],
} as const;

/** Provincies waar SignUp werkt (docs/brief.md), voor zoekmachines. */
export const werkgebied = ["Groningen", "Friesland", "Drenthe"] as const;

export interface Adres {
  straat: string;
  postcode: string;
  plaats: string;
}

/**
 * Vestigingsadres (werkplaats), openbaar in de gestructureerde gegevens.
 * Aangeleverd door SignUp op 18 november 2026; houd het gelijk aan het
 * Google Bedrijfsprofiel. Zonder adres beschrijven we SignUp als organisatie
 * met een werkgebied in plaats van als lokaal bedrijf.
 */
export const vestiging: Adres | undefined = {
  straat: "Koldingweg 9",
  postcode: "9723 HL",
  plaats: "Groningen",
};

/** De drie redenen om voor SignUp te kiezen (docs/brief.md). */
export const onderscheidend = [
  {
    titel: "Alleen A-merk materialen",
    tekst:
      "Uitsluitend hoogwaardige gietfolies van onder meer 3M, Avery Dennison en Oracal. Geen goedkope folies die na een jaar krimpen of loslaten.",
  },
  {
    titel: "25 jaar vakmanschap",
    tekst: "Strakke montage, naadloze afwerking en eerlijk technisch advies.",
  },
  {
    titel: "Korte lijnen",
    tekst:
      "Je hebt direct contact met de specialist die het werk ook uitvoert.",
  },
] as const;
