import { describe, expect, it } from "vitest";

import { vestiging } from "@/content/site";
import {
  huidigeLink,
  maandEnJaar,
  metHoofdletter,
  routeplannerLink,
} from "@/lib/weergave";

describe("huidige pagina in het menu", () => {
  it("markeert de link naar precies deze pagina als page", () => {
    expect(huidigeLink("/diensten", "/diensten")).toBe("page");
    expect(huidigeLink("/diensten/", "/diensten")).toBe("page");
    expect(huidigeLink("/", "/")).toBe("page");
  });

  it("markeert de link boven een onderliggende pagina als true", () => {
    expect(huidigeLink("/diensten/voertuigreclame", "/diensten")).toBe("true");
    expect(
      huidigeLink("/diensten/voertuigreclame/carwrapping", "/diensten"),
    ).toBe("true");
  });

  it("markeert niets bij een andere pagina of zonder pad", () => {
    expect(huidigeLink("/projecten", "/diensten")).toBeUndefined();
    // Alleen hele segmenten: /dienstenlijst ligt niet onder /diensten.
    expect(huidigeLink("/dienstenlijst", "/diensten")).toBeUndefined();
    // De homepage is nooit de bovenliggende pagina van alles.
    expect(huidigeLink("/contact", "/")).toBeUndefined();
    expect(huidigeLink(null, "/diensten")).toBeUndefined();
    expect(huidigeLink(undefined, "/diensten")).toBeUndefined();
  });
});

describe("datums van projecten", () => {
  it("toont maand en jaar in het Nederlands", () => {
    expect(maandEnJaar("2026-10-01")).toBe("oktober 2026");
    expect(maandEnJaar("2025-01-31")).toBe("januari 2025");
  });

  it("geeft een lege tekst bij een onleesbare datum", () => {
    expect(maandEnJaar("geen datum")).toBe("");
  });
});

describe("teksthulp", () => {
  it("maakt de eerste letter een hoofdletter", () => {
    expect(metHoofdletter("autobelettering en wraps")).toBe(
      "Autobelettering en wraps",
    );
    expect(metHoofdletter("")).toBe("");
  });
});

describe("routeplanner", () => {
  it("is een gewone https-link met het adres als bestemming", () => {
    expect(vestiging).toBeDefined();
    const url = new URL(routeplannerLink(vestiging!));
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("destination")).toBe(
      `${vestiging!.straat}, ${vestiging!.postcode} ${vestiging!.plaats}`,
    );
  });
});
