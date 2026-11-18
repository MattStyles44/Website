import { defineArrayMember, defineField, defineType } from "sanity";

import { foto, rijkeTekst } from "./velden";

export const project = defineType({
  name: "project",
  type: "document",
  title: "Project",
  description: "Een uitgevoerd project of klantcase.",
  fields: [
    defineField({
      name: "titel",
      type: "string",
      title: "Titel",
      description:
        "Bijvoorbeeld: Vlootbelettering voor een installatiebedrijf.",
      validation: (rule) => rule.required().min(5).max(90),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Webadres",
      description: "Klik op Genereer om het webadres uit de titel te maken.",
      options: { source: "titel", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "klant",
      type: "string",
      title: "Klant",
      description:
        "Alleen invullen als de klant akkoord is met vermelding op de site.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "plaats",
      type: "string",
      title: "Plaats",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "datum",
      type: "date",
      title: "Datum",
      description: "Wanneer het project is opgeleverd.",
      options: { dateFormat: "D MMMM YYYY" },
    }),
    defineField({
      name: "diensten",
      type: "array",
      title: "Diensten",
      description: "Welke diensten zijn uitgevoerd?",
      of: [defineArrayMember({ type: "reference", to: [{ type: "dienst" }] })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "samenvatting",
      type: "text",
      title: "Samenvatting",
      description:
        "Eén of twee zinnen voor het overzicht van projecten (max. 300 tekens).",
      rows: 3,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "tekst",
      type: "array",
      title: "Tekst",
      description: "De vraag van de klant, de oplossing en het resultaat.",
      of: [rijkeTekst],
    }),
    defineField({
      name: "fotos",
      type: "array",
      title: "Foto's",
      of: [foto],
      options: { layout: "grid" },
      validation: (rule) => rule.max(20),
    }),
    defineField({
      name: "uitgelicht",
      type: "boolean",
      title: "Uitgelicht",
      description: "Toon dit project op de homepage.",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Nieuwste eerst",
      name: "datumAflopend",
      by: [{ field: "datum", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "titel", plaats: "plaats", media: "fotos.0" },
    prepare: ({ title, plaats, media }) => ({
      title,
      subtitle: plaats,
      media,
    }),
  },
});
