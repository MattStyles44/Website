import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag }));

const geheim = "test-geheim-voor-de-webhook-1234";
const inhoud = JSON.stringify({ _type: "dienst", _id: "dienst-ontwerp-dtp" });

/** Laadt de route opnieuw, zodat src/env.ts de omgeving opnieuw inleest. */
async function laadRoute(webhookGeheim: string | undefined) {
  vi.resetModules();
  vi.stubEnv("SANITY_WEBHOOK_SECRET", webhookGeheim ?? "");
  return import("@/app/api/revalidate/route");
}

function verzoek(headers: Record<string, string>, body = inhoud) {
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

describe("POST /api/revalidate", () => {
  beforeEach(() => revalidateTag.mockClear());
  afterEach(() => vi.unstubAllEnvs());

  it("ververst de Sanity-inhoud bij een geldige handtekening", async () => {
    const { POST } = await laadRoute(geheim);
    const handtekening = await encodeSignatureHeader(
      inhoud,
      Date.now(),
      geheim,
    );

    const antwoord = await POST(
      verzoek({ [SIGNATURE_HEADER_NAME]: handtekening }),
    );

    expect(antwoord.status).toBe(200);
    expect(await antwoord.json()).toEqual({ ververst: true });
    expect(revalidateTag).toHaveBeenCalledWith("sanity", { expire: 0 });
  });

  it("weigert een verzoek zonder of met een verkeerde handtekening", async () => {
    const { POST } = await laadRoute(geheim);
    const fout = await encodeSignatureHeader(
      inhoud,
      Date.now(),
      "een-ander-geheim-123456",
    );

    expect((await POST(verzoek({}))).status).toBe(401);
    expect(
      (await POST(verzoek({ [SIGNATURE_HEADER_NAME]: fout }))).status,
    ).toBe(401);
    expect(
      (await POST(verzoek({ [SIGNATURE_HEADER_NAME]: "onzin" }))).status,
    ).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("weigert een gewijzigde inhoud met een oude handtekening", async () => {
    const { POST } = await laadRoute(geheim);
    const handtekening = await encodeSignatureHeader(
      inhoud,
      Date.now(),
      geheim,
    );

    const antwoord = await POST(
      verzoek({ [SIGNATURE_HEADER_NAME]: handtekening }, '{"_type":"project"}'),
    );
    expect(antwoord.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("geeft 503 als er geen webhookgeheim is ingesteld", async () => {
    const { POST } = await laadRoute(undefined);
    const antwoord = await POST(
      verzoek({ [SIGNATURE_HEADER_NAME]: "t=1,v1=x" }),
    );
    expect(antwoord.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
