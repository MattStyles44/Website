import { nlNLLocale } from "@sanity/locale-nl-nl";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes, vasteTypes } from "./schemaTypes";
import { structure } from "./structure";

/** Acties die niet mogen bij categorieën en diensten: die komen uit de code. */
const verbodenActies = ["delete", "duplicate", "unpublish"];

export default defineConfig({
  name: "default",
  title: "SignUp Reclame",
  projectId: "qgoawz7m",
  dataset: "production",
  plugins: [structureTool({ structure }), nlNLLocale()],
  schema: {
    types: schemaTypes,
    templates: (vorige) =>
      vorige.filter((template) => !vasteTypes.includes(template.schemaType)),
  },
  document: {
    actions: (vorige, { schemaType }) =>
      vasteTypes.includes(schemaType)
        ? vorige.filter(
            ({ action }) =>
              action === undefined || !verbodenActies.includes(action),
          )
        : vorige,
    newDocumentOptions: (vorige) =>
      vorige.filter((optie) => !vasteTypes.includes(optie.templateId)),
  },
});
