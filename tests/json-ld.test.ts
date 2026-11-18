import { describe, expect, it } from "vitest";

import { getCategorie, getDienst } from "@/content/diensten";
import { site, vestiging } from "@/content/site";
import {
  dienstJsonLd,
  kruimelpadJsonLd,
  organisatieId,
  organisatieJsonLd,
  serialiseerJsonLd,
  veelgesteldeVragenJsonLd,
  websiteJsonLd,
} from "@/lib/seo/json-ld";

const basis = "https://www.sign-up.nl";

describe("organisatie", () => {
  it("beschrijft SignUp met contactgegevens en werkgebied", () => {
    const data = organisatieJsonLd(basis, undefined);
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://www.sign-up.nl/#organisatie",
      name: site.naam,
      url: "https://www.sign-up.nl/",
      telephone: "+31651556433",
      email: site.email,
    });
    expect(data.areaServed).toEqual([
      { "@type": "AdministrativeArea", name: "Groningen" },
      { "@type": "AdministrativeArea", name: "Friesland" },
      { "@type": "AdministrativeArea", name: "Drenthe" },
    ]);
    expect(data).not.toHaveProperty("address");
  });

  it("wordt een lokaal bedrijf met adres zodra er een vestiging is", () => {
    const data = organisatieJsonLd(basis, {
      straat: "Voorbeeldstraat 1",
      postcode: "9700 AA",
      plaats: "Groningen",
    });
    expect(data["@type"]).toBe("LocalBusiness");
    expect(data.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Voorbeeldstraat 1",
      postalCode: "9700 AA",
      addressLocality: "Groningen",
      addressCountry: "NL",
    });
  });

  it("gebruikt het vestigingsadres uit de bedrijfsgegevens", () => {
    expect(vestiging).toBeDefined();
    expect(organisatieJsonLd(basis, vestiging)).toMatchObject({
      "@type": "LocalBusiness",
      address: {
        streetAddress: "Koldingweg 9",
        postalCode: "9723 HL",
        addressLocality: "Groningen",
      },
    });
  });

  it("koppelt de website aan de organisatie", () => {
    expect(websiteJsonLd(basis)).toMatchObject({
      "@type": "WebSite",
      inLanguage: "nl-NL",
      publisher: { "@id": organisatieId(basis) },
    });
  });
});

describe("dienst", () => {
  it("beschrijft de dienst en verwijst naar SignUp als aanbieder", () => {
    const categorie = getCategorie("raamfolie")!;
    const dienst = getDienst("raamfolie", "zandstraalfolie")!;
    const data = dienstJsonLd(
      categorie,
      dienst,
      "Privacyfolie.",
      "/diensten/raamfolie/zandstraalfolie",
      basis,
    );
    expect(data).toMatchObject({
      "@type": "Service",
      name: "Zandstraalfolie",
      category: "Raamfolies & glasdecoratie",
      description: "Privacyfolie.",
      url: "https://www.sign-up.nl/diensten/raamfolie/zandstraalfolie",
      provider: { "@id": "https://www.sign-up.nl/#organisatie" },
    });
  });

  it("zet veelgestelde vragen om naar een FAQPage", () => {
    expect(
      veelgesteldeVragenJsonLd([{ vraag: "Hoe lang?", antwoord: "Eén dag." }]),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Hoe lang?",
          acceptedAnswer: { "@type": "Answer", text: "Eén dag." },
        },
      ],
    });
    expect(veelgesteldeVragenJsonLd([])).toBeUndefined();
  });
});

describe("kruimelpad", () => {
  it("nummert de items en maakt absolute URL's, ook voor de huidige pagina", () => {
    const data = kruimelpadJsonLd(
      [
        { label: "Home", href: "/" },
        { label: "Diensten", href: "/diensten" },
        { label: "Gevelreclame" },
      ],
      "/diensten/gevelreclame",
      basis,
    );
    expect(data.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.sign-up.nl/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Diensten",
        item: "https://www.sign-up.nl/diensten",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Gevelreclame",
        item: "https://www.sign-up.nl/diensten/gevelreclame",
      },
    ]);
  });
});

describe("serialiseren", () => {
  it("escapet < zodat tekst uit het CMS de script-tag niet kan sluiten", () => {
    const json = serialiseerJsonLd({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      name: "</script><script>alert(1)</script>",
    });
    expect(json).not.toContain("<");
    expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
  });
});
