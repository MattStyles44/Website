import type { StructureResolver } from "sanity/structure";

/** Menu links in de Studio: categorieën, diensten per categorie en projecten. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Inhoud")
    .items([
      S.listItem()
        .title("Categorieën")
        .schemaType("categorie")
        .child(
          S.documentTypeList("categorie")
            .title("Categorieën")
            .defaultOrdering([{ field: "volgorde", direction: "asc" }]),
        ),
      S.listItem()
        .title("Diensten")
        .schemaType("dienst")
        .child(
          S.documentTypeList("categorie")
            .title("Kies een categorie")
            .defaultOrdering([{ field: "volgorde", direction: "asc" }])
            .child((categorieId) =>
              S.documentList()
                .title("Diensten")
                .schemaType("dienst")
                .filter('_type == "dienst" && categorie == $categorie')
                .params({ categorie: categorieId.replace(/^categorie-/, "") })
                .defaultOrdering([{ field: "volgorde", direction: "asc" }]),
            ),
        ),
      S.divider(),
      S.documentTypeListItem("project").title("Projecten"),
    ]);
