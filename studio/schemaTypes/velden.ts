import { defineArrayMember, defineField } from "sanity";

/**
 * Rijke tekst: alinea's, tussenkopjes, opsommingen, vet, cursief en links.
 * Bewust beperkt, zodat de opmaak op de site altijd klopt.
 */
export const rijkeTekst = defineArrayMember({
  type: "block",
  styles: [
    { title: "Alinea", value: "normal" },
    { title: "Tussenkop", value: "h2" },
    { title: "Kleine tussenkop", value: "h3" },
  ],
  lists: [
    { title: "Opsomming", value: "bullet" },
    { title: "Genummerd", value: "number" },
  ],
  marks: {
    decorators: [
      { title: "Vet", value: "strong" },
      { title: "Cursief", value: "em" },
    ],
    annotations: [
      {
        name: "link",
        type: "object",
        title: "Link",
        fields: [
          defineField({
            name: "href",
            type: "url",
            title: "Adres",
            description:
              "Een pagina op de site (bijvoorbeeld /diensten/voertuigreclame) of een volledig webadres.",
            validation: (rule) =>
              rule.required().uri({
                allowRelative: true,
                scheme: ["http", "https", "mailto", "tel"],
              }),
          }),
        ],
      },
    ],
  },
});

/** Een foto met een verplichte beschrijving voor zoekmachines en schermlezers. */
export const foto = defineArrayMember({
  type: "image",
  title: "Foto",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      type: "string",
      title: "Beschrijving",
      description:
        "Wat is er te zien? Bijvoorbeeld: Bestelbus van een installatiebedrijf met belettering in blauw en wit.",
      validation: (rule) => rule.required().min(5).max(160),
    }),
  ],
});

/** Volgorde uit de code, voor de sortering in de Studio. Niet zichtbaar. */
export const volgordeVeld = defineField({
  name: "volgorde",
  type: "number",
  hidden: true,
  readOnly: true,
});

/** Vast veld dat uit de code komt (naam of webadres): alleen-lezen in de Studio. */
export function vastVeld(name: string, title: string, description: string) {
  return defineField({
    name,
    type: "string",
    title,
    description,
    readOnly: true,
    validation: (rule) => rule.required(),
  });
}
