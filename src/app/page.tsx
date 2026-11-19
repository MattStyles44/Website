import type { Metadata } from "next";

import { Kleurvlakken } from "@/components/kleurvlakken";
import { OfferteCta } from "@/components/offerte-cta";
import { Accent, SectieKop } from "@/components/pagina-kop";
import { PijlPictogram } from "@/components/pictogrammen";
import { UitgelichteProjecten } from "@/components/project";
import { Kaart, Knop, Sectie, Sticker } from "@/components/ui";
import { categorieen } from "@/content/diensten";
import { offerteKnop } from "@/content/navigatie";
import {
  categoriePad,
  categorieSamenvatting,
  paginaMetadata,
  paginas,
} from "@/content/paginas";
import { onderscheidend, site } from "@/content/site";
import { haalProjecten } from "@/lib/cms";
import { metHoofdletter } from "@/lib/weergave";

export const metadata: Metadata = paginaMetadata(paginas.home);

/** Hoeveel uitgelichte projecten de homepage toont. */
const maxUitgelicht = 3;

export default async function Home() {
  const projecten = await haalProjecten();
  const uitgelicht = projecten
    .filter((project) => project.uitgelicht)
    .slice(0, maxUitgelicht);

  return (
    <>
      <Sectie aria-labelledby="home-kop">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="flex min-w-0 flex-col gap-8 lg:col-span-7">
            <h1
              id="home-kop"
              className="text-5xl leading-display tracking-tight hyphens-auto sm:text-6xl sm:hyphens-manual lg:text-display"
            >
              {site.slogan}
            </h1>
            <p className="max-w-[52ch] text-intro">
              Al {site.ervaring} je specialist in autobelettering, carwrapping,
              gevelreclame en interieur in {site.regio}.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Knop
                href={offerteKnop.href}
                grootte="groot"
                className="w-full sm:w-auto"
              >
                {offerteKnop.label}
              </Knop>
              <Knop
                href={paginas.projecten.pad}
                variant="secundair"
                grootte="groot"
                className="w-full sm:w-auto"
              >
                Bekijk projecten
              </Knop>
            </div>
          </div>
          <div className="relative pt-4 lg:col-span-5 lg:pt-0">
            <Kleurvlakken className="h-36 sm:h-80 lg:h-[30rem]" />
            <div className="absolute top-0 right-3 sm:right-8 lg:-top-10 lg:-right-4">
              <Sticker>{site.ervaring} vakmanschap</Sticker>
            </div>
          </div>
        </div>
      </Sectie>

      <Sectie toon="vlak" aria-labelledby="diensten-kop">
        <SectieKop
          id="diensten-kop"
          titel="Wat we maken"
          actie={
            <Knop href={paginas.diensten.pad} variant="tekst">
              Alle diensten
              <PijlPictogram />
            </Knop>
          }
        >
          <p>
            Alles maatwerk. Je krijgt altijd een vrijblijvende offerte op maat.
          </p>
        </SectieKop>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorieen.map((categorie) => (
            <li key={categorie.slug}>
              <Kaart titel={categorie.naam} href={categoriePad(categorie.slug)}>
                <p>{metHoofdletter(categorieSamenvatting(categorie))}.</p>
              </Kaart>
            </li>
          ))}
        </ul>
      </Sectie>

      {uitgelicht.length > 0 ? (
        <Sectie aria-labelledby="projecten-kop">
          <SectieKop
            id="projecten-kop"
            titel="Projecten"
            actie={
              <Knop href={paginas.projecten.pad} variant="secundair">
                Alle projecten
              </Knop>
            }
          />
          <UitgelichteProjecten projecten={uitgelicht} />
        </Sectie>
      ) : null}

      <Sectie
        toon={uitgelicht.length > 0 ? "vlak" : "wit"}
        aria-labelledby="waarom-kop"
      >
        <SectieKop
          id="waarom-kop"
          titel={`Waarom ${site.naam}`}
          actie={
            <Knop href={paginas.overOns.pad} variant="tekst">
              Over ons
              <PijlPictogram />
            </Knop>
          }
        />
        <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
          {onderscheidend.map((punt) => (
            <li key={punt.titel} className="flex flex-col gap-4">
              <Accent />
              <h3 className="text-2xl leading-kop text-pretty">{punt.titel}</h3>
              <p className="max-w-[45ch]">{punt.tekst}</p>
            </li>
          ))}
        </ul>
      </Sectie>

      <OfferteCta />
    </>
  );
}
