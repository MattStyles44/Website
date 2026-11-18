import type { Metadata } from "next";

import { Container } from "@/components/container";
import { OfferteCta } from "@/components/offerte-cta";
import { paginaMetadata, paginas } from "@/content/paginas";
import { onderscheidend, site } from "@/content/site";

export const metadata: Metadata = paginaMetadata(paginas.overOns);

export default function OverOnsPage() {
  return (
    <Container>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{paginas.overOns.titel}</h1>
        <p>
          {site.naam} is al {site.ervaring} een bekende naam in signing en
          visuele communicatie in Groningen. We zijn een klein en wendbaar
          bedrijf: de eigenaar en een compagnon, samen met gespecialiseerde
          partners.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {onderscheidend.map((punt) => (
          <li key={punt.titel}>
            <h2 className="text-xl font-semibold">{punt.titel}</h2>
            <p>{punt.tekst}</p>
          </li>
        ))}
      </ul>

      <OfferteCta />
    </Container>
  );
}
