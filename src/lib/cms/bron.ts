import { z } from "zod";

import { getCategorie, getDienst } from "@/content/diensten";

/**
 * De inhoud uit Sanity: teksten per categorie en dienst, en projecten.
 * De structuur (welke categorieën en diensten er zijn, en hun webadressen)
 * staat vast in `src/content/diensten.ts`; Sanity levert alleen de teksten.
 *
 * Zonder Sanity, of bij een onleesbaar document, valt elke functie terug op
 * de vaste teksten uit de code. Een netwerkfout gaat wel door, zodat Next.js
 * de vorige versie van de pagina blijft tonen in plaats van lege teksten.
 */

/** Voert een GROQ-query uit en geeft het ruwe antwoord terug. */
export type SanityOphalen = (
  query: string,
  params: Record<string, string>,
) => Promise<unknown>;

const blokSchema = z.looseObject({
  _type: z.string(),
  _key: z.string().optional(),
});

/** Een blok rijke tekst (Portable Text). */
export type Blok = z.infer<typeof blokSchema>;

const tekstVeld = z
  .string()
  .nullish()
  .transform((waarde) => waarde?.trim() || undefined);

function lijst<T extends z.ZodType>(item: T) {
  return z
    .array(item)
    .nullish()
    .transform((waarde) => waarde ?? []);
}

/** Een foto uit Sanity, zoals de site hem toont met `next/image`. */
export type Foto = {
  url: string;
  alt: string;
  breedte: number;
  hoogte: number;
};

/** Alleen foto's van het CDN van Sanity, met een beschrijving en afmetingen. */
const fotoSchema = z.object({
  url: z.string().startsWith("https://cdn.sanity.io/"),
  alt: z.string().trim().min(1),
  breedte: z.number().positive(),
  hoogte: z.number().positive(),
});

/**
 * De foto's van een document. Een onvolledige foto valt weg, zonder dat de
 * rest van het document onleesbaar wordt. Zonder foto's een lege lijst.
 */
const fotosVeld = z
  .unknown()
  .optional()
  .transform((waarde): Foto[] =>
    Array.isArray(waarde)
      ? waarde.flatMap((item) => {
          const foto = fotoSchema.safeParse(item);
          return foto.success ? [foto.data] : [];
        })
      : [],
  );

const stapSchema = z.object({ titel: z.string(), tekst: z.string() });
const vraagSchema = z.object({ vraag: z.string(), antwoord: z.string() });

const categorieDocSchema = z.object({
  intro: tekstVeld,
  tekst: lijst(blokSchema),
});

const dienstDocSchema = z.object({
  intro: tekstVeld,
  tekst: lijst(blokSchema),
  voordelen: lijst(z.string()),
  werkwijze: lijst(stapSchema),
  vragen: lijst(vraagSchema),
  garantie: tekstVeld,
  fotos: fotosVeld,
});

const projectDocSchema = z.object({
  titel: z.string(),
  slug: z.string(),
  klant: tekstVeld,
  plaats: tekstVeld,
  datum: z.iso
    .date()
    .nullish()
    .transform((waarde) => waarde ?? undefined),
  samenvatting: z.string(),
  uitgelicht: z
    .boolean()
    .nullish()
    .transform((waarde) => waarde ?? false),
  diensten: lijst(
    z
      .object({ categorie: z.string().nullish(), slug: z.string().nullish() })
      .nullable(),
  ),
  fotos: fotosVeld,
});

export interface CategorieTekst {
  intro?: string;
  tekst: Blok[];
}

export interface DienstTekst {
  intro: string;
  tekst: Blok[];
  voordelen: string[];
  werkwijze: Array<z.infer<typeof stapSchema>>;
  vragen: Array<z.infer<typeof vraagSchema>>;
  garantie?: string;
  fotos: Foto[];
}

export interface ProjectKaart {
  titel: string;
  slug: string;
  klant?: string;
  plaats?: string;
  datum?: string;
  samenvatting: string;
  uitgelicht: boolean;
  diensten: Array<{ categorie: string; slug: string; naam: string }>;
  fotos: Foto[];
}

