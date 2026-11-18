import { afterEach, describe, expect, it, vi } from "vitest";

import { site } from "@/content/site";
import { geheugenTransport, type Mail, type MailTransport } from "@/lib/mail";
import type { Velden } from "@/lib/offerte/aanvraag";
import { maakRateLimiter } from "@/lib/offerte/spam";
import type { Bestand } from "@/lib/offerte/uploads";
import { verwerkAanvraag } from "@/lib/offerte/verwerk";

const NU = new Date("2026-06-01T08:00:00Z");

const velden: Velden = {
  naam: "Sara Mulder",
  email: "sara@mulder.nl",
  telefoon: "+31 6 1234 5678",
  plaats: "Emmen",
  categorie: "interieur",
  dienst: "fotobehang",
  breedteCm: "450",
  hoogteCm: "270",
};

const pdf: Bestand = {
  naam: "wand.pdf",
  type: "application/pdf",
  inhoud: new Uint8Array([1]),
};

function opzet(max = 5) {
  const transport = geheugenTransport();
  const limiter = maakRateLimiter({ max, vensterMs: 60_000 });
  const magDoor = vi.spyOn(limiter, "magDoor");
  return { transport, limiter, magDoor, nu: NU };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("verwerkAanvraag", () => {
  it("verstuurt de interne mail met bijlagen en dan de bevestiging", async () => {
    const deps = opzet();
    const resultaat = await verwerkAanvraag(
      {
        velden,
        bestanden: [pdf, { naam: "", type: "", inhoud: new Uint8Array() }],
        ip: "1.1.1.1",
      },
      deps,
    );
    expect(resultaat.status).toBe("ok");
    expect(resultaat.bericht).toContain(site.reactiebelofte);
    const [intern, bevestiging] = deps.transport.verstuurd as [Mail, Mail];
    expect(intern.aan).toBe(site.email);
    expect(intern.antwoordAan).toBe("sara@mulder.nl");
    expect(intern.bijlagen).toEqual([pdf]);
    expect(bevestiging.aan).toBe("sara@mulder.nl");
    expect(deps.magDoor).toHaveBeenCalledWith("1.1.1.1", NU.getTime());
  });

  it("geeft een bestand zonder type een standaardtype mee", async () => {
    const deps = opzet();
    await verwerkAanvraag(
      {
        velden,
        bestanden: [{ naam: "logo.eps", type: "", inhoud: new Uint8Array(2) }],
        ip: "1",
      },
      deps,
    );
    expect(deps.transport.verstuurd[0]?.bijlagen[0]?.type).toBe(
      "application/octet-stream",
    );
  });

  it("raakt bij spam de limiter niet aan", async () => {
    const deps = opzet();
    const resultaat = await verwerkAanvraag(
      {
        velden: { ...velden, website: "spam.example" },
        bestanden: [],
        ip: "1",
      },
      deps,
    );
    expect(resultaat.status).toBe("ok");
    expect(deps.magDoor).not.toHaveBeenCalled();
    expect(deps.transport.verstuurd).toEqual([]);
  });

  it("controleert niets meer als de limiet is bereikt", async () => {
    const deps = opzet(0);
    const resultaat = await verwerkAanvraag(
      { velden: { ...velden, email: "" }, bestanden: [], ip: "1" },
      deps,
    );
    expect(resultaat.status).toBe("te-vaak");
    expect(resultaat).not.toHaveProperty("fouten");
    expect(resultaat.bericht).toContain(site.telefoon.weergave);
  });

  it("meldt veld- en bestandsfouten in één keer", async () => {
    const deps = opzet();
    const resultaat = await verwerkAanvraag(
      {
        velden: { ...velden, hoogteCm: "" },
        bestanden: [{ ...pdf, naam: "wand.tiff" }],
        ip: "1",
      },
      deps,
    );
    expect(resultaat.status).toBe("ongeldig");
    if (resultaat.status !== "ongeldig") return;
    expect(Object.keys(resultaat.fouten).sort()).toEqual([
      "bestanden",
      "hoogteCm",
    ]);
    expect(resultaat.bericht.trim()).not.toBe("");
    expect(deps.transport.verstuurd).toEqual([]);
  });

  it("verwijst naar WhatsApp of telefoon als de interne mail mislukt", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const transport: MailTransport = {
      verstuur: vi.fn().mockRejectedValue(new Error("verbinding weg")),
    };
    const resultaat = await verwerkAanvraag(
      { velden, bestanden: [], ip: "1" },
      { ...opzet(), transport },
    );
    expect(resultaat.status).toBe("fout");
    expect(resultaat.bericht).toMatch(/WhatsApp/);
    expect(resultaat.bericht).toContain(site.telefoon.weergave);
    expect(transport.verstuur).toHaveBeenCalledTimes(1);
  });

  it("geeft ook 'fout' als alleen de bevestiging mislukt", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const verstuurd: Mail[] = [];
    const transport: MailTransport = {
      async verstuur(mail) {
        if (mail.aan !== site.email) throw new Error("adres bestaat niet");
        verstuurd.push(mail);
      },
    };
    const resultaat = await verwerkAanvraag(
      { velden, bestanden: [], ip: "1" },
      { ...opzet(), transport },
    );
    expect(resultaat.status).toBe("fout");
    expect(resultaat.bericht).toMatch(/WhatsApp|bel/);
    expect(verstuurd).toHaveLength(1);
  });
});
