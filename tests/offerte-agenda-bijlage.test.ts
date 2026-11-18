import { afterEach, describe, expect, it, vi } from "vitest";

import { site } from "@/content/site";
import { geheugenTransport, type Bijlage, type Mail } from "@/lib/mail";
import { parseAanvraag, type Aanvraag } from "@/lib/offerte/aanvraag";
import { maakAfspraakIcs } from "@/lib/offerte/agenda";
import { maakBevestigingsMail, maakInterneMail } from "@/lib/offerte/emails";
import { maxTotaleGrootte } from "@/lib/offerte/uploads";
import { verwerkAanvraag } from "@/lib/offerte/verwerk";

import nextConfig from "../next.config";

const NU = new Date("2026-05-04T12:00:00Z");

const zonderAfspraak: Record<string, string> = {
  naam: "Kees Smit",
  email: "kees@smit.nl",
  telefoon: "0591123456",
  plaats: "Emmen",
  categorie: "ontwerp",
};

const metAfspraak: Record<string, string> = {
  ...zonderAfspraak,
  afspraak: "ja",
  afspraakLocatie: "werkplaats",
  afspraakDatum: "2026-05-11",
  afspraakDagdeel: "middag",
};

function aanvraag(velden: Record<string, string>): Aanvraag {
  const resultaat = parseAanvraag(velden, { nu: NU });
  if (!resultaat.ok) throw new Error(JSON.stringify(resultaat.fouten));
  return resultaat.aanvraag;
}

const logo: Bijlage = {
  naam: "logo.ai",
  type: "application/postscript",
  inhoud: new Uint8Array([1, 2, 3]),
};

afterEach(() => {
  vi.useRealTimers();
});

describe("agendabestand in de interne mail", () => {
  it("komt na de bestanden van de klant, als UTF-8-bytes van het agendabestand", () => {
    const mail = maakInterneMail(aanvraag(metAfspraak), [logo], { nu: NU });
    expect(mail.bijlagen.map((b) => b.naam)).toEqual([
      "logo.ai",
      "afspraakverzoek.ics",
    ]);
    const ics = mail.bijlagen[1];
    expect(ics?.type).toMatch(/^text\/calendar/);
    expect(new TextDecoder().decode(ics?.inhoud)).toBe(
      maakAfspraakIcs(aanvraag(metAfspraak), { nu: NU }),
    );
  });

  it("noemt het agendabestand in tekst en html", () => {
    const mail = maakInterneMail(aanvraag(metAfspraak), [], { nu: NU });
    expect(mail.tekst).toContain("afspraakverzoek.ics");
    expect(mail.html).toContain("afspraakverzoek.ics");
    expect(mail.tekst).not.toContain("Bijlagen: geen");
  });

  it("verandert niets aan een aanvraag zonder afspraak", () => {
    const bijlagen = [logo];
    const mail = maakInterneMail(aanvraag(zonderAfspraak), bijlagen, {
      nu: NU,
    });
    expect(mail.bijlagen).toBe(bijlagen);
    expect(mail.tekst).not.toContain(".ics");
    expect(mail.html).not.toContain(".ics");
    expect(maakInterneMail(aanvraag(zonderAfspraak), []).tekst).toContain(
      "Bijlagen: geen",
    );
  });

  it("gebruikt standaard de huidige tijd als stempel", () => {
    vi.useFakeTimers({ now: new Date("2026-05-05T08:09:10Z") });
    const mail = maakInterneMail(aanvraag(metAfspraak), []);
    const tekst = new TextDecoder().decode(mail.bijlagen[0]?.inhoud);
    expect(tekst).toContain("\r\nDTSTAMP:20260505T080910Z\r\n");
  });

  it("komt nooit in de bevestiging voor de klant", () => {
    const mail = maakBevestigingsMail(aanvraag(metAfspraak));
    expect(mail.bijlagen).toEqual([]);
    expect(mail.tekst).not.toContain(".ics");
  });
});

describe("verwerkAanvraag met een afspraakverzoek", () => {
  it("geeft de tijd van de aanvraag door aan het agendabestand", async () => {
    const transport = geheugenTransport();
    const pdf = {
      naam: "schets.pdf",
      type: "application/pdf",
      inhoud: new Uint8Array([37, 80, 68, 70]),
    };
    const resultaat = await verwerkAanvraag(
      { velden: metAfspraak, bestanden: [pdf], ip: "9.9.9.9" },
      { transport, limiter: { magDoor: () => true }, nu: NU },
    );
    expect(resultaat.status).toBe("ok");
    const [intern, bevestiging] = transport.verstuurd as [Mail, Mail];
    expect(intern.aan).toBe(site.email);
    expect(intern.bijlagen.map((b) => b.naam)).toEqual([
      "schets.pdf",
      "afspraakverzoek.ics",
    ]);
    expect(new TextDecoder().decode(intern.bijlagen[1]?.inhoud)).toBe(
      maakAfspraakIcs(aanvraag(metAfspraak), { nu: NU }),
    );
    expect(bevestiging.bijlagen).toEqual([]);
  });
});

describe("uploadlimiet voor Server Actions", () => {
  it("laat alle toegestane bestanden plus formulier-overhead door, maar niet veel meer", () => {
    const limiet = nextConfig.experimental?.serverActions?.bodySizeLimit;
    expect(limiet).toBe("21mb");
    const bytes = 21 * 1024 * 1024;
    expect(bytes).toBeGreaterThanOrEqual(maxTotaleGrootte + 64 * 1024);
    expect(bytes).toBeLessThanOrEqual(32 * 1024 * 1024);
  });
});
