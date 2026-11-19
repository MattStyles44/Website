import Link from "next/link";

import { PijlPictogram } from "@/components/pictogrammen";
import { categorieen } from "@/content/diensten";
import { categoriePad, dienstPad } from "@/content/paginas";

const dienstLink =
  "inline-flex min-h-11 items-center gap-2 font-semibold text-blauw underline decoration-2 underline-offset-4 hover:text-navy";

/**
 * Alle categorieën met hun diensten, als links. Per categorie de kop links
 * en de diensten rechts, zodat je snel ziet wat er onder valt.
 */
export function DienstenLijst({
  kopNiveau = "h2",
  metOmschrijving = false,
}: {
  kopNiveau?: "h2" | "h3";
  metOmschrijving?: boolean;
}) {
  const Kop = kopNiveau;
  const DienstKop = kopNiveau === "h2" ? "h3" : "h4";
  return (
    <div className="flex flex-col gap-16 lg:gap-20">
      {categorieen.map((categorie) => (
        <section
          key={categorie.slug}
          aria-labelledby={`categorie-${categorie.slug}`}
          className="grid gap-6 lg:grid-cols-12 lg:gap-8"
        >
          <div className="flex flex-col gap-4 lg:col-span-4">
            <span
              aria-hidden="true"
              className="h-1.5 w-12 rounded-full bg-blauw"
            />
            <Kop
              id={`categorie-${categorie.slug}`}
              className="text-3xl leading-kop tracking-tight sm:text-4xl"
            >
              <Link
                href={categoriePad(categorie.slug)}
                className="underline decoration-2 underline-offset-[0.18em] hover:text-blauw"
              >
                {categorie.naam}
              </Link>
            </Kop>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2 lg:col-span-8">
            {categorie.diensten.map((dienst) => (
              <li key={dienst.slug} className="border-t-2 border-vlak py-4">
                {metOmschrijving ? (
                  <>
                    <DienstKop className="font-sans text-lg leading-tight">
                      <Link
                        href={dienstPad(categorie.slug, dienst.slug)}
                        className={dienstLink}
                      >
                        {dienst.naam}
                        <PijlPictogram className="size-4" />
                      </Link>
                    </DienstKop>
                    <p className="mt-1 max-w-[50ch]">{dienst.omschrijving}</p>
                  </>
                ) : (
                  <Link
                    href={dienstPad(categorie.slug, dienst.slug)}
                    className={dienstLink}
                  >
                    {dienst.naam}
                    <PijlPictogram className="size-4" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
