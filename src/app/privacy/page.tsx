import type { Metadata } from "next";

import { Container } from "@/components/container";
import { paginaMetadata, paginas } from "@/content/paginas";

export const metadata: Metadata = paginaMetadata(paginas.privacy);

// De echte privacyverklaring volgt samen met het offerteformulier (fase 6).
export default function PrivacyPage() {
  return (
    <Container>
      <h1 className="text-3xl font-semibold">{paginas.privacy.titel}</h1>
      <p>De privacyverklaring volgt binnenkort.</p>
    </Container>
  );
}
