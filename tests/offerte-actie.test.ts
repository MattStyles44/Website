import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const verzoek = vi.hoisted(() => ({ headers: new Headers() }));

vi.mock("next/headers", () => ({
  headers: async () => verzoek.headers,
}));

import { verstuurOfferte } from "@/app/offerte/actions";

function formulier(extra: Record<string, string> = {}): FormData {
  const data = new FormData();
  const velden = {
    naam: "Kees Smit",
    email: "kees@smit.nl",
    telefoon: "0612345678",
    plaats: "Zwolle",
    categorie: "ontwerp",
    ...extra,
  };
  for (const [naam, waarde] of Object.entries(velden)) {
    data.append(naam, waarde);
  }
  return data;
}

let info: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  info = vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("verstuurOfferte", () => {
  it("verwerkt het formulier en verstuurt via het standaardtransport", async () => {
    verzoek.headers = new Headers({ "x-forwarded-for": "10.0.0.1" });
    const data = formulier();
    data.append(
      "bestanden",
      new File([new Uint8Array([1, 2, 3])], "logo.png", { type: "image/png" }),
    );
    data.append("bestanden", new File([], ""));
    data.append("andere", new File([new Uint8Array([1])], "virus.exe"));

    const resultaat = await verstuurOfferte(null, data);
    expect(resultaat.status).toBe("ok");
    // Twee mails: de aanvraag (met één bijlage) en de bevestiging.
    expect(info).toHaveBeenCalledTimes(2);
    expect(String(info.mock.calls[0]?.[0])).toContain("1 bijlage");
  });

  it("geeft veldfouten terug in de vorm van useActionState", async () => {
    verzoek.headers = new Headers({ "x-forwarded-for": "10.0.0.2" });
    const resultaat = await verstuurOfferte(
      { status: "ok", bericht: "vorige keer" },
      formulier({ email: "geen-adres" }),
    );
    expect(resultaat.status).toBe("ongeldig");
    if (resultaat.status === "ongeldig") {
      expect(resultaat.fouten.email).toBeDefined();
    }
  });

  it("weigert bestanden met een verkeerd type", async () => {
    verzoek.headers = new Headers({ "x-forwarded-for": "10.0.0.3" });
    const data = formulier();
    data.append("bestanden", new File([new Uint8Array([1])], "virus.exe"));
    const resultaat = await verstuurOfferte(null, data);
    expect(resultaat.status).toBe("ongeldig");
    if (resultaat.status === "ongeldig") {
      expect(resultaat.fouten.bestanden).toBeDefined();
    }
  });

  it("limiteert op het eerste IP-adres uit x-forwarded-for: 5 per uur", async () => {
    for (let i = 0; i < 5; i += 1) {
      verzoek.headers = new Headers({
        "x-forwarded-for": `203.0.113.7, 10.1.1.${i}`,
      });
      expect((await verstuurOfferte(null, formulier())).status).toBe("ok");
    }
    verzoek.headers = new Headers({
      "x-forwarded-for": " 203.0.113.7 ,192.168.0.1",
    });
    expect((await verstuurOfferte(null, formulier())).status).toBe("te-vaak");

    verzoek.headers = new Headers({ "x-forwarded-for": "198.51.100.1" });
    expect((await verstuurOfferte(null, formulier())).status).toBe("ok");
  });

  it("gebruikt 'onbekend' als er geen x-forwarded-for is", async () => {
    verzoek.headers = new Headers();
    for (let i = 0; i < 5; i += 1) {
      expect((await verstuurOfferte(null, formulier())).status).toBe("ok");
    }
    verzoek.headers = new Headers({ "x-forwarded-for": "" });
    expect((await verstuurOfferte(null, formulier())).status).toBe("te-vaak");
  });

  it("laat spam door zonder te mailen", async () => {
    verzoek.headers = new Headers({ "x-forwarded-for": "10.9.9.9" });
    const resultaat = await verstuurOfferte(
      null,
      formulier({ website: "https://spam.example" }),
    );
    expect(resultaat.status).toBe("ok");
    expect(info).not.toHaveBeenCalled();
  });
});
