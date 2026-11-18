/**
 * Verwerkt een offerteaanvraag: spamcontrole, rate limit, validatie en de twee
 * e-mails. Alles wat van buiten komt (transport, limiter, tijd) wordt
 * meegegeven, zodat de verwerking los te testen is.
 */
import { site } from "@/content/site";
import type { Bijlage, MailTransport } from "@/lib/mail";
import {
  parseAanvraag,
  type Fouten,
  type Velden,
} from "@/lib/offerte/aanvraag";
import { maakBevestigingsMail, maakInterneMail } from "@/lib/offerte/emails";
import { isSpam } from "@/lib/offerte/spam";
import {
  gekozenBestanden,
  valideerUploads,
  type Bestand,
} from "@/lib/offerte/uploads";

export type VerwerkResultaat =
  | { status: "ok"; bericht: string }
  | { status: "ongeldig"; bericht: string; fouten: Fouten }
  | { status: "te-vaak"; bericht: string }
  | { status: "fout"; bericht: string };

const berichten = {
  ok: `Bedankt, we hebben je aanvraag ontvangen. Je krijgt een bevestiging per e-mail. ${site.reactiebelofte}.`,
  ongeldig:
    "Niet alle velden zijn goed ingevuld. Controleer de velden met een melding en verstuur je aanvraag opnieuw.",
  teVaak: `Je hebt in korte tijd al een paar aanvragen verstuurd. Probeer het later opnieuw, of stuur een WhatsApp of bel ${site.telefoon.weergave}.`,
  nietVerstuurd: `Het versturen van je aanvraag is niet gelukt. Stuur je aanvraag via WhatsApp of bel ${site.telefoon.weergave}.`,
  geenBevestiging: `We hebben je aanvraag ontvangen, maar konden je geen bevestiging mailen. Twijfel je? Stuur een WhatsApp of bel ${site.telefoon.weergave}.`,
} as const;

function alsBijlage(bestand: Bestand): Bijlage {
  return {
    naam: bestand.naam,
    type: bestand.type === "" ? "application/octet-stream" : bestand.type,
    inhoud: bestand.inhoud,
  };
}

export async function verwerkAanvraag(
  invoer: { velden: Velden; bestanden: Bestand[]; ip: string },
  deps: {
    transport: MailTransport;
    limiter: { magDoor(sleutel: string, nu: number): boolean };
    nu: Date;
  },
): Promise<VerwerkResultaat> {
  // 1. Spam: doen alsof alles goed ging, zonder te mailen of de limiet te gebruiken.
  if (isSpam(invoer.velden)) {
    return { status: "ok", bericht: berichten.ok };
  }

  // 2. Rate limit: elke andere aanvraag telt mee, geldig of niet.
  if (!deps.limiter.magDoor(invoer.ip, deps.nu.getTime())) {
    return { status: "te-vaak", bericht: berichten.teVaak };
  }

  // 3. Velden en bestanden samen controleren, zodat alle meldingen in één keer komen.
  const aanvraag = parseAanvraag(invoer.velden, { nu: deps.nu });
  const uploads = valideerUploads(invoer.bestanden);
  if (!aanvraag.ok || !uploads.ok) {
    const fouten: Fouten = {
      ...(aanvraag.ok ? {} : aanvraag.fouten),
      ...(uploads.ok ? {} : { bestanden: uploads.fout }),
    };
    return { status: "ongeldig", bericht: berichten.ongeldig, fouten };
  }

  // 4. Eerst de aanvraag naar SignUp, daarna de bevestiging naar de klant.
  const bijlagen = gekozenBestanden(invoer.bestanden).map(alsBijlage);
  try {
    await deps.transport.verstuur(maakInterneMail(aanvraag.aanvraag, bijlagen));
  } catch (fout) {
    console.error("Offerteaanvraag: interne mail niet verstuurd.", fout);
    return { status: "fout", bericht: berichten.nietVerstuurd };
  }
  try {
    await deps.transport.verstuur(maakBevestigingsMail(aanvraag.aanvraag));
  } catch (fout) {
    console.error("Offerteaanvraag: bevestigingsmail niet verstuurd.", fout);
    return { status: "fout", bericht: berichten.geenBevestiging };
  }

  return { status: "ok", bericht: berichten.ok };
}
