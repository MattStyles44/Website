import type { Metadata } from "next";

import { OfferteCta } from "@/components/offerte-cta";
import { Intro, PaginaKop } from "@/components/pagina-kop";
import { paginaMetadata, paginas } from "@/content/paginas";

export const metadata: Metadata = paginaMetadata(paginas.privacy);

// De echte privacyverklaring volgt samen met het offerteformulier (fase 6).
export default function PrivacyPage() {
  return (
    <>
      <PaginaKop titel={paginas.privacy.titel}>
        <Intro>De privacyverklaring volgt binnenkort.</Intro>
      </PaginaKop>
      <OfferteCta />
    </>
  );
}
