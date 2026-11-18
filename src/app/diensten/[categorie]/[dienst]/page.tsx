import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { JsonLdScript } from "@/components/json-ld";
import { Kruimelpad } from "@/components/kruimelpad";
import { OfferteCta } from "@/components/offerte-cta";
import { RijkeTekst } from "@/components/rijke-tekst";
import { alleDiensten, getCategorie, getDienst } from "@/content/diensten";
import {
  categoriePad,
  dienstMetadata,
  dienstPad,
  paginas,
} from "@/content/paginas";
import { env } from "@/env";
import { haalDienstTekst } from "@/lib/cms";
import {
  dienstJsonLd,
  kruimelpadJsonLd,
  veelgesteldeVragenJsonLd,
  type JsonLd,
} from "@/lib/seo/json-ld";

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

  const tekst = await haalDienstTekst(categorie.slug, dienst.slug);
  if (!tekst) notFound();

  const andereDiensten = categorie.diensten.filter(
    (andere) => andere.slug !== dienst.slug,
  );

  const pad = dienstPad(categorie.slug, dienst.slug);
  const kruimels = [
    { label: "Home", href: "/" },
    { label: paginas.diensten.titel, href: paginas.diensten.pad },
    { label: categorie.naam, href: categoriePad(categorie.slug) },
    { label: dienst.naam },
  ];
  const vragen = veelgesteldeVragenJsonLd(tekst.vragen);
  const gegevens: JsonLd[] = [
    dienstJsonLd(categorie, dienst, tekst.intro, pad, env.APP_URL),
    kruimelpadJsonLd(kruimels, pad, env.APP_URL),
    ...(vragen ? [vragen] : []),
  ];

  return (
    <Container>
      <JsonLdScript data={gegevens} />
      <Kruimelpad items={kruimels} />

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{dienst.naam}</h1>
        <p>{tekst.intro}</p>
        <p>Maatwerk: je krijgt vooraf een vrijblijvende offerte op maat.</p>
      </header>

      <RijkeTekst value={tekst.tekst} />

      {tekst.voordelen.length > 0 && (
        <section
          aria-labelledby="voordelen-kop"
          className="flex flex-col gap-2"
        >
          <h2 id="voordelen-kop" className="text-xl font-semibold">
            Waarom SignUp
          </h2>
          <ul className="list-disc pl-6">
            {tekst.voordelen.map((voordeel) => (
              <li key={voordeel}>{voordeel}</li>
            ))}
          </ul>
        </section>
      )}

      {tekst.werkwijze.length > 0 && (
        <section
          aria-labelledby="werkwijze-kop"
          className="flex flex-col gap-2"
        >
          <h2 id="werkwijze-kop" className="text-xl font-semibold">
            Zo werken we
          </h2>
          <ol className="flex list-decimal flex-col gap-2 pl-6">
            {tekst.werkwijze.map((stap) => (
              <li key={stap.titel}>
                <strong>{stap.titel}</strong>: {stap.tekst}
              </li>
            ))}
          </ol>
        </section>
      )}

      {tekst.garantie && (
        <section aria-labelledby="garantie-kop" className="flex flex-col gap-2">
          <h2 id="garantie-kop" className="text-xl font-semibold">
            Garantie
          </h2>
          <p>{tekst.garantie}</p>
        </section>
      )}

      {tekst.vragen.length > 0 && (
        <section aria-labelledby="vragen-kop" className="flex flex-col gap-2">
          <h2 id="vragen-kop" className="text-xl font-semibold">
            Veelgestelde vragen
          </h2>
          <dl className="flex flex-col gap-3">
            {tekst.vragen.map((item) => (
              <div key={item.vraag}>
                <dt className="font-semibold">{item.vraag}</dt>
                <dd>{item.antwoord}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

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
