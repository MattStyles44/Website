import { categorieen, getCategorie } from "@/content/diensten";
import { site } from "@/content/site";
import {
  deelafbeeldingFormaat,
  maakDeelafbeelding,
} from "@/lib/seo/deelafbeelding";

export const alt = `${site.naam}: dienst op maat in Groningen`;
export const size = deelafbeeldingFormaat;
export const contentType = "image/png";

/** Vooraf bouwen, net als de categoriepagina's zelf. */
export function generateStaticParams() {
  return categorieen.map((categorie) => ({ categorie: categorie.slug }));
}

export default async function Deelafbeelding({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie: slug } = await params;
  const categorie = getCategorie(slug);
  return maakDeelafbeelding({
    titel: categorie?.naam ?? site.slogan,
    ondertitel: "Op maat, met een vrijblijvende offerte",
  });
}
