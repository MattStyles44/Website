import type { ProjectKaart } from "@/lib/cms";

/** Hoeveel projecten een dienst- of categoriepagina hoogstens toont. */
export const maxProjectenPerPagina = 3;

/** De eerste projecten (hoogstens `max`) die aan `past` voldoen, op volgorde. */
function eerste(
  projecten: readonly ProjectKaart[],
  past: (project: ProjectKaart) => boolean,
  max: number,
): ProjectKaart[] {
  const gekozen: ProjectKaart[] = [];
  for (const project of projecten) {
    if (gekozen.length >= max) break;
    if (past(project)) gekozen.push(project);
  }
  return gekozen;
}

/**
 * De projecten met precies deze dienst (zelfde categorie en slug), in de
 * gegeven volgorde en hoogstens `max`. De invoer blijft ongewijzigd.
 */
export function projectenMetDienst(
  projecten: readonly ProjectKaart[],
  categorie: string,
  dienst: string,
  max: number = maxProjectenPerPagina,
): ProjectKaart[] {
  return eerste(
    projecten,
    (project) =>
      project.diensten.some(
        (gekoppeld) =>
          gekoppeld.categorie === categorie && gekoppeld.slug === dienst,
      ),
    max,
  );
}

/**
 * De projecten met minstens één dienst uit deze categorie, in de gegeven
 * volgorde, elk één keer en hoogstens `max`. De invoer blijft ongewijzigd.
 */
export function projectenInCategorie(
  projecten: readonly ProjectKaart[],
  categorie: string,
  max: number = maxProjectenPerPagina,
): ProjectKaart[] {
  const gezien = new Set<string>();
  return eerste(
    projecten,
    (project) => {
      if (gezien.has(project.slug)) return false;
      if (
        !project.diensten.some((gekoppeld) => gekoppeld.categorie === categorie)
      ) {
        return false;
      }
      gezien.add(project.slug);
      return true;
    },
    max,
  );
}
