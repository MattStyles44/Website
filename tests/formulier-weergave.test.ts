import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { OfferteFormulier } from "@/components/offerte/offerte-formulier";
import { categorieen } from "@/content/diensten";
import { site } from "@/content/site";
import type { VerwerkResultaat } from "@/lib/offerte/verwerk";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

type Props = Parameters<typeof OfferteFormulier>[0];

const formulier = (props: Props = {}) =>
  renderToStaticMarkup(createElement(OfferteFormulier, props));

/** De openingstag van het eerste formulierveld met deze naam. */
function veld(markup: string, naam: string): string | undefined {
  return markup.match(
    new RegExp(`<(?:input|select|textarea)\\b[^>]*\\sname="${naam}"[^>]*>`),
  )?.[0];
}

function attribuut(tag: string, naam: string): string | undefined {
  return tag.match(new RegExp(`\\s${naam}="([^"]*)"`, "i"))?.[1];
}

function tekst(markup: string): string {
  return markup
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

/** De namen van alle velden in de markup, zonder dubbele. */
function veldnamen(markup: string): string[] {
  return [
    ...new Set(
      [
        ...markup.matchAll(
          /<(?:input|select|textarea)\b[^>]*\sname="([^"$]*)"/g,
        ),
      ].map((match) => match[1]!),
    ),
  ];
}

const algemeen = [
  "categorie",
  "toelichting",
  "bestanden",
  "naam",
  "bedrijfsnaam",
  "email",
  "telefoon",
  "plaats",
  "afspraak",
  "website",
];

describe("velden per categorie", () => {
  it("toont voor een categorie precies haar eigen velden", () => {
    const verwacht: Record<string, string[]> = {
      voertuig: [
        "merk",
        "model",
        "bouwjaar",
        "lengteHoogte",
        "aantalVoertuigen",
        "lakkleur",
      ],
      gevel: [
        "breedteCm",
        "hoogteCm",
        "uitvoering",
        "ondergrond",
        "montagehoogteM",
      ],
      interieur: ["breedteCm", "hoogteCm", "ondergrond"],
      raam: ["breedteCm", "hoogteCm", "aantalRamen", "zijde"],
      algemeen: [],
    };
    for (const categorie of categorieen) {
      const markup = formulier({ categorie: categorie.slug });
      expect(veldnamen(markup).sort(), categorie.slug).toEqual(
        [...algemeen, "dienst", ...verwacht[categorie.formulier]!].sort(),
      );
    }
  });

  it("vraagt zonder categorie nog niet naar een dienst", () => {
    const markup = formulier();
    expect(veldnamen(markup).sort()).toEqual([...algemeen].sort());
    expect(tekst(markup)).toContain("Kies eerst een categorie");
  });

  it("geeft getallenvelden een numeriek toetsenbord en geen type number", () => {
    const markup = formulier({ categorie: "gevelreclame" });
    for (const naam of ["breedteCm", "hoogteCm", "montagehoogteM"]) {
      const tag = veld(markup, naam)!;
      expect(attribuut(tag, "inputmode"), naam).toBe("decimal");
      expect(attribuut(tag, "type") ?? "text", naam).toBe("text");
    }
    const voertuig = formulier({ categorie: "voertuigreclame" });
    expect(attribuut(veld(voertuig, "aantalVoertuigen")!, "inputmode")).toBe(
      "numeric",
    );
  });

  it("noemt centimeters en meters in de labels", () => {
    const markup = tekst(formulier({ categorie: "gevelreclame" }));
    expect(markup).toContain("Breedte in centimeters");
    expect(markup).toContain("Hoogte in centimeters");
    expect(markup).toContain("Montagehoogte in meters");
  });

  it("markeert alleen verplichte velden als verplicht", () => {
    const markup = formulier({ categorie: "raamfolie" });
    for (const naam of ["categorie", "breedteCm", "aantalRamen", "zijde"]) {
      expect(veld(markup, naam), naam).toMatch(/\srequired=""/);
    }
    for (const naam of ["dienst", "toelichting", "bestanden", "bedrijfsnaam"]) {
      expect(veld(markup, naam), naam).not.toMatch(/\srequired=""/);
    }
    // Het aantal zichtbare markeringen is gelijk aan het aantal verplichte velden.
    const markeringen = markup.match(/\(verplicht\)/g)?.length ?? 0;
    const verplicht = markup.match(/\srequired=""/g)?.length ?? 0;
    expect(markeringen).toBe(verplicht);
  });
});

