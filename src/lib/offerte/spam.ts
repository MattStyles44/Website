import type { Velden } from "@/lib/offerte/aanvraag";

/** Naam van het honeypotveld: onzichtbaar voor mensen, bots vullen het in. */
export const honeypotVeld = "website";

export function isSpam(velden: Velden): boolean {
  if (!Object.hasOwn(velden, honeypotVeld)) return false;
  const waarde = velden[honeypotVeld];
  return typeof waarde === "string" && waarde.trim() !== "";
}

/**
 * Eenvoudige rate limiter in het geheugen. Een verzoek mag door als er voor
 * dezelfde sleutel minder dan `max` verzoeken zijn doorgelaten in het venster
 * `(nu - vensterMs, nu]`. Geweigerde verzoeken tellen niet mee.
 */
export function maakRateLimiter(opties: { max: number; vensterMs: number }): {
  magDoor(sleutel: string, nu: number): boolean;
} {
  const doorgelaten = new Map<string, number[]>();
  let sindsOpruimen = 0;

  // Vergeet sleutels zonder recente verzoeken, zodat het geheugen niet blijft groeien.
  function ruimOp(grens: number) {
    for (const [sleutel, tijden] of doorgelaten) {
      if (tijden.every((tijd) => tijd <= grens)) doorgelaten.delete(sleutel);
    }
  }

  return {
    magDoor(sleutel, nu) {
      const grens = nu - opties.vensterMs;

      sindsOpruimen += 1;
      if (sindsOpruimen >= 1000) {
        sindsOpruimen = 0;
        ruimOp(grens);
      }

      // Tijden op of voor de grens tellen nooit meer mee.
      const tijden = (doorgelaten.get(sleutel) ?? []).filter(
        (tijd) => tijd > grens,
      );
      const inVenster = tijden.filter((tijd) => tijd <= nu).length;

      if (inVenster >= opties.max) {
        doorgelaten.set(sleutel, tijden);
        return false;
      }
      tijden.push(nu);
      doorgelaten.set(sleutel, tijden);
      return true;
    },
  };
}
