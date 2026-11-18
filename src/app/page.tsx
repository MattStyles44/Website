import type { Metadata } from "next";

import { Container } from "@/components/container";
import { DienstenLijst } from "@/components/diensten-lijst";
import { OfferteCta } from "@/components/offerte-cta";
import { paginaMetadata, paginas } from "@/content/paginas";
import { onderscheidend, site } from "@/content/site";

export const metadata: Metadata = paginaMetadata(paginas.home);

export default function Home() {
  return (
    <Container>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{site.slogan}</h1>
        <p>
          Al {site.ervaring} je specialist in autobelettering, carwrapping,
          gevelreclame en interieur in {site.regio}.
        </p>
      </header>

      <section aria-labelledby="diensten-kop" className="flex flex-col gap-4">
        <h2 id="diensten-kop" className="text-2xl font-semibold">
          Diensten
        </h2>
        <DienstenLijst kopNiveau="h3" />
      </section>

      <section aria-labelledby="waarom-kop" className="flex flex-col gap-4">
        <h2 id="waarom-kop" className="text-2xl font-semibold">
          Waarom {site.naam}
        </h2>
        <ul className="flex flex-col gap-3">
          {onderscheidend.map((punt) => (
            <li key={punt.titel}>
              <h3 className="font-semibold">{punt.titel}</h3>
              <p>{punt.tekst}</p>
            </li>
          ))}
        </ul>
      </section>

      <OfferteCta />
    </Container>
  );
}