describe("afspraak en honeypot", () => {
  it("toont de afspraakvelden pas na het aanvinken", () => {
    const markup = formulier();
    for (const naam of [
      "afspraakLocatie",
      "afspraakDatum",
      "afspraakDagdeel",
      "afspraakAdres",
    ]) {
      expect(veld(markup, naam), naam).toBeUndefined();
    }
    expect(tekst(markup)).toMatch(/bevestigen de afspraak altijd persoonlijk/);
  });

  it("verbergt de honeypot voor mensen en hulpmiddelen", () => {
    const markup = formulier();
    const blok = markup.match(
      /<div\b[^>]*aria-hidden="true"[^>]*>(?:(?!<\/div>)[\s\S])*name="website"/,
    );
    expect(blok, "honeypot in een aria-hidden blok").not.toBeNull();
    expect(blok![0]).toMatch(/-left-\[9999px\]/);
  });
});

describe("versturen", () => {
  it("heeft een verzendknop die nog niet bezig is", () => {
    const markup = formulier();
    const knop = markup.match(/<button\b[^>]*\stype="submit"[^>]*>[^<]*/)?.[0];
    expect(knop).toBeDefined();
    expect(knop).not.toMatch(/\sdisabled=""/);
    expect(knop).toContain("Aanvraag versturen");
  });

  it("vertelt waarvoor de gegevens dienen, met een link naar de privacyverklaring", () => {
    const markup = formulier();
    expect(tekst(markup)).toContain(
      "We gebruiken je gegevens alleen om je aanvraag te beantwoorden.",
    );
    expect(markup).toMatch(/<a\b[^>]*href="\/privacy"/);
  });

  it("verstuurt alles in één formulier, zonder eigen adres of methode", () => {
    const markup = formulier();
    expect(markup.match(/<form\b/g)?.length).toBe(1);
    expect(markup).toMatch(/<form\b[^>]*\snovalidate=""/i);
  });
});

describe("na het versturen", () => {
  const ongeldig: VerwerkResultaat = {
    status: "ongeldig",
    bericht: "Controleer de gemarkeerde velden.",
    fouten: {
      telefoon: "Vul een geldig telefoonnummer in.",
      categorie: "Kies een categorie uit de lijst.",
      afspraakAdres: "Vul het adres in waar de afspraak plaatsvindt.",
    },
  };

  it("zet de fouten in de volgorde van het formulier, met links naar de velden", () => {
    const markup = formulier({ resultaat: ongeldig });
    const overzicht =
      markup.match(/<div\b[^>]*role="alert"[^>]*>[\s\S]*?<\/ul>/)?.[0] ?? "";
    const links = [...overzicht.matchAll(/href="#([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(links).toEqual(["categorie", "telefoon"]);
    // Het adresveld is niet in beeld: de melding staat er wel, zonder link.
    expect(tekst(overzicht)).toContain(
      "Vul het adres in waar de afspraak plaatsvindt.",
    );
    expect(markup).toMatch(/<div\b[^>]*role="alert"[^>]*tabindex="-1"/);
  });

  it("vraagt na een fout om de bestanden opnieuw te kiezen", () => {
    const markup = formulier({ resultaat: ongeldig });
    expect(tekst(markup)).toContain("Kies ze dan opnieuw");
  });

  it("geeft het bestandsveld de melding over de bestanden", () => {
    const markup = formulier({
      resultaat: {
        status: "ongeldig",
        bericht: "Controleer de velden.",
        fouten: { bestanden: "Je kunt maximaal 10 bestanden meesturen." },
      },
    });
    const tag = veld(markup, "bestanden")!;
    expect(attribuut(tag, "aria-invalid")).toBe("true");
    expect(attribuut(tag, "aria-describedby")).toContain("bestanden-fout");
  });

  it("houdt het formulier bij een fout bij het versturen", () => {
    const markup = formulier({
      categorie: "interieur",
      resultaat: { status: "fout", bericht: "Het versturen is niet gelukt." },
    });
    expect(markup).toMatch(/role="alert"/);
    expect(veld(markup, "naam")).toBeDefined();
    expect(veld(markup, "breedteCm")).toBeDefined();
    expect(markup).toContain(`href="${site.whatsapp}"`);
    expect(markup).toContain(`href="${site.telefoon.link}"`);
  });

  it("toont na een geslaagde aanvraag alleen de bevestiging", () => {
    const markup = formulier({
      resultaat: { status: "ok", bericht: "Bedankt, we hebben het." },
    });
    expect(markup).not.toMatch(/<form\b/);
    expect(markup).toMatch(/role="status"/);
    expect(tekst(markup)).toContain("Bedankt, we hebben het.");
    expect(markup).not.toMatch(/role="alert"/);
  });
});
