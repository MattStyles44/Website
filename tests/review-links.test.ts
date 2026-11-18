import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RijkeTekst } from "@/components/rijke-tekst";

/** Eén alinea waarin "lees meer" een link is met dit adres. */
function metLink(href: unknown): string {
  return renderToStaticMarkup(
    createElement(RijkeTekst, {
      value: [
        {
          _type: "block",
          _key: "b1",
          style: "normal",
          markDefs: [{ _type: "link", _key: "l1", href }],
          children: [
            { _type: "span", _key: "s1", text: "lees meer", marks: ["l1"] },
          ],
        },
      ],
    }),
  );
}

/** De href van elke <a> in de HTML. */
function adressen(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)].map((match) =>
    (match[1] ?? "").replace(/&amp;/g, "&"),
  );
}

describe("links in rijke tekst uit Sanity", () => {
  it.each([
    "javascript:alert(1)",
    "JAVASCRIPT:alert(1)",
    "\njavascript:alert(1)",
    "jav\nascript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "//voorbeeld.nl",
    "/\\voorbeeld.nl/pad",
    "/\t/voorbeeld.nl",
    "\\\\voorbeeld.nl\\pad",
    "diensten/voertuigreclame",
    "   ",
  ])("toont %j als gewone tekst", (href) => {
    const html = metLink(href);
    expect(html).toContain("lees meer");
    expect(adressen(html)).toEqual([]);
  });

  it("houdt paden op de site als interne link, zonder rel", () => {
    const html = metLink("/diensten/raamfolie/zandstraalfolie");
    expect(adressen(html)).toEqual(["/diensten/raamfolie/zandstraalfolie"]);
    expect(html).not.toContain("rel=");
  });

  it("houdt webadressen, e-mail en telefoon als externe link met rel=noopener", () => {
    for (const href of [
      "https://www.voorbeeld.nl/pad?a=1&b=2",
      "http://voorbeeld.nl",
      "mailto:info@voorbeeld.nl",
      "tel:+31600000000",
    ]) {
      const html = metLink(href);
      expect(adressen(html), href).toEqual([href]);
      expect(html, href).toContain('rel="noopener noreferrer"');
    }
  });

  it("negeert spaties rond een geldig adres", () => {
    expect(adressen(metLink("  /projecten  "))).toEqual(["/projecten"]);
    expect(adressen(metLink(" https://voorbeeld.nl/ "))).toEqual([
      "https://voorbeeld.nl/",
    ]);
  });
});
