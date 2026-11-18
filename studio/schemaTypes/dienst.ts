import { defineArrayMember, defineField, defineType } from "sanity";

import { foto, rijkeTekst, vastVeld, volgordeVeld } from "./velden";

export const dienst = defineType({
  name: "dienst",
  type: "document",
  title: "Dienst",
  description:
    "De diensten staan vast in de code. Hier pas je de teksten en foto's aan.",
  fields: [
    vastVeld("naam", "Naam", "Staat vast in de code."),
    vastVeld(
      "categorie",
      "Categorie",
      "Het webadres van de categorie. Staat vast in de code.",
    ),
    vastVeld(
      "slug",
      "Webadres",
      "Het laatste deel van het webadres. Staat vast in de code.",
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
    defineField({
      name: "voordelen",
      type: "array",
      title: "Voordelen",
      description:
        "Korte punten, bijvoorbeeld: Strak gemonteerd, zonder bellen.",
      of: [
        defineArrayMember({
          type: "string",
          validation: (rule) => rule.max(120),
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "werkwijze",
      type: "array",
      title: "Werkwijze",
      description: "De stappen van aanvraag tot oplevering.",
      of: [
        defineArrayMember({
          type: "object",
          name: "stap",
          title: "Stap",
          fields: [
            defineField({
              name: "titel",
              type: "string",
              title: "Titel",
              validation: (rule) => rule.required().max(60),
            }),
            defineField({
              name: "tekst",
              type: "text",
              title: "Uitleg",
              rows: 3,
              validation: (rule) => rule.required().max(400),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: "vragen",
      type: "array",
      title: "Veelgestelde vragen",
      of: [
        defineArrayMember({
          type: "object",
          name: "vraag",
          title: "Vraag",
          fields: [
            defineField({
              name: "vraag",
              type: "string",
              title: "Vraag",
              validation: (rule) => rule.required().max(160),
            }),
            defineField({
              name: "antwoord",
              type: "text",
              title: "Antwoord",
              rows: 4,
              validation: (rule) => rule.required().max(800),
            }),
          ],
          preview: { select: { title: "vraag" } },
        }),
      ],
      validation: (rule) => rule.max(10),
    }),
    defineField({
      name: "garantie",
      type: "text",
      title: "Garantie",
      description:
        "De garantietermijn en wat garantie dekt. Laat leeg zolang dit niet vaststaat.",
      rows: 3,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: "fotos",
      type: "array",
      title: "Foto's",
      of: [foto],
      options: { layout: "grid" },
      validation: (rule) => rule.max(12),
    }),
    volgordeVeld,
  ],
  preview: {
    select: { title: "naam", categorie: "categorie", slug: "slug" },
    prepare: ({ title, categorie, slug }) => ({
      title,
      subtitle: `/diensten/${categorie}/${slug}`,
    }),
  },
});
