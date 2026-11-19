import type { Metadata } from "next";
import { Suspense } from "react";

import { OfferteFormulier } from "@/components/offerte/offerte-formulier";
import { Knop, Sectie } from "@/components/ui";
import { paginaMetadata, paginas } from "@/content/paginas";
import { site } from "@/content/site";

export const metadata: Metadata = paginaMetadata(paginas.offerte);

interface OffertePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const beloftes = [
  `${site.reactiebelofte}.`,
  "Je spreekt direct met de vakman zelf.",
  "Alles op maat, met een vrijblijvende offerte vooraf.",
] as const;

/** De eerste waarde van een zoekparameter: `?categorie=a&categorie=b` geeft `a`. */
function eersteWaarde(
  waarde: string | string[] | undefined,
): string | undefined {
  return Array.isArray(waarde) ? waarde[0] : waarde;
}

/**
 * Het formulier, ingevuld met de categorie en dienst uit de link (zoals
 * `/offerte?categorie=voertuigreclame&dienst=carwrapping`). De zoekparameters
 * zijn pas bij het verzoek bekend; daarom staat dit binnen een <Suspense>.
 */
async function IngevuldFormulier({ searchParams }: OffertePageProps) {
  const zoek = await searchParams;
  return (
    <OfferteFormulier
      categorie={eersteWaarde(zoek.categorie)}
      dienst={eersteWaarde(zoek.dienst)}
    />
  );
}

export default function OffertePage({ searchParams }: OffertePageProps) {
  return (
    <Sectie toon="vlak" aria-labelledby="offerte-titel">
      <header className="flex max-w-[65ch] flex-col gap-6">
        <h1
          id="offerte-titel"
          className="text-5xl leading-display tracking-tight sm:text-6xl lg:text-display"
        >
          {paginas.offerte.titel}
        </h1>
        <p className="text-intro">
          Vraag een vrijblijvende offerte aan, of plan een meet- of
          adviesafspraak op locatie of in onze werkplaats. Vul in waar het om
          gaat; je ziet alleen de vragen die erbij horen.
        </p>
        <ul className="flex flex-col gap-2">
          {beloftes.map((belofte) => (
            <li key={belofte} className="flex items-start gap-3 font-semibold">
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-[0.2em] size-5 shrink-0 text-blauw"
              >
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
              <span>{belofte}</span>
            </li>
          ))}
        </ul>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
        <div className="min-w-0">
          <Suspense fallback={<OfferteFormulier />}>
            <IngevuldFormulier searchParams={searchParams} />
          </Suspense>
        </div>

        <aside
          aria-labelledby="direct-contact-kop"
          className="op-donker flex flex-col gap-6 rounded-kaart p-6 sm:p-8 lg:sticky lg:top-8"
        >
          <div className="flex flex-col gap-3">
            <h2 id="direct-contact-kop" className="text-3xl">
              Liever direct contact?
            </h2>
            <p>
              Een korte vraag, of eerst even overleggen? Stuur een WhatsApp, bel
              of mail. {site.reactiebelofte}.
            </p>
          </div>
          <ul className="flex flex-col items-start gap-3">
            <li>
              <Knop href={site.whatsapp} variant="licht">
                Stuur een WhatsApp
              </Knop>
            </li>
            <li>
              <Knop href={site.telefoon.link} variant="licht">
                Bel {site.telefoon.weergave}
              </Knop>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-11 items-center font-semibold break-all underline decoration-2 underline-offset-4"
              >
                Mail {site.email}
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </Sectie>
  );
}
