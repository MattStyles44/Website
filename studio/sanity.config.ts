import { nlNLLocale } from "@sanity/locale-nl-nl";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes, vasteTypes } from "./schemaTypes";
import { toegestaneActies } from "./schemaTypes/vast";
import { structure } from "./structure";

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
    actions: (vorige, { schemaType }) => toegestaneActies(vorige, schemaType),
    newDocumentOptions: (vorige) =>
      vorige.filter((optie) => !vasteTypes.includes(optie.templateId)),
  },
});
