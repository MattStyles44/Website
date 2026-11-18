import { categorie } from "./categorie";
import { dienst } from "./dienst";
import { project } from "./project";

export const schemaTypes = [categorie, dienst, project];

/** Documenttypes die uit de code komen: niet aanmaken, dupliceren of verwijderen. */
export const vasteTypes = ["categorie", "dienst"];
