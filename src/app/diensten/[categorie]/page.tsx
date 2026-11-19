import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLdScript } from "@/components/json-ld";
import { OfferteCta } from "@/components/offerte-cta";
import { Intro, PaginaKop, SectieKop } from "@/components/pagina-kop";
import { RijkeTekst } from "@/components/rijke-tekst";
import { Kaart, Knop, Sectie } from "@/components/ui";
import { categorieen, getCategorie } from "@/content/diensten";
import { offerteKnop } from "@/content/navigatie";
import {
  categorieMetadata,
  categoriePad,
  dienstPad,
  paginas,
} from "@/content/paginas";
import { env } from "@/env";
import { haalCategorieTekst } from "@/lib/cms";
import { kruimelpadJsonLd } from "@/lib/seo/json-ld";

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

  const kruimels = [
    { label: "Home", href: "/" },
    { label: paginas.diensten.titel, href: paginas.diensten.pad },
    { label: categorie.naam },
  ];
  const offerteHref = `${offerteKnop.href}?${new URLSearchParams({ categorie: categorie.slug })}`;

  return (
    <>
      <JsonLdScript
        data={kruimelpadJsonLd(
          kruimels,
          categoriePad(categorie.slug),
          env.APP_URL,
        )}
      />
      <PaginaKop titel={categorie.naam} kruimels={kruimels}>
        {tekst.intro ? <Intro>{tekst.intro}</Intro> : null}
        <p className="max-w-[60ch]">
          Alles op maat, met een vrijblijvende offerte vooraf.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Knop href={offerteHref} className="w-full sm:w-auto">
            {offerteKnop.label}
          </Knop>
        </div>
      </PaginaKop>

      <Sectie>
        {tekst.tekst.length > 0 ? (
          <div className="max-w-3xl">
            <RijkeTekst value={tekst.tekst} />
          </div>
        ) : null}
        <SectieKop id="diensten-kop" titel="Kies een dienst" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorie.diensten.map((dienst) => (
            <li key={dienst.slug}>
              <Kaart
                titel={dienst.naam}
                href={dienstPad(categorie.slug, dienst.slug)}
              >
                <p>{dienst.omschrijving}</p>
              </Kaart>
            </li>
          ))}
        </ul>
      </Sectie>

      <OfferteCta categorie={categorie.slug} />
    </>
  );
}
