import { afterEach, describe, expect, it, vi } from "vitest";

import { site } from "@/content/site";
import mailStandaard, {
  geheugenTransport,
  logTransport,
  standaardTransport,
  type Bijlage,
} from "@/lib/mail";
import { parseAanvraag, type Aanvraag } from "@/lib/offerte/aanvraag";
import {
  escapeHtml,
  maakBevestigingsMail,
  maakInterneMail,
} from "@/lib/offerte/emails";

const NU = new Date("2026-12-01T10:00:00Z");

function aanvraag(velden: Record<string, string>): Aanvraag {
  const resultaat = parseAanvraag(velden, { nu: NU });
  if (!resultaat.ok) throw new Error(JSON.stringify(resultaat.fouten));
  return resultaat.aanvraag;
}

const volledig = aanvraag({
  naam: "Piet Bakker",
  bedrijfsnaam: "Bakker & Zn",
  email: "piet@bakker.nl",
  telefoon: "0501234567",
  plaats: "Leeuwarden",
  toelichting: 'Graag een "strak" ontwerp.\nMet logo\'s.',
  categorie: "raamfolie",
  dienst: "zandstraalfolie",
  breedteCm: "120,5",
  hoogteCm: "210",
  aantalRamen: "6",
  zijde: "binnen",
  afspraak: "ja",
  afspraakLocatie: "locatie",
  afspraakDatum: "2026-12-03",
  afspraakDagdeel: "ochtend",
  afspraakAdres: "Nieuwestad 10, Leeuwarden",
});

const bijlage: Bijlage = {
  naam: "<plan>.pdf",
  type: "application/pdf",
  inhoud: new Uint8Array(4),
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("escapeHtml", () => {
  it("ontsnapt de vijf speciale tekens", () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;",
    );
  });
});

describe("maakInterneMail", () => {
  const mail = maakInterneMail(volledig, [bijlage]);

  it("bevat elke ingevulde waarde, in tekst en html", () => {
    const waarden = [
      "Piet Bakker",
      "piet@bakker.nl",
      "0501234567",
      "Leeuwarden",
      "Raamfolies",
      "Zandstraalfolie",
      "120,5",
      "210",
      "6",
      "binnen",
      "op locatie",
      "2026-12-03",
      "ochtend",
      "Nieuwestad 10, Leeuwarden",
    ];
    for (const waarde of waarden) {
      expect(mail.tekst, waarde).toContain(waarde);
      expect(mail.html, waarde).toContain(waarde);
    }
    expect(mail.tekst).toContain("Bakker & Zn");
    expect(mail.html).toContain("Bakker &amp; Zn");
    expect(mail.tekst).toContain('Graag een "strak" ontwerp.');
    expect(mail.html).toContain("Graag een &quot;strak&quot; ontwerp.");
    expect(mail.html).toContain("logo&#39;s");
  });

  it("noemt de bijlagen, ontsnapt in html", () => {
    expect(mail.tekst).toContain("<plan>.pdf");
    expect(mail.html).toContain("&lt;plan&gt;.pdf");
    expect(mail.html).not.toContain("<plan>");
  });

  it("geeft geen GROTE KLUS bij raamfolie", () => {
    expect(mail.onderwerp).not.toContain("GROTE KLUS");
    expect(mail.onderwerp).toContain("Raamfolies & glasdecoratie");
    expect(mail.onderwerp).toContain("Piet Bakker");
  });

  it("zet geen regeleinden in het onderwerp", () => {
    const metEnter = { ...volledig, naam: "Piet\r\nBcc: iemand@x.nl" };
    const onderwerp = maakInterneMail(metEnter, []).onderwerp;
    expect(onderwerp).not.toMatch(/[\r\n]/);
  });

  it("markeert een gevelproject als grote klus", () => {
    const gevel = aanvraag({
      naam: "Piet Bakker",
      email: "piet@bakker.nl",
      telefoon: "0501234567",
      plaats: "Leeuwarden",
      categorie: "gevelreclame",
      breedteCm: "500",
      hoogteCm: "100",
    });
    expect(maakInterneMail(gevel, []).onderwerp).toMatch(/^\[GROTE KLUS\] /);
  });
});

describe("maakBevestigingsMail", () => {
  const mail = maakBevestigingsMail(volledig);

  it("gaat naar de klant, met antwoorden naar SignUp", () => {
    expect(mail.aan).toBe("piet@bakker.nl");
    expect(mail.antwoordAan).toBe(site.email);
    expect(mail.onderwerp).toBe("We hebben je aanvraag ontvangen");
    expect(mail.bijlagen).toEqual([]);
  });

  it("vat de aanvraag samen en noemt WhatsApp en telefoon", () => {
    for (const tekst of [mail.tekst, mail.html]) {
      expect(tekst).toContain("Piet Bakker");
      expect(tekst).toContain(site.reactiebelofte);
      expect(tekst).toContain("Zandstraalfolie");
      expect(tekst).toContain("2026-12-03");
      expect(tekst).toContain(site.telefoon.weergave);
      expect(tekst).toContain("WhatsApp");
    }
  });

  it("herhaalt de vrije toelichting niet", () => {
    expect(mail.tekst).not.toContain("strak");
    expect(mail.html).not.toContain("strak");
  });
});

describe("transports", () => {
  it("geheugentransport bewaart mails in volgorde", async () => {
    const transport = geheugenTransport();
    const een = maakInterneMail(volledig, []);
    const twee = maakBevestigingsMail(volledig);
    await transport.verstuur(een);
    await transport.verstuur(twee);
    expect(transport.verstuurd).toEqual([een, twee]);
  });

  it("logtransport logt één regel en verstuurt niets", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await logTransport().verstuur(maakInterneMail(volledig, [bijlage]));
    expect(info).toHaveBeenCalledTimes(1);
    const regel = String(info.mock.calls[0]?.[0]);
    expect(regel).toContain(site.email);
    expect(regel).toContain("1 bijlage");
    expect(regel).not.toMatch(/\n/);
  });

  it("het standaardtransport is het logtransport", async () => {
    expect(mailStandaard).toBe(standaardTransport);
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await standaardTransport.verstuur(maakBevestigingsMail(volledig));
    expect(info).toHaveBeenCalledTimes(1);
  });
});
