/**
 * Permanente doorverwijzingen van de oude WordPress-site (www.sign-up.nl)
 * naar de nieuwe URL's, zodat bestaande links en vindbaarheid behouden blijven.
 * Bron: de sitemap van de huidige site op 18 november 2026.
 */
export interface Doorverwijzing {
  van: string;
  naar: string;
}

export const doorverwijzingen: readonly Doorverwijzing[] = [
  // Dienstenoverzicht en algemene signing
  { van: "/onze-diensten", naar: "/diensten" },
  { van: "/onze-diensten/signing", naar: "/diensten" },
  { van: "/onze-diensten/totaal-signing", naar: "/diensten" },
  { van: "/groot-formaat-print", naar: "/diensten" },
  { van: "/groot-formaat-print-2", naar: "/diensten" },
  { van: "/project/groot-formaat-print", naar: "/diensten" },

  // Voertuigreclame & carwrapping
  {
    van: "/autobelettering",
    naar: "/diensten/voertuigreclame/autobelettering",
  },
  {
    van: "/onze-diensten/auto-belettering",
    naar: "/diensten/voertuigreclame/autobelettering",
  },
  {
    van: "/project/autobelettering",
    naar: "/diensten/voertuigreclame/autobelettering",
  },
  { van: "/carwrapping", naar: "/diensten/voertuigreclame/carwrapping" },
  {
    van: "/onze-diensten/carwrapping",
    naar: "/diensten/voertuigreclame/carwrapping",
  },
  {
    van: "/project/carwrapping",
    naar: "/diensten/voertuigreclame/carwrapping",
  },

  // Gevelreclame & lichtreclame
  { van: "/onze-diensten/gevelreclame", naar: "/diensten/gevelreclame" },
  { van: "/onze-diensten/lichtreclame", naar: "/diensten/gevelreclame" },
  {
    van: "/raambelettering-gevel-en-lichtreclame",
    naar: "/diensten/gevelreclame",
  },
  {
    van: "/project/raambelettering-gevel-en-lichtreclame",
    naar: "/diensten/gevelreclame",
  },

  // Buitenreclame & bewegwijzering
  {
    van: "/onze-diensten/reclameborden",
    naar: "/diensten/buitenreclame/reclameborden",
  },
  { van: "/bewegwijzering", naar: "/diensten/buitenreclame/bewegwijzering" },
  {
    van: "/project/bewegwijzering",
    naar: "/diensten/buitenreclame/bewegwijzering",
  },

  // Interieurdecoratie & wandbekleding
  { van: "/interieur", naar: "/diensten/interieur" },
  { van: "/project/interieur", naar: "/diensten/interieur" },
  {
    van: "/onze-diensten/muurteksten",
    naar: "/diensten/interieur/muurteksten",
  },
  { van: "/onze-diensten/fotobehang", naar: "/diensten/interieur/fotobehang" },

  // Raamfolies & glasdecoratie
  {
    van: "/onze-diensten/raambelettering",
    naar: "/diensten/raamfolie/raambelettering",
  },

  // Projecten
  { van: "/project", naar: "/projecten" },
  { van: "/specials", naar: "/projecten" },
  { van: "/project/specials", naar: "/projecten" },
  { van: "/project_category/signup", naar: "/projecten" },

  // Contact en offerte
  { van: "/contact-met-sign-up", naar: "/contact" },
  { van: "/project/contact", naar: "/contact" },
  { van: "/offerte-aanvragen", naar: "/offerte" },
];

/** In het formaat van next.config.ts `redirects()`; 308 permanent. */
export function nextRedirects() {
  return doorverwijzingen.map(({ van, naar }) => ({
    source: van,
    destination: naar,
    permanent: true,
  }));
}
