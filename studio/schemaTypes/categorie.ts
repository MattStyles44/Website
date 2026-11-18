import { defineField, defineType } from "sanity";

import { rijkeTekst, vastVeld, volgordeVeld } from "./velden";

export const categorie = defineType({
  name: "categorie",
  type: "document",
  title: "Categorie",
  description:
    "De zes categorieën staan vast in de code. Hier pas je alleen de teksten aan.",
  fields: [
    vastVeld("naam", "Naam", "Staat vast in de code."),
    vastVeld(
      "slug",
      "Webadres",
      "Het laatste deel van het webadres, bijvoorbeeld /diensten/voertuigreclame. Staat vast in de code.",
    ),
    defineField({
      name: "intro",
      type: "text",
      title: "Introductie",
      description:
        "Eén of twee zinnen bovenaan de pagina. Ook gebruikt als omschrijving in Google (max. 300 tekens).",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "tekst",
      type: "array",
      title: "Tekst",
      of: [rijkeTekst],
    }),
    volgordeVeld,
  ],
  preview: {
    select: { title: "naam", subtitle: "slug" },
    prepare: ({ title, subtitle }) => ({
      title,
      subtitle: `/diensten/${subtitle}`,
    }),
  },
});