export const categorieQuery = `*[_type == "categorie" && slug == $slug][0]{intro, tekst}`;

/** Elke foto met zijn adres, beschrijving en afmetingen. */
const fotosProjectie = `fotos[]{alt, "url": asset->url, "breedte": asset->metadata.dimensions.width, "hoogte": asset->metadata.dimensions.height}`;

export const dienstQuery = `*[_type == "dienst" && categorie == $categorie && slug == $slug][0]{
  intro, tekst, voordelen, werkwijze[]{titel, tekst}, vragen[]{vraag, antwoord}, garantie,
  ${fotosProjectie}
}`;

export const projectenQuery = `*[_type == "project" && defined(slug.current)] | order(datum desc, _createdAt desc){
  titel, "slug": slug.current, klant, plaats, datum, samenvatting, uitgelicht,
  "diensten": diensten[]->{categorie, slug},
  ${fotosProjectie}
}`;

export function maakContentBron(
  ophalen: SanityOphalen | null,
  waarschuw: (bericht: string) => void = console.warn,
) {
  return {
    /** Teksten voor een categorie; undefined als de categorie niet bestaat. */
    async categorieTekst(slug: string): Promise<CategorieTekst | undefined> {
      if (!getCategorie(slug)) return undefined;
      const terugval: CategorieTekst = { tekst: [] };
      if (!ophalen) return terugval;

      const ruw = await ophalen(categorieQuery, { slug });
      if (ruw == null) return terugval;
      const resultaat = categorieDocSchema.safeParse(ruw);
      if (!resultaat.success) {
        waarschuw(
          `Sanity: categorie "${slug}" is onleesbaar, vaste tekst gebruikt.`,
        );
        return terugval;
      }
      return resultaat.data;
    },

    /** Teksten voor een dienst; undefined als de combinatie niet bestaat. */
    async dienstTekst(
      categorie: string,
      slug: string,
    ): Promise<DienstTekst | undefined> {
      const dienst = getDienst(categorie, slug);
      if (!dienst) return undefined;
      const terugval: DienstTekst = {
        intro: dienst.omschrijving,
        tekst: [],
        voordelen: [],
        werkwijze: [],
        vragen: [],
        fotos: [],
      };
      if (!ophalen) return terugval;

      const ruw = await ophalen(dienstQuery, { categorie, slug });
      if (ruw == null) return terugval;
      const resultaat = dienstDocSchema.safeParse(ruw);
      if (!resultaat.success) {
        waarschuw(
          `Sanity: dienst "${categorie}/${slug}" is onleesbaar, vaste tekst gebruikt.`,
        );
        return terugval;
      }
      const { intro, garantie, ...rest } = resultaat.data;
      return {
        ...rest,
        intro: intro ?? dienst.omschrijving,
        ...(garantie ? { garantie } : {}),
      };
    },

    /** Alle gepubliceerde projecten, nieuwste eerst. Onleesbare worden overgeslagen. */
    async projecten(): Promise<ProjectKaart[]> {
      if (!ophalen) return [];
      const ruw = await ophalen(projectenQuery, {});
      if (!Array.isArray(ruw)) return [];

      const projecten: ProjectKaart[] = [];
      for (const item of ruw) {
        const resultaat = projectDocSchema.safeParse(item);
        if (!resultaat.success) {
          waarschuw("Sanity: een project is onleesbaar en wordt overgeslagen.");
          continue;
        }
        const { diensten, klant, plaats, datum, ...rest } = resultaat.data;
        projecten.push({
          ...rest,
          ...(klant ? { klant } : {}),
          ...(plaats ? { plaats } : {}),
          ...(datum ? { datum } : {}),
          diensten: diensten.flatMap((ref) => {
            if (!ref?.categorie || !ref.slug) return [];
            const dienst = getDienst(ref.categorie, ref.slug);
            return dienst
              ? [
                  {
                    categorie: ref.categorie,
                    slug: dienst.slug,
                    naam: dienst.naam,
                  },
                ]
              : [];
          }),
        });
      }
      return projecten;
    },
  };
}
