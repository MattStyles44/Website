import { afterEach, describe, expect, it, vi } from "vitest";

import { parseEnv } from "@/env";
import {
  kiesTransport,
  resendTransport,
  type Bijlage,
  type Mail,
} from "@/lib/mail";

// Een nepsleutel: tests gebruiken nooit een echte API-sleutel.
const SLEUTEL = "re_nep_123";

const bijlage: Bijlage = {
  naam: "logo.png",
  type: "image/png",
  inhoud: new Uint8Array([137, 80, 78, 71, 0, 255]),
};

const mail: Mail = {
  aan: "klant@voorbeeld.nl",
  antwoordAan: "info@voorbeeld.nl",
  onderwerp: "Je aanvraag",
  tekst: "Hallo",
  html: "<p>Hallo</p>",
  bijlagen: [bijlage],
};

interface Aanroep {
  url: string;
  init: RequestInit;
}

function nepFetch(status = 200, antwoord: unknown = { id: "123" }) {
  const aanroepen: Aanroep[] = [];
  const fetch = vi.fn(
    async (url: string | URL | Request, init?: RequestInit) => {
      aanroepen.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify(antwoord), { status });
    },
  );
  return { fetch: fetch as unknown as typeof globalThis.fetch, aanroepen };
}

function lichaam(aanroep: Aanroep | undefined): Record<string, unknown> {
  return JSON.parse(String(aanroep?.init.body)) as Record<string, unknown>;
}

async function fout(belofte: Promise<unknown>): Promise<Error> {
  try {
    await belofte;
  } catch (error) {
    if (error instanceof Error) return error;
    throw new Error(`Geen Error: ${String(error)}`);
  }
  throw new Error("De belofte werd niet afgewezen.");
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("resendTransport", () => {
  it("doet één POST met sleutel, JSON en een afbreeksignaal", async () => {
    const { fetch, aanroepen } = nepFetch();
    await resendTransport({
      apiKey: SLEUTEL,
      van: "SignUp Reclame <offerte@voorbeeld.nl>",
      fetch,
    }).verstuur(mail);

    expect(aanroepen).toHaveLength(1);
    const [aanroep] = aanroepen;
    expect(aanroep?.url).toBe("https://api.resend.com/emails");
    expect(aanroep?.init.method).toBe("POST");
    const koppen = new Headers(aanroep?.init.headers);
    expect(koppen.get("authorization")).toBe(`Bearer ${SLEUTEL}`);
    expect(koppen.get("content-type")).toBe("application/json");
    expect(aanroep?.init.signal).toBeInstanceOf(AbortSignal);
  });

  it("zet afzender, ontvanger, inhoud, antwoordadres en bijlagen in het lichaam", async () => {
    const { fetch, aanroepen } = nepFetch();
    await resendTransport({
      apiKey: SLEUTEL,
      van: "offerte@voorbeeld.nl",
      fetch,
    }).verstuur(mail);

    expect(lichaam(aanroepen[0])).toEqual({
      from: "offerte@voorbeeld.nl",
      to: ["klant@voorbeeld.nl"],
      reply_to: "info@voorbeeld.nl",
      subject: "Je aanvraag",
      text: "Hallo",
      html: "<p>Hallo</p>",
      attachments: [
        {
          filename: "logo.png",
          content: "iVBORwD/",
          content_type: "image/png",
        },
      ],
    });
  });

  it("codeert alleen de bytes van de bijlage zelf, ook bij een deel van een buffer", async () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5, 6]);
    const deel: Bijlage = {
      naam: "deel.pdf",
      type: "application/pdf",
      inhoud: buffer.subarray(2, 5),
    };
    const { fetch, aanroepen } = nepFetch();
    await resendTransport({ apiKey: SLEUTEL, van: "a@b.nl", fetch }).verstuur({
      ...mail,
      bijlagen: [deel, bijlage],
    });
    const attachments = lichaam(aanroepen[0]).attachments as Array<{
      content: string;
    }>;
    expect(attachments.map((a) => a.content)).toEqual([
      Buffer.from([3, 4, 5]).toString("base64"),
      Buffer.from(bijlage.inhoud).toString("base64"),
    ]);
  });

  it("laat reply_to en attachments weg als ze er niet zijn", async () => {
    const { fetch, aanroepen } = nepFetch();
    await resendTransport({ apiKey: SLEUTEL, van: "a@b.nl", fetch }).verstuur({
      ...mail,
      antwoordAan: undefined,
      bijlagen: [],
    });
    const body = lichaam(aanroepen[0]);
    expect(body).not.toHaveProperty("reply_to");
    expect(body).not.toHaveProperty("attachments");
  });

  it("wijst een foutstatus af met de status en de melding, zonder de sleutel", async () => {
    const { fetch } = nepFetch(403, {
      name: "invalid_api_key",
      message: `API key ${SLEUTEL} is invalid`,
    });
    const error = await fout(
      resendTransport({ apiKey: SLEUTEL, van: "a@b.nl", fetch }).verstuur(mail),
    );
    expect(error.message).toContain("403");
    expect(error.message).toContain("is invalid");
    expect(error.message).not.toContain(SLEUTEL);
  });

  it("wijst een foutstatus zonder JSON af met alleen de status", async () => {
    const fetch = vi.fn(
      async () => new Response("Bad Gateway", { status: 502 }),
    ) as unknown as typeof globalThis.fetch;
    const error = await fout(
      resendTransport({ apiKey: SLEUTEL, van: "a@b.nl", fetch }).verstuur(mail),
    );
    expect(error.message).toContain("502");
    expect(error.message).not.toContain(SLEUTEL);
  });

  it("wijst een netwerkfout af, met de oorzaak erbij", async () => {
    const oorzaak = new TypeError("fetch failed");
    const fetch = vi.fn(async () => {
      throw oorzaak;
    }) as unknown as typeof globalThis.fetch;
    const error = await fout(
      resendTransport({ apiKey: SLEUTEL, van: "a@b.nl", fetch }).verstuur(mail),
    );
    expect(error.cause).toBe(oorzaak);
    expect(error.message).not.toContain(SLEUTEL);
  });

  it("breekt het verzoek af na timeoutMs", async () => {
    const fetch = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(init.signal?.reason),
          );
        }),
    ) as unknown as typeof globalThis.fetch;
    const error = await fout(
      resendTransport({
        apiKey: SLEUTEL,
        van: "a@b.nl",
        fetch,
        timeoutMs: 20,
      }).verstuur(mail),
    );
    expect(error.message).toContain("20 ms");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("gebruikt globalThis.fetch als er geen fetch is meegegeven", async () => {
    const { fetch, aanroepen } = nepFetch();
    vi.stubGlobal("fetch", fetch);
    await resendTransport({ apiKey: SLEUTEL, van: "a@b.nl" }).verstuur(mail);
    expect(aanroepen).toHaveLength(1);
  });
});

