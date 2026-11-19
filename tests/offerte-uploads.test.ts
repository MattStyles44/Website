import { describe, expect, it } from "vitest";

import {
  gekozenBestanden,
  maxTotaleGrootte,
  valideerUploads,
  type Bestand,
} from "@/lib/offerte/uploads";
import { site } from "@/content/site";

const bestand = (naam: string, bytes = 1): Bestand => ({
  naam,
  type: "application/octet-stream",
  inhoud: new Uint8Array(bytes),
});

const leegVeld = bestand("", 0);

describe("valideerUploads", () => {
  it("kijkt naar de extensie, niet naar de rest van de naam", () => {
    expect(valideerUploads([bestand("logo.def.PNG")]).ok).toBe(true);
    expect(valideerUploads([bestand("pdf")]).ok).toBe(false);
    expect(valideerUploads([bestand("logo.pdf.exe")]).ok).toBe(false);
    expect(valideerUploads([bestand("logo.svg")]).ok).toBe(false);
    expect(valideerUploads([bestand("logo.")]).ok).toBe(false);
  });

  it("weigert een naamloos bestand met inhoud", () => {
    expect(valideerUploads([bestand("", 5)]).ok).toBe(false);
  });

  it("telt lege bestandsvelden niet mee voor het maximum", () => {
    const tien = Array.from({ length: 10 }, (_, i) => bestand(`f${i}.jpg`));
    expect(valideerUploads([...tien, leegVeld, leegVeld]).ok).toBe(true);
  });

  it("staat precies 4 MiB samen toe, en geen byte meer", () => {
    expect(valideerUploads([bestand("a.pdf", maxTotaleGrootte)]).ok).toBe(true);
    expect(valideerUploads([bestand("a.pdf", maxTotaleGrootte + 1)]).ok).toBe(
      false,
    );
  });

  it("wijst bij te grote bestanden de weg naar e-mail", () => {
    const resultaat = valideerUploads([bestand("a.pdf", maxTotaleGrootte + 1)]);
    expect(resultaat.ok).toBe(false);
    if (!resultaat.ok) {
      expect(resultaat.fout).toContain("4 MB");
      expect(resultaat.fout).toContain(site.email);
    }
  });

  it("geeft een Nederlandse melding die de klant met je aanspreekt", () => {
    const teVeel = Array.from({ length: 11 }, (_, i) => bestand(`f${i}.pdf`));
    const resultaat = valideerUploads(teVeel);
    expect(resultaat.ok).toBe(false);
    if (!resultaat.ok) expect(resultaat.fout).toMatch(/\bje\b/i);

    const verkeerd = valideerUploads([bestand("offerte.docx")]);
    expect(verkeerd.ok).toBe(false);
    if (!verkeerd.ok) expect(verkeerd.fout).toContain("offerte.docx");
  });
});

describe("gekozenBestanden", () => {
  it("laat alleen lege bestandsvelden weg", () => {
    const logo = bestand("logo.ai", 3);
    const leegMaarBenoemd = bestand("leeg.pdf", 0);
    expect(gekozenBestanden([leegVeld, logo, leegMaarBenoemd])).toEqual([
      logo,
      leegMaarBenoemd,
    ]);
  });
});
