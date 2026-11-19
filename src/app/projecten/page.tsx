import type { Metadata } from "next";

import { Kleurvlakken } from "@/components/kleurvlakken";
import { OfferteCta } from "@/components/offerte-cta";
import { Intro, PaginaKop } from "@/components/pagina-kop";
import { ProjectBlok } from "@/components/project";
import { Knop, Sectie } from "@/components/ui";
import { offerteKnop } from "@/content/navigatie";
import { paginaMetadata, paginas } from "@/content/paginas";
import { haalProjecten } from "@/lib/cms";
import { cn } from "@/lib/utils";

export const metadata: Metadata = paginaMetadata(paginas.projecten);

// De projecten komen uit Sanity, nieuwste eerst (zie projectenQuery).
export default async function ProjectenPage() {
  const projecten = await haalProjecten();

  return (
    <>
      <PaginaKop titel={paginas.projecten.titel}>
        <Intro>{paginas.projecten.omschrijving}</Intro>
      </PaginaKop>

      {projecten.length === 0 ? (
        <Sectie aria-labelledby="leeg-kop">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
            <div className="flex flex-col gap-6 lg:col-span-6">
              <h2
                id="leeg-kop"
                className="text-3xl leading-kop tracking-tight sm:text-4xl lg:text-5xl"
              >
                Binnenkort te zien
              </h2>
              <p className="max-w-[50ch] text-intro">
                Hier komen binnenkort projecten met foto&apos;s van voor en na.
              </p>
              <p className="max-w-[50ch]">
                Benieuwd wat we voor jou kunnen maken? Bekijk de diensten, of
                vraag meteen een vrijblijvende offerte aan.
              </p>
              <div className="flex flex-wrap gap-3">
                <Knop href={offerteKnop.href}>{offerteKnop.label}</Knop>
                <Knop href={paginas.diensten.pad} variant="secundair">
                  Bekijk de diensten
                </Knop>
              </div>
            </div>
            <Kleurvlakken className="h-56 sm:h-72 lg:col-span-6 lg:h-96" />
          </div>
        </Sectie>
      ) : (
        <Sectie>
          <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:gap-y-24">
            {projecten.map((project, index) => (
              <li
                key={project.slug}
                className={cn(index === 0 && "md:col-span-2")}
              >
                <ProjectBlok project={project} groot={index === 0} />
              </li>
            ))}
          </ul>
        </Sectie>
      )}

      <OfferteCta />
    </>
  );
}
