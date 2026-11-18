import type { Metadata } from "next";

import { Container } from "@/components/container";
import { DienstenLijst } from "@/components/diensten-lijst";
import { OfferteCta } from "@/components/offerte-cta";
import { paginaMetadata, paginas } from "@/content/paginas";

export const metadata: Metadata = paginaMetadata(paginas.diensten);

export default function DienstenPage() {
  return (
    <Container>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{paginas.diensten.titel}</h1>
        <p>
          Alles maatwerk. Je krijgt altijd een vrijblijvende offerte op maat.
        </p>
      </header>
      <DienstenLijst metOmschrijving />
      <OfferteCta />
    </Container>
  );
}
