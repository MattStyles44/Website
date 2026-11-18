import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { Kruimelpad } from "@/components/kruimelpad";
import { OfferteCta } from "@/components/offerte-cta";
import { RijkeTekst } from "@/components/rijke-tekst";
import { categorieen, getCategorie } from "@/content/diensten";
import { categorieMetadata, dienstPad, paginas } from "@/content/paginas";
import { haalCategorieTekst } from "@/lib/cms";

interface CategoriePageProps {
  params: Promise<{ categorie: string }>;
}

// Alle categorieën zijn vooraf bekend en worden vooraf gebouwd, dus de route
// mag blokkeren (params worden niet binnen <Suspense> gelezen).
// Onbekende slug: Cache Components serveert bij het eerste bezoek het
// basisgeraamte (status 200 met noindex en de 404-pagina), daarna een echte 404.
export const instant = false;

export function generateStaticParams() {
  return categorieen.map((categorie) => ({ categorie: categorie.slug }));
}

export async function generateMetadata({
  params,
}: CategoriePageProps): Promise<Metadata> {
  const { categorie } = await params;
  return categorieMetadata(categorie);
}

export default async function CategoriePage({ params }: CategoriePageProps) {
  const { categorie: slug } = await params;
  const categorie = getCategorie(slug);
  if (!categorie) notFound();

  const tekst = await haalCategorieTekst(categorie.slug);
  if (!tekst) notFound();

  return (
    <Container>
      <Kruimelpad
        items={[
          { label: "Home", href: "/" },
          { label: paginas.diensten.titel, href: paginas.diensten.pad },
          { label: categorie.naam },
        ]}
      />

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{categorie.naam}</h1>
        {tekst.intro && <p>{tekst.intro}</p>}
        <p>Alles op maat, met een vrijblijvende offerte vooraf.</p>
      </header>

      <RijkeTekst value={tekst.tekst} />

      <ul className="flex flex-col gap-4">
        {categorie.diensten.map((dienst) => (
          <li key={dienst.slug}>
            <h2 className="text-xl font-semibold">
              <Link
                href={dienstPad(categorie.slug, dienst.slug)}
                className="underline"
              >
                {dienst.naam}
              </Link>
            </h2>
            <p>{dienst.omschrijving}</p>
          </li>
        ))}
      </ul>

      <OfferteCta categorie={categorie.slug} />
    </Container>
  );
}
