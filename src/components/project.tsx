import Link from "next/link";

import { SanityFoto } from "@/components/sanity-foto";
import { dienstPad } from "@/content/paginas";
import type { Foto, ProjectKaart } from "@/lib/cms";
import { cn } from "@/lib/utils";
import { maandEnJaar } from "@/lib/weergave";

/** Plaats en maand van een project, zoals "Groningen · oktober 2026". */
function ProjectGegevens({ project }: { project: ProjectKaart }) {
  const { plaats, datum } = project;
  if (!plaats && !datum) return null;
  const maand = datum ? maandEnJaar(datum) : "";
  return (
    <p className="font-semibold text-inkt-zacht">
      {plaats}
      {plaats && maand ? <span aria-hidden="true"> · </span> : null}
      {plaats && maand ? <span className="sr-only">, </span> : null}
      {maand ? <time dateTime={datum}>{maand}</time> : null}
    </p>
  );
}

/**
 * De uitgelichte projecten op de homepage: het eerste groot, de rest ernaast.
 * Elk project met zijn eerste foto (als die er is), titel, plaats en samenvatting.
 */
export function UitgelichteProjecten({
  projecten,
}: {
  projecten: readonly ProjectKaart[];
}) {
  const alleen = projecten.length === 1;
  return (
    <ul className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
      {projecten.map((project, index) => {
        const groot = index === 0;
        const foto = project.fotos[0];
        return (
          <li
            key={project.slug}
            className={cn(
              alleen
                ? "lg:col-span-12"
                : groot
                  ? "lg:col-span-7 lg:row-span-2"
                  : "lg:col-span-5",
            )}
          >
            <article
              className={cn(
                "flex flex-col gap-5",
                alleen && "lg:grid lg:grid-cols-12 lg:items-center lg:gap-8",
              )}
            >
              {foto ? (
                <SanityFoto
                  foto={foto}
                  sizes={
                    groot
                      ? "(min-width: 72rem) 636px, (min-width: 64rem) 58vw, 100vw"
                      : "(min-width: 72rem) 452px, (min-width: 64rem) 40vw, 100vw"
                  }
                  className={cn(
                    "rounded-kaart object-cover",
                    groot ? "aspect-[4/3]" : "aspect-[3/2]",
                    alleen && "lg:col-span-7",
                  )}
                />
              ) : null}
              <div
                className={cn(
                  "flex flex-col gap-3",
                  alleen && foto && "lg:col-span-5",
                  alleen && !foto && "lg:col-span-8",
                )}
              >
                <h3
                  className={cn(
                    "leading-kop",
                    groot ? "text-3xl sm:text-4xl" : "text-2xl",
                  )}
                >
                  {project.titel}
                </h3>
                <ProjectGegevens project={project} />
                <p className="max-w-[60ch]">{project.samenvatting}</p>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Eén helft van een voor-en-na-paar: de foto met een label erop. Beide foto's
 * krijgen de verhouding van de foto vooraf, zodat die nooit wordt bijgesneden
 * en het paar gelijk loopt.
 */
function VoorNaFoto({
  foto,
  label,
  verhouding,
  sizes,
}: {
  foto: Foto;
  label: string;
  verhouding: Foto;
  sizes: string;
}) {
  return (
    <figure className="relative">
      <SanityFoto
        foto={foto}
        sizes={sizes}
        className="rounded-kaart object-cover"
        style={{ aspectRatio: `${verhouding.breedte} / ${verhouding.hoogte}` }}
      />
      <figcaption className="absolute top-3 left-3 rounded-full bg-wit px-3 py-1 text-sm leading-tight font-bold text-navy">
        {label}
      </figcaption>
    </figure>
  );
}

/**
 * Een project op /projecten: alle foto's als collage, titel, plaats en maand,
 * samenvatting en links naar de diensten. `groot` laat het over de volle
 * breedte lopen. Met een foto vooraf staat die als Voor naast de eerste foto
 * (Na); de overige foto's staan eronder.
 */
export function ProjectBlok({
  project,
  groot = false,
}: {
  project: ProjectKaart;
  groot?: boolean;
}) {
  const [eerste, ...overige] = project.fotos;
  // Een foto vooraf alleen met een resultaat ernaast.
  const voor = eerste ? project.voorFoto : undefined;
  const paarSizes = groot
    ? "(min-width: 72rem) 360px, (min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
    : "(min-width: 72rem) 264px, (min-width: 48rem) 25vw, (min-width: 40rem) 50vw, 100vw";
  return (
    <article
      className={cn(
        "flex flex-col gap-6",
        groot && "lg:grid lg:grid-cols-12 lg:items-start lg:gap-8",
      )}
    >
      {eerste ? (
        <div className={cn("flex flex-col gap-3", groot && "lg:col-span-8")}>
          {voor ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <VoorNaFoto
                foto={voor}
                label="Voor"
                verhouding={voor}
                sizes={paarSizes}
              />
              <VoorNaFoto
                foto={eerste}
                label="Na"
                verhouding={voor}
                sizes={paarSizes}
              />
            </div>
          ) : (
            <SanityFoto
              foto={eerste}
              sizes={
                groot
                  ? "(min-width: 72rem) 720px, (min-width: 64rem) 66vw, 100vw"
                  : "(min-width: 72rem) 528px, (min-width: 48rem) 50vw, 100vw"
              }
              className={cn(
                "rounded-kaart object-cover",
                groot ? "aspect-[3/2]" : "aspect-[4/3]",
              )}
            />
          )}
          {overige.length > 0 ? (
            <ul className="grid grid-cols-3 gap-3">
              {overige.map((foto, index) => (
                <li key={`${index}-${foto.url}`}>
                  <SanityFoto
                    foto={foto}
                    sizes="(min-width: 72rem) 240px, (min-width: 48rem) 16vw, 33vw"
                    className="aspect-square rounded-veld object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div
        className={cn(
          "flex flex-col gap-3",
          groot && (eerste ? "lg:col-span-4" : "lg:col-span-8"),
        )}
      >
        <h2 className="text-3xl leading-kop tracking-tight">{project.titel}</h2>
        <ProjectGegevens project={project} />
        <p className="max-w-[60ch]">{project.samenvatting}</p>
        {project.diensten.length > 0 ? (
          <ul aria-label="Diensten" className="flex flex-wrap gap-2 pt-1">
            {project.diensten.map((dienst) => (
              <li key={`${dienst.categorie}/${dienst.slug}`}>
                <Link
                  href={dienstPad(dienst.categorie, dienst.slug)}
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-vlak px-4 text-sm font-semibold text-blauw underline decoration-1 underline-offset-4 transition-colors duration-150 ease-out hover:border-blauw hover:decoration-2 motion-reduce:transition-none"
                >
                  {dienst.naam}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
