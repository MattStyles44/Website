import { describe, expect, it } from "vitest";

import { toegestaneActies, vasteTypes } from "../studio/schemaTypes/vast";

/** De acties die de Studio aanbiedt, zoals in DocumentActionComponent.action. */
const acties = [
  "publish",
  "discardChanges",
  "unpublish",
  "unpublishVersion",
  "discardVersion",
  "delete",
  "duplicate",
  "restore",
  undefined,
].map((action) => ({ action }));

describe("Studio: acties bij categorieën en diensten", () => {
  it("staat niet toe dat ze verdwijnen, ook niet via een release", () => {
    expect(vasteTypes).toEqual(["categorie", "dienst"]);
    for (const type of vasteTypes) {
      expect(
        toegestaneActies(acties, type).map(({ action }) => action),
        type,
      ).toEqual([
        "publish",
        "discardChanges",
        "discardVersion",
        "restore",
        undefined,
      ]);
    }
  });

  it("laat de acties bij projecten ongemoeid", () => {
    expect(toegestaneActies(acties, "project")).toEqual(acties);
  });
});
