import { OfferteCta } from "@/components/offerte-cta";
import { Intro, PaginaKop } from "@/components/pagina-kop";
import { Knop } from "@/components/ui";
import { paginas } from "@/content/paginas";

export default function NotFound() {
  return (
    <>
      <PaginaKop titel="Pagina niet gevonden">
        <Intro>Deze pagina bestaat niet (meer).</Intro>
        <div className="flex flex-wrap gap-3">
          <Knop href="/">Naar de homepage</Knop>
          <Knop href={paginas.diensten.pad} variant="secundair">
            Bekijk alle diensten
          </Knop>
        </div>
      </PaginaKop>
      <OfferteCta />
    </>
  );
}
