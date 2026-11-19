import type { Metadata } from "next";

import { DienstenLijst } from "@/components/diensten-lijst";
import { OfferteCta } from "@/components/offerte-cta";
import { Intro, PaginaKop } from "@/components/pagina-kop";
import { Sectie } from "@/components/ui";
import { categorieen } from "@/content/diensten";
import { paginaMetadata, paginas } from "@/content/paginas";

export const metadata: Metadata = paginaMetadata(paginas.diensten);

export default function DienstenPage() {
  return (
    <>
      <PaginaKop titel={paginas.diensten.titel}>
        <Intro>
          Alles maatwerk. Je krijgt altijd een vrijblijvende offerte op maat.
        </Intro>
        <nav aria-label="Categorieën op deze pagina">
          <ul className="flex flex-wrap gap-2">
            {categorieen.map((categorie) => (
              <li key={categorie.slug}>
                <a
                  href={`#categorie-${categorie.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-blauw bg-wit px-4 text-sm font-semibold text-blauw transition-colors duration-150 ease-out hover:bg-blauw hover:text-wit motion-reduce:transition-none"
                >
                  {categorie.naam}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PaginaKop>

      <Sectie>
        <DienstenLijst metOmschrijving />
      </Sectie>

      <OfferteCta />
    </>
  );
}
