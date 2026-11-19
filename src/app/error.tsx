"use client";

import { useEffect } from "react";

import { Intro, PaginaKop } from "@/components/pagina-kop";
import { BerichtPictogram, TelefoonPictogram } from "@/components/pictogrammen";
import { Knop } from "@/components/ui/knop";
import { site } from "@/content/site";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PaginaKop titel="Er ging iets mis">
      <Intro>
        Probeer het opnieuw. Lukt het niet, bel of WhatsApp ons dan.
      </Intro>
      <div className="flex flex-wrap gap-3">
        <Knop onClick={() => retry()}>Opnieuw proberen</Knop>
        <Knop href={site.telefoon.link} variant="secundair">
          <TelefoonPictogram />
          Bel {site.telefoon.weergave}
        </Knop>
        <Knop href={site.whatsapp} variant="secundair">
          <BerichtPictogram />
          Stuur een WhatsApp
        </Knop>
      </div>
    </PaginaKop>
  );
}
