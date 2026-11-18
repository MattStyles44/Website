import Link from "next/link";

import { categorieen } from "@/content/diensten";
import { categoriePad, dienstPad } from "@/content/paginas";

/** Alle categorieën met hun diensten, als links. */
export function DienstenLijst({
  kopNiveau = "h2",
  metOmschrijving = false,
}: {
  kopNiveau?: "h2" | "h3";
  metOmschrijving?: boolean;
}) {
  const Kop = kopNiveau;
  return (
    <div className="flex flex-col gap-6">
      {categorieen.map((categorie) => (
        <section
          key={categorie.slug}
          aria-labelledby={`categorie-${categorie.slug}`}
        >
          <Kop
            id={`categorie-${categorie.slug}`}
            className="text-xl font-semibold"
          >
            <Link href={categoriePad(categorie.slug)} className="underline">
              {categorie.naam}
            </Link>
          </Kop>
          <ul className="mt-2 flex flex-col gap-1">
            {categorie.diensten.map((dienst) => (
              <li key={dienst.slug}>
                <Link
                  href={dienstPad(categorie.slug, dienst.slug)}
                  className="underline"
                >
                  {dienst.naam}
                </Link>
                {metOmschrijving ? <p>{dienst.omschrijving}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
