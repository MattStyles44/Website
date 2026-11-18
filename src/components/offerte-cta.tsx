import Link from "next/link";

import { offerteKnop } from "@/content/navigatie";
import { site } from "@/content/site";

/**
 * Vaste oproep op pagina's: offerte, WhatsApp of bellen.
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
    <section aria-labelledby="cta-kop" className="flex flex-col gap-2">
      <h2 id="cta-kop" className="text-xl font-semibold">
        Vrijblijvende offerte op maat
      </h2>
      <p>{site.reactiebelofte}.</p>
      <p className="flex flex-wrap gap-4">
        <Link href={href} className="font-semibold underline">
          {offerteKnop.label}
        </Link>
        <a href={site.whatsapp} rel="noopener" className="underline">
          Stuur een WhatsApp
        </a>
        <a href={site.telefoon.link} className="underline">
          Bel {site.telefoon.weergave}
        </a>
      </p>
    </section>
  );
}
