import {
  BerichtPictogram,
  PijlPictogram,
  TelefoonPictogram,
} from "@/components/pictogrammen";
import { Knop, Sectie } from "@/components/ui";
import { offerteKnop } from "@/content/navigatie";
import { site } from "@/content/site";

const linkKlassen =
  "inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-2 underline-offset-4 hover:decoration-1";

/**
 * Vaste oproep aan het eind van elke pagina: offerte, WhatsApp of bellen.
 * Categorie en dienst gaan mee in de link, zodat het formulier (fase 6) ze kan invullen.
 */
export function OfferteCta({
  categorie,
  dienst,
}: {
  categorie?: string;
  dienst?: string;
}) {
  const query = new URLSearchParams();
  if (categorie) query.set("categorie", categorie);
  if (dienst) query.set("dienst", dienst);
  const href = query.size
    ? `${offerteKnop.href}?${query.toString()}`
    : offerteKnop.href;

  return (
    <Sectie toon="donker" aria-labelledby="cta-kop">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="flex flex-col gap-5 lg:col-span-7">
          <h2
            id="cta-kop"
            className="text-4xl leading-kop tracking-tight sm:text-5xl lg:text-6xl"
          >
            Vrijblijvende offerte op maat
          </h2>
          <p className="max-w-[48ch] text-intro">
            {site.reactiebelofte}. Je spreekt direct met de vakman zelf.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:items-end">
          <Knop href={href} variant="licht" grootte="groot">
            {offerteKnop.label}
            <PijlPictogram />
          </Knop>
          <div className="flex flex-wrap gap-x-6 gap-y-1 lg:justify-end">
            <a
              href={site.whatsapp}
              rel="noopener noreferrer"
              className={linkKlassen}
            >
              <BerichtPictogram />
              Stuur een WhatsApp
            </a>
            <a href={site.telefoon.link} className={linkKlassen}>
              <TelefoonPictogram />
              Bel {site.telefoon.weergave}
            </a>
          </div>
        </div>
      </div>
    </Sectie>
  );
}