describe("kiesTransport", () => {
  it("gebruikt Resend met beide instellingen", async () => {
    const { fetch, aanroepen } = nepFetch();
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await kiesTransport(
      { RESEND_API_KEY: SLEUTEL, MAIL_FROM: "SignUp <offerte@voorbeeld.nl>" },
      { fetch },
    ).verstuur(mail);
    expect(aanroepen).toHaveLength(1);
    expect(lichaam(aanroepen[0]).from).toBe("SignUp <offerte@voorbeeld.nl>");
    expect(info).not.toHaveBeenCalled();
  });

  it("logt alleen als een instelling ontbreekt of leeg is", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const { fetch, aanroepen } = nepFetch();
    for (const instellingen of [
      {},
      { RESEND_API_KEY: SLEUTEL },
      { MAIL_FROM: "a@b.nl" },
      { RESEND_API_KEY: " ", MAIL_FROM: "a@b.nl" },
      { RESEND_API_KEY: SLEUTEL, MAIL_FROM: "" },
    ]) {
      await kiesTransport(instellingen, { fetch }).verstuur(mail);
    }
    expect(aanroepen).toHaveLength(0);
    expect(info).toHaveBeenCalledTimes(5);
  });
});

describe("mailinstellingen in parseEnv", () => {
  it("zijn optioneel", () => {
    const env = parseEnv({});
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.MAIL_FROM).toBeUndefined();
  });

  it("accepteren een sleutel en beide vormen van de afzender", () => {
    expect(parseEnv({ RESEND_API_KEY: "re_Abc_09" }).RESEND_API_KEY).toBe(
      "re_Abc_09",
    );
    expect(parseEnv({ MAIL_FROM: "offerte@sign-up.nl" }).MAIL_FROM).toBe(
      "offerte@sign-up.nl",
    );
    expect(
      parseEnv({ MAIL_FROM: "SignUp Reclame <offerte@sign-up.nl>" }).MAIL_FROM,
    ).toBe("SignUp Reclame <offerte@sign-up.nl>");
  });

  it("tellen lege waarden als niet ingevuld", () => {
    const env = parseEnv({ RESEND_API_KEY: "  ", MAIL_FROM: "" });
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.MAIL_FROM).toBeUndefined();
  });

  it("weigeren een ongeldige sleutel, zonder de waarde te tonen", () => {
    for (const sleutel of ["abc_123", "re_", "re_met-streepje", "re_ spatie"]) {
      expect(() => parseEnv({ RESEND_API_KEY: sleutel })).toThrow(
        /RESEND_API_KEY/,
      );
    }
    expect(() => parseEnv({ RESEND_API_KEY: "re_met-streepje" })).not.toThrow(
      /re_met-streepje/,
    );
  });

  it("weigeren een ongeldige afzender", () => {
    for (const afzender of [
      "geen adres",
      "offerte@",
      "<offerte@sign-up.nl>",
      "SignUp <geen adres>",
      "SignUp offerte@sign-up.nl",
      "Sign\nUp <offerte@sign-up.nl>",
    ]) {
      expect(() => parseEnv({ MAIL_FROM: afzender }), afzender).toThrow(
        /MAIL_FROM/,
      );
    }
  });
});
