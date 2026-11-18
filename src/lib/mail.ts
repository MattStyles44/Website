/**
 * Mail versturen via een verwisselbaar transport.
 *
 * De rest van de code bouwt alleen `Mail`-objecten en geeft die aan een
 * `MailTransport`. Staan `RESEND_API_KEY` en `MAIL_FROM` ingesteld
 * (src/env.ts), dan verstuurt het standaardtransport de mail via de API van
 * Resend. Zonder die twee schrijft het alleen een regel naar het log en
 * verstuurt het niets.
 */
import { env } from "@/env";

export interface Bijlage {
  naam: string;
  type: string;
  inhoud: Uint8Array;
}

export interface Mail {
  aan: string;
  antwoordAan?: string;
  onderwerp: string;
  tekst: string;
  html: string;
  bijlagen: Bijlage[];
}

export interface MailTransport {
  verstuur(mail: Mail): Promise<void>;
}

/** Bewaart verstuurde mails in het geheugen, voor tests. */
export function geheugenTransport(): MailTransport & { verstuurd: Mail[] } {
  const verstuurd: Mail[] = [];
  return {
    verstuurd,
    async verstuur(mail) {
      verstuurd.push(mail);
    },
  };
}

/** Schrijft per mail een samenvatting van één regel naar het log; verstuurt niets. */
export function logTransport(): MailTransport {
  return {
    async verstuur(mail) {
      const bijlagen = mail.bijlagen.length;
      console.info(
        enkeleRegel(
          `[mail niet verstuurd] aan: ${mail.aan} | onderwerp: ${mail.onderwerp} | ${bijlagen} ${bijlagen === 1 ? "bijlage" : "bijlagen"}`,
        ),
      );
    },
  };
}

function enkeleRegel(tekst: string): string {
  return tekst.replace(/\s+/g, " ").trim();
}

const resendUrl = "https://api.resend.com/emails";

/**
 * Verstuurt mail via de API van Resend: één POST per mail, zonder nieuwe
 * pogingen. Een foutstatus, een netwerkfout of een time-out geeft een
 * afgewezen promise; de foutmelding bevat nooit de API-sleutel.
 */
export function resendTransport(opties: {
  apiKey: string;
  /** De afzender: `adres@domein.tld` of `Naam <adres@domein.tld>`. */
  van: string;
  /** Standaard `globalThis.fetch`; tests geven een eigen fetch mee. */
  fetch?: typeof globalThis.fetch;
  /** Na zoveel milliseconden wordt het verzoek afgebroken. Standaard 15 seconden. */
  timeoutMs?: number;
}): MailTransport {
  const { apiKey, van, timeoutMs = 15_000 } = opties;
  const verzend: typeof globalThis.fetch =
    opties.fetch ?? ((invoer, init) => globalThis.fetch(invoer, init));

  return {
    async verstuur(mail) {
      const signaal = AbortSignal.timeout(timeoutMs);
      let antwoord: Response;
      try {
        antwoord = await verzend(resendUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resendLichaam(van, mail)),
          signal: signaal,
        });
      } catch (fout) {
        throw new Error(
          signaal.aborted
            ? `Resend: geen antwoord binnen ${timeoutMs} ms, mail niet verstuurd.`
            : "Resend: de API is niet bereikbaar, mail niet verstuurd.",
          { cause: fout },
        );
      }

      if (antwoord.ok) {
        // Het antwoord is niet nodig; de verbinding komt zo direct weer vrij.
        await antwoord.body?.cancel().catch(() => undefined);
        return;
      }
      const melding = verberg(await foutmelding(antwoord), apiKey);
      throw new Error(
        `Resend: mail niet verstuurd, status ${antwoord.status}${melding === "" ? "" : ` (${melding})`}.`,
      );
    },
  };
}

/** Het JSON-lichaam voor `POST /emails` van Resend. */
function resendLichaam(van: string, mail: Mail) {
  return {
    from: van,
    to: [mail.aan],
    subject: mail.onderwerp,
    text: mail.tekst,
    html: mail.html,
    ...(mail.antwoordAan !== undefined && { reply_to: mail.antwoordAan }),
    ...(mail.bijlagen.length > 0 && {
      attachments: mail.bijlagen.map((bijlage) => ({
        filename: bijlage.naam,
        content: base64(bijlage.inhoud),
        content_type: bijlage.type,
      })),
    }),
  };
}

function base64(inhoud: Uint8Array): string {
  return Buffer.from(
    inhoud.buffer,
    inhoud.byteOffset,
    inhoud.byteLength,
  ).toString("base64");
}

/** De foutmelding van Resend (`{ "message": ... }`), als het antwoord die heeft. */
async function foutmelding(antwoord: Response): Promise<string> {
  try {
    const data: unknown = await antwoord.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return enkeleRegel(data.message).slice(0, 200);
    }
  } catch {
    // Geen JSON: dan alleen de statuscode.
  }
  return "";
}

/** Haalt de API-sleutel uit een tekst, voor het geval die erin staat. */
function verberg(tekst: string, apiKey: string): string {
  return apiKey === "" ? tekst : tekst.replaceAll(apiKey, "[verborgen]");
}

/**
 * Kiest het transport bij de instellingen: Resend als `RESEND_API_KEY` en
 * `MAIL_FROM` allebei zijn ingevuld, en anders alleen loggen.
 */
export function kiesTransport(
  instellingen: { RESEND_API_KEY?: string; MAIL_FROM?: string },
  opties: { fetch?: typeof globalThis.fetch } = {},
): MailTransport {
  const apiKey = instellingen.RESEND_API_KEY?.trim();
  const van = instellingen.MAIL_FROM?.trim();
  if (!apiKey || !van) return logTransport();
  return resendTransport({ apiKey, van, fetch: opties.fetch });
}

/** Het transport dat de offerte-actie gebruikt: Resend als dat is ingesteld, anders alleen loggen. */
export const standaardTransport: MailTransport = kiesTransport(env);

export default standaardTransport;
