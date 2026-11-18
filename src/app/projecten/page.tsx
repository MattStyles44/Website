import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { OfferteCta } from "@/components/offerte-cta";
import { dienstPad, paginaMetadata, paginas } from "@/content/paginas";
import { haalProjecten } from "@/lib/cms";

export const metadata: Metadata = paginaMetadata(paginas.projecten);

const datumNotatie = new Intl.DateTimeFormat("nl-NL", {
  month: "long",
  year: "numeric",
  timeZone: "Europe/Amsterdam",
});

// De projecten komen uit Sanity (fase 4). Foto's en vormgeving volgen in de interfacefase.
export default async function ProjectenPage() {
  const projecten = await haalProjecten();

  return (
    <Container>
      <h1 className="text-3xl font-semibold">{paginas.projecten.titel}</h1>

      {projecten.length === 0 ? (
        <p>Hier komen binnenkort projecten met foto&apos;s van voor en na.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {projecten.map((project) => (
            <li key={project.slug} className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">{project.titel}</h2>
              {(project.plaats || project.datum) && (
                <p>
                  {[
                    project.plaats,
                    project.datum
                      ? datumNotatie.format(new Date(project.datum))
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              <p>{project.samenvatting}</p>
              {project.diensten.length > 0 && (
                <p>
                  {project.diensten.map((dienst, index) => (
                    <span key={`${dienst.categorie}/${dienst.slug}`}>
                      {index > 0 && ", "}
                      <Link
                        href={dienstPad(dienst.categorie, dienst.slug)}
                        className="underline"
                      >
                        {dienst.naam}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <OfferteCta />
    </Container>
  );
}
