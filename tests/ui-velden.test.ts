import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Invoer, Keuzegroep, Keuzelijst, Tekstvak } from "@/components/ui";

/** Het element (openingstag) met dit id. */
function tagMetId(markup: string, id: string): string {
  return (
    markup.match(new RegExp(`<[a-z]+\\b[^>]*\\sid="${id}"[^>]*>`))?.[0] ?? ""
  );
}

/** De waarde van een attribuut op de tag met dit id, in elke lettergrootte. */
function attribuut(markup: string, id: string, naam: string) {
  return tagMetId(markup, id).match(
    new RegExp(`\\s${naam}="([^"]*)"`, "i"),
  )?.[1];
}

const opties = [
  { waarde: "ochtend", label: "Ochtend" },
  { waarde: "middag", label: "Middag" },
] as const;

describe("Invoer", () => {
  it("koppelt label, hint en fout aan het veld", () => {
    const markup = renderToStaticMarkup(
      createElement(Invoer, {
        label: "Naam",
        naam: "naam",
        hint: "Voor- en achternaam",
        fout: "Vul je naam in.",
        verplicht: true,
      }),
    );
    expect(markup).toMatch(/<label\b[^>]*\sfor="naam"/);
    expect(attribuut(markup, "naam", "name")).toBe("naam");
    expect(attribuut(markup, "naam", "aria-invalid")).toBe("true");
    expect(tagMetId(markup, "naam")).toMatch(/\srequired=""/);
    expect(attribuut(markup, "naam", "aria-describedby")).toBe(
      "naam-hint naam-fout",
    );
    expect(tagMetId(markup, "naam-hint")).toMatch(/^<p\b/);
    expect(markup).toMatch(/id="naam-fout"[^>]*>[\s\S]*Vul je naam in\./);
  });

  it("toont een fout niet alleen met kleur", () => {
    const markup = renderToStaticMarkup(
      createElement(Invoer, { label: "Naam", naam: "naam", fout: "Te kort." }),
    );
    const melding =
      markup.match(/<p\b[^>]*id="naam-fout"[^>]*>[\s\S]*?<\/p>/)?.[0] ?? "";
    expect(melding).toContain("text-fout");
    expect(melding).toContain("<svg");
    expect(melding).toContain('aria-hidden="true"');
    expect(melding).toContain("Fout: ");
  });

  it("toont verplicht zichtbaar bij het label", () => {
    const markup = renderToStaticMarkup(
      createElement(Invoer, {
        label: "E-mail",
        naam: "email",
        verplicht: true,
      }),
    );
    expect(markup).toMatch(
      /<label\b[^>]*>E-mail<span\b[^>]*>\(verplicht\)<\/span><\/label>/,
    );
  });

  it("is zonder fout en zonder verplicht een gewoon veld", () => {
    const markup = renderToStaticMarkup(
      createElement(Invoer, { label: "Plaats", naam: "plaats" }),
    );
    expect(attribuut(markup, "plaats", "aria-invalid")).toBeUndefined();
    expect(attribuut(markup, "plaats", "aria-describedby")).toBeUndefined();
    expect(markup).not.toContain("required");
    expect(markup).not.toContain("(verplicht)");
  });

  it("geeft andere attributen door en voegt een eigen beschrijving samen", () => {
    const markup = renderToStaticMarkup(
      createElement(Invoer, {
        label: "Postcode",
        naam: "postcode",
        id: "veld-postcode",
        hint: "Bijvoorbeeld 9723 HL",
        autoComplete: "postal-code",
        inputMode: "text",
        placeholder: "1234 AB",
        "aria-describedby": "uitleg-adres",
      }),
    );
    expect(markup).toMatch(/<label\b[^>]*\sfor="veld-postcode"/);
    expect(attribuut(markup, "veld-postcode", "name")).toBe("postcode");
    expect(attribuut(markup, "veld-postcode", "autocomplete")).toBe(
      "postal-code",
    );
    expect(attribuut(markup, "veld-postcode", "placeholder")).toBe("1234 AB");
    expect(attribuut(markup, "veld-postcode", "aria-describedby")).toBe(
      "uitleg-adres veld-postcode-hint",
    );
  });

  it("telt required als verplicht", () => {
    const markup = renderToStaticMarkup(
      createElement(Invoer, { label: "Naam", naam: "naam", required: true }),
    );
    expect(tagMetId(markup, "naam")).toMatch(/\srequired=""/);
    expect(markup).toContain("(verplicht)");
  });
});

