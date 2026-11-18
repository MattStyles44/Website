import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { Kruimelpad } from "@/components/kruimelpad";
import { OfferteCta } from "@/components/offerte-cta";
import { alleDiensten, getCategorie, getDienst } from "@/content/diensten";
import {
  categoriePad,
  dienstMetadata,
  dienstPad,
  paginas,
} from "@/content/paginas";

interface DienstPageProps {
  params: Promise<{ categorie: string; dienst: string }>;
}

// Zie de toelichting bij de categoriepagina: vooraf gebouwd, mag blokkeren.
export const instant = false;

/** Alle combinaties van categorie en dienst (beide segmenten vanuit hier). */
export function generateStaticParams() {
  return alleDiensten().map(({ categorie, dienst }) => ({
    categorie: categorie.slug,
    dienst: dienst.slug,
  }));
}

export async function generateMetadata({
  params,
}: DienstPageProps): Promise<Metadata> {
  const { categorie, dienst } = await params;
  return dienstMetadata(categorie, dienst);
}

export default async function DienstPage({ params }: DienstPageProps) {
  const { categorie: categorieSlug, dienst: dienstSlug } = await params;
  const categorie = getCategorie(categorieSlug);
  const dienst = getDienst(categorieSlug, dienstSlug);
  if (!categorie || !dienst) notFound();

  const andereDiensten = categorie.diensten.filter(
    (andere) => andere.slug !== dienst.slug,
  );

  return (
    <Container>
      <Kruimelpad
        items={[
          { label: "Home", href: "/" },
          { label: paginas.diensten.titel, href: paginas.diensten.pad },
          { label: categorie.naam, href: categoriePad(categorie.slug) },
          { label: dienst.naam },
        ]}
      />

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{dienst.naam}</h1>
        <p>{dienst.omschrijving}</p>
        <p>Maatwerk: je krijgt vooraf een vrijblijvende offerte op maat.</p>
      </header>

      <OfferteCta categorie={categorie.slug} dienst={dienst.slug} />

      <section aria-labelledby="meer-kop" className="flex flex-col gap-2">
        <h2 id="meer-kop" className="text-xl font-semibold">
          Andere diensten in deze categorie
        </h2>
        <ul className="flex flex-col gap-1">
          {andereDiensten.map((andere) => (
            <li key={andere.slug}>
              <Link
                href={dienstPad(categorie.slug, andere.slug)}
                className="underline"
              >
                {andere.naam}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
