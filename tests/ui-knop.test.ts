import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Knop, knopKlassen } from "@/components/ui";

const html = (props: Parameters<typeof Knop>[0]) =>
  renderToStaticMarkup(createElement(Knop, props));

/** De waarde van een attribuut op het eerste element. */
function attribuut(markup: string, naam: string): string | undefined {
  const tag = markup.match(/^<[a-z]+\b[^>]*>/)?.[0] ?? "";
  return tag.match(new RegExp(`\\s${naam}="([^"]*)"`))?.[1];
}

describe("Knop", () => {
  it("is zonder href een <button type=button>", () => {
    const markup = html({ children: "Verstuur" });
    expect(markup).toMatch(/^<button\b/);
    expect(attribuut(markup, "type")).toBe("button");
    expect(markup).toContain(">Verstuur</button>");
  });

  it("houdt een meegegeven type en andere attributen", () => {
    const markup = html({
      children: "Verstuur",
      type: "submit",
      disabled: true,
      name: "actie",
      "aria-label": "Aanvraag versturen",
    });
    expect(attribuut(markup, "type")).toBe("submit");
    expect(markup).toMatch(/\sdisabled=""/);
    expect(attribuut(markup, "name")).toBe("actie");
    expect(attribuut(markup, "aria-label")).toBe("Aanvraag versturen");
  });

  it("is met een pad op de site een link zonder rel", () => {
    const markup = html({ children: "Offerte aanvragen", href: "/offerte" });
    expect(markup).toMatch(/^<a\b/);
    expect(attribuut(markup, "href")).toBe("/offerte");
    expect(markup).not.toContain("rel=");
    expect(markup).not.toContain("<button");
  });

  it.each([
    "https://wa.me/31651556433",
    "tel:+31651556433",
    "mailto:info@sign-up.nl",
    "//voorbeeld.nl",
  ])("opent %s als externe link met noopener en noreferrer", (href) => {
    const markup = html({ children: "Extern", href, variant: "secundair" });
    expect(markup).toMatch(/^<a\b/);
    const rel = (attribuut(markup, "rel") ?? "").split(" ");
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
  });

  it("vult een meegegeven rel aan in plaats van die te vervangen", () => {
    const markup = html({
      children: "Instagram",
      href: "https://www.instagram.com/",
      rel: "me noopener",
    });
    expect((attribuut(markup, "rel") ?? "").split(" ").sort()).toEqual([
      "me",
      "noopener",
      "noreferrer",
    ]);
  });

  it("is in elke variant en grootte minstens 44px hoog, met een focusrand", () => {
    for (const variant of ["primair", "secundair", "tekst", "licht"] as const) {
      for (const grootte of ["normaal", "groot"] as const) {
        const klassen = knopKlassen(variant, grootte);
        expect(klassen, `${variant} ${grootte}`).toMatch(
          /(^|\s)min-h-(11|14)(\s|$)/,
        );
        expect(klassen).toMatch(/focus-visible:outline-3/);
        expect(klassen).toMatch(
          /focus-visible:outline-(\(--kleur-focus\)|wit)/,
        );
        expect(klassen).toMatch(/motion-reduce:transition-none/);
        expect(html({ children: "x", variant, grootte })).toContain(klassen);
      }
    }
  });

  it("gebruikt een witte focusrand voor de lichte knop op navy", () => {
    expect(knopKlassen("licht")).toContain("focus-visible:outline-wit");
    expect(knopKlassen("licht")).toContain("bg-wit");
    expect(knopKlassen("primair")).toContain("bg-blauw");
  });

  it("voegt eigen classes toe", () => {
    const markup = html({ children: "x", className: "w-full" });
    expect(attribuut(markup, "class")).toMatch(/\sw-full$/);
  });
});