describe("Tekstvak en Keuzelijst", () => {
  it("werkt hetzelfde voor een tekstvak", () => {
    const markup = renderToStaticMarkup(
      createElement(Tekstvak, {
        label: "Toelichting",
        naam: "toelichting",
        hint: "Maximaal 2000 tekens",
        fout: "Te lang.",
        verplicht: true,
        maxLength: 2000,
      }),
    );
    expect(markup).toMatch(/<label\b[^>]*\sfor="toelichting"/);
    expect(tagMetId(markup, "toelichting")).toMatch(/^<textarea\b/);
    expect(attribuut(markup, "toelichting", "aria-invalid")).toBe("true");
    expect(attribuut(markup, "toelichting", "aria-describedby")).toBe(
      "toelichting-hint toelichting-fout",
    );
    expect(attribuut(markup, "toelichting", "maxlength")).toBe("2000");
    expect(tagMetId(markup, "toelichting")).toMatch(/\srequired=""/);
  });

  it("zet de lege keuze vooraan en daarna de opties", () => {
    const markup = renderToStaticMarkup(
      createElement(Keuzelijst, {
        label: "Dagdeel",
        naam: "dagdeel",
        leeg: "Kies een dagdeel",
        opties,
        verplicht: true,
      }),
    );
    expect(tagMetId(markup, "dagdeel")).toMatch(/^<select\b/);
    expect(attribuut(markup, "dagdeel", "name")).toBe("dagdeel");
    const waarden = [...markup.matchAll(/<option\b[^>]*value="([^"]*)"/g)].map(
      (match) => match[1],
    );
    expect(waarden).toEqual(["", "ochtend", "middag"]);
    expect(markup).toContain(">Kies een dagdeel</option>");
  });

  it("heeft zonder leeg alleen de opties", () => {
    const markup = renderToStaticMarkup(
      createElement(Keuzelijst, { label: "Dagdeel", naam: "dagdeel", opties }),
    );
    expect(markup).not.toContain('value=""');
    expect(attribuut(markup, "dagdeel", "aria-invalid")).toBeUndefined();
  });
});

describe("Keuzegroep", () => {
  it("is een fieldset met legend, en elke keuze heeft een eigen label", () => {
    const markup = renderToStaticMarkup(
      createElement(Keuzegroep, {
        legend: "Dagdeel",
        naam: "dagdeel",
        opties,
        geselecteerd: "ochtend",
        hint: "Voor de meetafspraak",
        fout: "Kies een dagdeel.",
      }),
    );
    expect(markup).toMatch(/^<fieldset\b/);
    expect(markup).toMatch(/<legend\b[^>]*>Dagdeel<\/legend>/);
    expect(markup.match(/<fieldset\b[^>]*>/)?.[0]).toContain(
      'aria-describedby="dagdeel-hint dagdeel-fout"',
    );
    expect(tagMetId(markup, "dagdeel-fout")).toMatch(/^<p\b/);

    const keuzes = [...markup.matchAll(/<input\b[^>]*>/g)].map((m) => m[0]);
    expect(keuzes).toHaveLength(2);
    const ids = keuzes.map((keuze) => keuze.match(/\sid="([^"]+)"/)?.[1]);
    expect(new Set(ids).size).toBe(2);
    for (const [index, keuze] of keuzes.entries()) {
      expect(keuze).toMatch(/\stype="radio"/);
      expect(keuze).toMatch(/\sname="dagdeel"/);
      expect(keuze).toContain(`value="${opties[index]?.waarde}"`);
      expect(markup).toMatch(
        new RegExp(
          `<label\\b[^>]*\\sfor="${ids[index]}"[^>]*>${opties[index]?.label}<`,
        ),
      );
    }
    expect(keuzes[0]).toMatch(/\schecked=""/);
    expect(keuzes[1]).not.toMatch(/\schecked=""/);
  });

  it("maakt vinkjes met type checkbox, zonder fout of hint", () => {
    const markup = renderToStaticMarkup(
      createElement(Keuzegroep, {
        legend: "Onderwerp",
        naam: "onderwerp",
        type: "checkbox",
        opties,
      }),
    );
    const keuzes = [...markup.matchAll(/<input\b[^>]*>/g)].map((m) => m[0]);
    expect(keuzes).toHaveLength(2);
    for (const keuze of keuzes) expect(keuze).toMatch(/\stype="checkbox"/);
    expect(markup).not.toContain("checked");
    expect(markup).not.toContain("aria-describedby");
  });
});
