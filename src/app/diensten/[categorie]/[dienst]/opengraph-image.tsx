import { alleDiensten, getCategorie, getDienst } from "@/content/diensten";
import { site } from "@/content/site";
import {
  deelafbeeldingFormaat,
  maakDeelafbeelding,
} from "@/lib/seo/deelafbeelding";

export const alt = `${site.naam}: dienst op maat in Groningen`;
export const size = deelafbeeldingFormaat;
export const contentType = "image/png";

/** Vooraf bouwen, net als de dienstpagina's zelf. */
export function generateStaticParams() {
  return alleDiensten().map(({ categorie, dienst }) => ({
    categorie: categorie.slug,
    dienst: dienst.slug,
  }));
}

export default async function Deelafbeelding({
  params,
}: {
  params: Promise<{ categorie: string; dienst: string }>;
}) {
  const { categorie: categorieSlug, dienst: dienstSlug } = await params;
  const categorie = getCategorie(categorieSlug);
  const dienst = getDienst(categorieSlug, dienstSlug);
  return maakDeelafbeelding({
    titel: dienst?.naam ?? site.slogan,
    ...(categorie ? { ondertitel: categorie.naam } : {}),
  });
}
