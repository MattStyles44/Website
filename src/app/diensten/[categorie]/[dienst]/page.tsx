import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLdScript } from "@/components/json-ld";
import { OfferteCta } from "@/components/offerte-cta";
import { Intro, PaginaKop, SectieKop } from "@/components/pagina-kop";
import {
  BerichtPictogram,
  PijlPictogram,
  PlusPictogram,
  VinkPictogram,
} from "@/components/pictogrammen";
import { UitgelichteProjecten } from "@/components/project";
import { RijkeTekst } from "@/components/rijke-tekst";
import { Fotogalerij } from "@/components/sanity-foto";
import { Kaart, Knop, Sectie } from "@/components/ui";
import { alleDiensten, getCategorie, getDienst } from "@/content/diensten";
import { offerteKnop } from "@/content/navigatie";
import {
  categoriePad,
  dienstMetadata,
  dienstPad,
  paginas,
} from "@/content/paginas";
import { site } from "@/content/site";
import { env } from "@/env";
import { haalDienstTekst, haalProjecten } from "@/lib/cms";
import { projectenMetDienst } from "@/lib/projecten";
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

type Toon = "wit" | "vlak";

/** De andere lichte toon, zodat witte en lichtblauwe vlakken elkaar afwisselen. */
function wissel(toon: Toon): Toon {
  return toon === "wit" ? "vlak" : "wit";
}

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

  const recentWerk = projectenMetDienst(
    await haalProjecten(),
    categorie.slug,
    dienst.slug,
  );

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
  const offerteHref = `${offerteKnop.href}?${new URLSearchParams({
    categorie: categorie.slug,
    dienst: dienst.slug,
  })}`;

  const heeftInhoud =
    tekst.fotos.length > 0 ||
    tekst.tekst.length > 0 ||
    tekst.voordelen.length > 0 ||
    tekst.werkwijze.length > 0 ||
    Boolean(tekst.garantie) ||
    tekst.vragen.length > 0;

  // Na de paginakop wisselen wit en lichtblauw elkaar af, beginnend met wit,
  // welke secties er ook zijn: inhoud, recent werk en andere diensten.
  const toonProjecten: Toon = heeftInhoud ? "vlak" : "wit";
  const toonMeer: Toon =
    recentWerk.length > 0 ? wissel(toonProjecten) : toonProjecten;

  return (
    <>
      <JsonLdScript data={gegevens} />
      <PaginaKop titel={dienst.naam} kruimels={kruimels}>
        <Intro>{tekst.intro}</Intro>
        <p className="max-w-[60ch]">
          Maatwerk: je krijgt vooraf een vrijblijvende offerte op maat.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Knop href={offerteHref} className="w-full sm:w-auto">
            {offerteKnop.label}
          </Knop>
          <Knop
            href={site.whatsapp}
            variant="secundair"
            className="w-full sm:w-auto"
          >
            <BerichtPictogram />
            Stuur een WhatsApp
          </Knop>
        </div>
      </PaginaKop>

      {heeftInhoud ? (
        <Sectie>
          <div className="flex flex-col gap-20 lg:gap-28">
            {tekst.fotos.length > 0 ? (
              <section
                aria-labelledby="fotos-kop"
                className="flex flex-col gap-8"
              >
                <SectieKop id="fotos-kop" titel="Foto's" />
                <Fotogalerij fotos={tekst.fotos} />
              </section>
            ) : null}

            {tekst.tekst.length > 0 ? (
              <div className="max-w-3xl">
                <RijkeTekst value={tekst.tekst} />
              </div>
            ) : null}

            {tekst.voordelen.length > 0 ? (
              <section
                aria-labelledby="voordelen-kop"
                className="flex flex-col gap-8"
              >
                <SectieKop id="voordelen-kop" titel="Waarom SignUp" />
                <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                  {tekst.voordelen.map((voordeel) => (
                    <li key={voordeel} className="flex items-start gap-4">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-blauw text-wit">
                        <VinkPictogram />
                      </span>
                      <span className="pt-1 text-lg">{voordeel}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {tekst.werkwijze.length > 0 ? (
              <section
                aria-labelledby="werkwijze-kop"
                className="flex flex-col gap-8"
              >
                <SectieKop id="werkwijze-kop" titel="Zo werken we" />
                <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tekst.werkwijze.map((stap, index) => (
                    <li
                      key={stap.titel}
                      className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 rounded-kaart bg-vlak p-5 sm:flex sm:flex-col sm:items-start sm:gap-3 sm:p-8"
                    >
                      <span
                        aria-hidden="true"
                        className="font-display text-4xl leading-none font-bold text-blauw sm:text-5xl"
                      >
                        {index + 1}
                      </span>
                      <h3 className="text-2xl leading-kop">{stap.titel}</h3>
                      <p className="col-span-2">{stap.tekst}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {tekst.garantie ? (
              <section
                aria-labelledby="garantie-kop"
                className="grid gap-6 rounded-kaart border-2 border-vlak p-6 sm:p-10 lg:grid-cols-12 lg:gap-8"
              >
                <h2
                  id="garantie-kop"
                  className="text-3xl leading-kop tracking-tight sm:text-4xl lg:col-span-4"
                >
                  Garantie
                </h2>
                <p className="max-w-[65ch] text-intro lg:col-span-8">
                  {tekst.garantie}
                </p>
              </section>
            ) : null}

            {tekst.vragen.length > 0 ? (
              <section
                aria-labelledby="vragen-kop"
                className="grid gap-8 lg:grid-cols-12"
              >
                <h2
                  id="vragen-kop"
                  className="text-3xl leading-kop tracking-tight sm:text-4xl lg:col-span-4 lg:text-5xl"
                >
                  Veelgestelde vragen
                </h2>
                <div className="flex flex-col border-t-2 border-vlak lg:col-span-8">
                  {tekst.vragen.map((item) => (
                    <details
                      key={item.vraag}
                      className="group border-b-2 border-vlak"
                    >
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-xl leading-kop font-bold hover:text-blauw [&::-webkit-details-marker]:hidden">
                        {item.vraag}
                        <PlusPictogram className="size-6 text-blauw transition-transform duration-150 ease-out group-open:rotate-45 motion-reduce:transition-none" />
                      </summary>
                      <p className="max-w-[65ch] pb-6">{item.antwoord}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </Sectie>
      ) : null}

      {recentWerk.length > 0 ? (
        <Sectie toon={toonProjecten} aria-labelledby="projecten-kop">
          <SectieKop
            id="projecten-kop"
            titel="Recent werk"
            actie={
              <Knop href={paginas.projecten.pad} variant="tekst">
                Alle projecten
                <PijlPictogram />
              </Knop>
            }
          />
          <UitgelichteProjecten projecten={recentWerk} />
        </Sectie>
      ) : null}

      {andereDiensten.length > 0 ? (
        <Sectie toon={toonMeer} aria-labelledby="meer-kop">
          <SectieKop
            id="meer-kop"
            titel="Andere diensten in deze categorie"
            actie={
              <Knop href={categoriePad(categorie.slug)} variant="tekst">
                {categorie.naam}
                <PijlPictogram />
              </Knop>
            }
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {andereDiensten.map((andere) => (
              <li key={andere.slug}>
                <Kaart
                  titel={andere.naam}
                  href={dienstPad(categorie.slug, andere.slug)}
                >
                  <p>{andere.omschrijving}</p>
                </Kaart>
              </li>
            ))}
          </ul>
        </Sectie>
      ) : null}

      <OfferteCta categorie={categorie.slug} dienst={dienst.slug} />
    </>
  );
}
