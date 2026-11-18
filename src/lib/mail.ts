/**
 * Mail versturen via een verwisselbaar transport.
 *
 * De rest van de code bouwt alleen `Mail`-objecten en geeft die aan een
 * `MailTransport`. Een echte verzenddienst (SMTP of een mail-API) komt later
 * als nieuw transport erbij; tot die tijd schrijft het standaardtransport
 * alleen een regel naar het log en verstuurt het niets.
 */

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

/** Het transport dat de offerte-actie gebruikt. Voorlopig alleen loggen. */
export const standaardTransport: MailTransport = logTransport();

export default standaardTransport;
