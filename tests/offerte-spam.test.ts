import { describe, expect, it } from "vitest";

import { isSpam, maakRateLimiter } from "@/lib/offerte/spam";

describe("isSpam", () => {
  it("kijkt alleen naar het honeypotveld website", () => {
    expect(isSpam({ website: "a" })).toBe(true);
    expect(isSpam({ website: "\t\n " })).toBe(false);
    expect(isSpam({ naam: "http://spam", toelichting: "koop nu" })).toBe(false);
  });
});

describe("maakRateLimiter", () => {
  it("laat precies max verzoeken door binnen het venster", () => {
    const limiter = maakRateLimiter({ max: 3, vensterMs: 100 });
    expect([0, 10, 20, 30].map((nu) => limiter.magDoor("a", nu))).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });

  it("gebruikt het halfopen venster (nu - vensterMs, nu]", () => {
    const limiter = maakRateLimiter({ max: 1, vensterMs: 100 });
    expect(limiter.magDoor("a", 1000)).toBe(true);
    // 1000 valt nog in (999, 1099].
    expect(limiter.magDoor("a", 1099)).toBe(false);
    // 1000 valt niet meer in (1000, 1100].
    expect(limiter.magDoor("a", 1100)).toBe(true);
  });

  it("telt geweigerde verzoeken niet mee", () => {
    const limiter = maakRateLimiter({ max: 1, vensterMs: 100 });
    expect(limiter.magDoor("a", 0)).toBe(true);
    expect(limiter.magDoor("a", 50)).toBe(false);
    expect(limiter.magDoor("a", 99)).toBe(false);
    // Alleen het verzoek op 0 telde; dat valt nu buiten het venster.
    expect(limiter.magDoor("a", 100)).toBe(true);
  });

  it("houdt sleutels los van elkaar", () => {
    const limiter = maakRateLimiter({ max: 1, vensterMs: 1000 });
    expect(limiter.magDoor("a", 0)).toBe(true);
    expect(limiter.magDoor("b", 0)).toBe(true);
    expect(limiter.magDoor("a", 1)).toBe(false);
    expect(limiter.magDoor("b", 1)).toBe(false);
  });

  it("blijft goed werken na het opruimen van oude sleutels", () => {
    const limiter = maakRateLimiter({ max: 1, vensterMs: 10 });
    expect(limiter.magDoor("vast", 0)).toBe(true);
    for (let i = 0; i < 2500; i += 1) limiter.magDoor(`ip-${i}`, 5);
    expect(limiter.magDoor("vast", 6)).toBe(false);
    expect(limiter.magDoor("vast", 10)).toBe(true);
  });
});
