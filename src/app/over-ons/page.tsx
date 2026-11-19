import type { Metadata } from "next";

import { OfferteCta } from "@/components/offerte-cta";
import { Accent, Intro, PaginaKop, SectieKop } from "@/components/pagina-kop";
import { Sectie, Sticker } from "@/components/ui";
import { paginaMetadata, paginas } from "@/content/paginas";
import { onderscheidend, site } from "@/content/site";

export const metadata: Metadata = paginaMetadata(paginas.overOns);

export default function OverOnsPage() {
  return (
    <>
      <PaginaKop
        titel={paginas.overOns.titel}
        naast={<Sticker>{site.ervaring} vakmanschap</Sticker>}
      >
        <Intro>
          {site.naam} is al {site.ervaring} een bekende naam in signing en
          visuele communicatie in Groningen. We zijn een klein en wendbaar
          bedrijf: de eigenaar en een compagnon, samen met gespecialiseerde
          partners.
        </Intro>
      </PaginaKop>

      <Sectie aria-labelledby="waarom-kop">
        <SectieKop id="waarom-kop" titel={`Waarom ${site.naam}`} />
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

      <Sectie toon="vlak" aria-labelledby="werk-kop">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <h2
            id="werk-kop"
            className="text-3xl leading-kop tracking-tight sm:text-4xl lg:col-span-4 lg:text-5xl"
          >
            Hoe we werken
          </h2>
          <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
            <div className="flex flex-col gap-2">
              <dt className="font-display text-xl font-bold">Materialen</dt>
              <dd>
                Uitsluitend A-merk gietfolies:{" "}
                {site.materialen.slice(0, -1).join(", ")} en{" "}
                {site.materialen.at(-1)}.
              </dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="font-display text-xl font-bold">Contact</dt>
              <dd>
                Je spreekt direct met de vakman zelf. {site.reactiebelofte}.
              </dd>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <dt className="font-display text-xl font-bold">Werkgebied</dt>
              <dd>{site.regio}</dd>
            </div>
          </dl>
        </div>
      </Sectie>

      <OfferteCta />
    </>
  );
}
