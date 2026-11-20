import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLdScript } from "@/components/json-ld";
import { OfferteCta } from "@/components/offerte-cta";
import { Accent, SectieKop } from "@/components/pagina-kop";
import { PijlPictogram, VinkPictogram } from "@/components/pictogrammen";
import { UitgelichteProjecten } from "@/components/project";
import { Stappenplan } from "@/components/stappenplan";
import { Kaart, Knop, Sectie, Sticker } from "@/components/ui";
import { VragenLijst } from "@/components/vragen-lijst";
import { categorieen } from "@/content/diensten";
import {
  homeIntro,
  homeKop,
  homeSecties,
  homeVragen,
  stappen,
  teamfoto,
  veelgevraagdeDiensten,
  vertrouwenspunten,
  wagenparkTekst,
} from "@/content/home";
import { offerteKnop } from "@/content/navigatie";
import {
  categoriePad,
  categorieSamenvatting,
  paginaMetadata,
  paginas,
} from "@/content/paginas";
import { onderscheidend, site } from "@/content/site";
import { haalProjecten } from "@/lib/cms";
import { veelgesteldeVragenJsonLd } from "@/lib/seo/json-ld";
import { metHoofdletter } from "@/lib/weergave";

export const metadata: Metadata = paginaMetadata(paginas.home);

/** Hoeveel uitgelichte projecten de homepage toont. */
const maxUitgelicht = 3;

type Toon = "wit" | "vlak";

/** De andere lichte toon, zodat witte en lichtblauwe vlakken elkaar afwisselen. */
function wissel(toon: Toon): Toon {
  return toon === "wit" ? "vlak" : "wit";
}

const dienstLink =
  "inline-flex min-h-11 items-center gap-2 font-semibold text-blauw underline decoration-2 underline-offset-4 hover:text-navy";

export default async function Home() {
  const projecten = await haalProjecten();
  const uitgelicht = projecten
    .filter((project) => project.uitgelicht)
    .slice(0, maxUitgelicht);

  // Na "Voor wagenparken" (wit) komen de projecten (vlak), als die er zijn.
  // De secties daarna wisselen door, ook als de projecten ontbreken.
  const toonWaarom: Toon = uitgelicht.length > 0 ? "wit" : "vlak";
  const toonWerkwijze = wissel(toonWaarom);
  const toonVragen = wissel(toonWerkwijze);

  const vragenJsonLd = veelgesteldeVragenJsonLd(homeVragen);

  return (
    <>
      {vragenJsonLd ? <JsonLdScript data={vragenJsonLd} /> : null}

      <Sectie aria-labelledby="home-kop">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="flex min-w-0 flex-col gap-8 lg:col-span-7">
            <h1
              id="home-kop"
              className="text-5xl leading-display tracking-tight hyphens-auto sm:text-6xl sm:hyphens-manual lg:text-display"
            >
              {homeKop}
            </h1>
            <p className="max-w-[52ch] text-intro">{homeIntro}</p>
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
            <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {vertrouwenspunten.map((punt) => (
                <li key={punt} className="flex items-start gap-3">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-blauw text-wit">
                    <VinkPictogram className="size-4" />
                  </span>
                  <span className="font-semibold">{punt}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative pt-6 lg:col-span-5 lg:pt-0">
            <Image
              src={teamfoto.src}
              alt={teamfoto.alt}
              width={1200}
              height={1120}
              sizes="(min-width: 1024px) 40vw, 100vw"
              preload
              className="h-auto w-full rounded-kaart bg-vlak"
            />
            <div className="absolute top-0 right-3 sm:right-8 lg:-top-10 lg:-right-4">
              <Sticker>{site.ervaring} vakmanschap</Sticker>
            </div>
          </div>
        </div>
      </Sectie>

      <Sectie toon="vlak" aria-labelledby="diensten-kop">
        <SectieKop
          id="diensten-kop"
          titel={homeSecties.diensten}
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

      <Sectie aria-labelledby="wagenpark-kop">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="flex min-w-0 flex-col gap-8 lg:col-span-7">
            <SectieKop id="wagenpark-kop" titel={homeSecties.wagenpark}>
              <p>{wagenparkTekst}</p>
            </SectieKop>
            <div>
              <Knop
                href={offerteKnop.href}
                variant="secundair"
                className="w-full sm:w-auto"
              >
                {offerteKnop.label}
              </Knop>
            </div>
          </div>
          <ul className="flex flex-col border-b-2 border-vlak lg:col-span-5">
            {veelgevraagdeDiensten.map((dienst) => (
              <li key={dienst.href} className="border-t-2 border-vlak py-3">
                <Link href={dienst.href} className={dienstLink}>
                  {dienst.naam}
                  <PijlPictogram className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Sectie>

      {uitgelicht.length > 0 ? (
        <Sectie toon="vlak" aria-labelledby="projecten-kop">
          <SectieKop
            id="projecten-kop"
            titel={homeSecties.projecten}
            actie={
              <Knop href={paginas.projecten.pad} variant="secundair">
                Alle projecten
              </Knop>
            }
          />
          <UitgelichteProjecten projecten={uitgelicht} />
        </Sectie>
      ) : null}

      <Sectie toon={toonWaarom} aria-labelledby="waarom-kop">
        <SectieKop
          id="waarom-kop"
          titel={homeSecties.waarom}
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

      <Sectie toon={toonWerkwijze} aria-labelledby="werkwijze-kop">
        <SectieKop id="werkwijze-kop" titel={homeSecties.werkwijze} />
        <Stappenplan stappen={stappen} toon={toonWerkwijze} />
      </Sectie>

      <Sectie toon={toonVragen} aria-labelledby="vragen-kop">
        <SectieKop id="vragen-kop" titel={homeSecties.vragen} />
        <VragenLijst vragen={homeVragen} toon={toonVragen} />
      </Sectie>

      <OfferteCta />
    </>
  );
}
