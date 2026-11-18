/** Documenttypes die uit de code komen: niet aanmaken, dupliceren of verwijderen. */
export const vasteTypes = ["categorie", "dienst"];

/**
 * Acties die niet mogen bij categorieën en diensten: die komen uit de code.
 * `unpublishVersion` depubliceert het document zodra een release wordt
 * gepubliceerd; dat telt dus ook als depubliceren.
 */
const verbodenActies = ["delete", "duplicate", "unpublish", "unpublishVersion"];

/** De documentacties zonder de verboden acties, voor de vaste documenttypes. */
export function toegestaneActies<Actie extends { action?: string }>(
  acties: Actie[],
  schemaType: string,
): Actie[] {
  if (!vasteTypes.includes(schemaType)) return acties;
  return acties.filter(
    ({ action }) => action === undefined || !verbodenActies.includes(action),
  );
}
