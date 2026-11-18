import type { Metadata } from "next";

import { Container } from "@/components/container";
import { paginaMetadata, paginas } from "@/content/paginas";
import { site } from "@/content/site";

export const metadata: Metadata = paginaMetadata(paginas.offerte);

// Het offerte- en afspraakformulier volgt in fase 6. Tot die tijd: direct contact.
export default function OffertePage() {
  return (
    <Container>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{paginas.offerte.titel}</h1>
        <p>
          Vraag een vrijblijvende offerte aan of plan een meet- of
          adviesafspraak, op locatie of in de werkplaats. {site.reactiebelofte}.
        </p>
      </header>

      <section aria-labelledby="direct-kop" className="flex flex-col gap-2">
        <h2 id="direct-kop" className="text-xl font-semibold">
          Direct contact
        </h2>
        <p className="flex flex-wrap gap-4">
          <a href={site.whatsapp} rel="noopener" className="underline">
            Stuur een WhatsApp
          </a>
          <a href={site.telefoon.link} className="underline">
            Bel {site.telefoon.weergave}
          </a>
          <a href={`mailto:${site.email}`} className="underline">
            Mail {site.email}
          </a>
        </p>
      </section>
    </Container>
  );
}
