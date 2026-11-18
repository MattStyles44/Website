import type { Metadata } from "next";

import { Container } from "@/components/container";
import { OfferteCta } from "@/components/offerte-cta";
import { paginaMetadata, paginas } from "@/content/paginas";

export const metadata: Metadata = paginaMetadata(paginas.projecten);

// De projecten komen uit het CMS (fase 4). Tot die tijd is deze pagina leeg.
export default function ProjectenPage() {
  return (
    <Container>
      <h1 className="text-3xl font-semibold">{paginas.projecten.titel}</h1>
      <p>Hier komen binnenkort projecten met foto&apos;s van voor en na.</p>
      <OfferteCta />
    </Container>
  );
}
