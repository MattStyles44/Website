"use server";

import { headers } from "next/headers";

import { standaardTransport } from "@/lib/mail";
import type { Velden } from "@/lib/offerte/aanvraag";
import { maakRateLimiter } from "@/lib/offerte/spam";
import type { Bestand } from "@/lib/offerte/uploads";
import { verwerkAanvraag, type VerwerkResultaat } from "@/lib/offerte/verwerk";

// Maximaal 5 aanvragen per uur per IP-adres, per serverproces.
const limiter = maakRateLimiter({ max: 5, vensterMs: 60 * 60 * 1000 });

/** Server Action voor het offerteformulier, met de signatuur van `useActionState`. */
export async function verstuurOfferte(
  vorige: VerwerkResultaat | null,
  formData: FormData,
): Promise<VerwerkResultaat> {
  const tekstvelden = new Map<string, string>();
  const bestanden: Bestand[] = [];

  for (const [naam, waarde] of formData.entries()) {
    if (typeof waarde === "string") {
      // Bij dubbele namen telt de eerste waarde, zoals bij formData.get().
      if (!tekstvelden.has(naam)) tekstvelden.set(naam, waarde);
    } else if (naam === "bestanden") {
      bestanden.push({
        naam: waarde.name,
        type: waarde.type,
        inhoud: new Uint8Array(await waarde.arrayBuffer()),
      });
    }
  }
  const velden: Velden = Object.fromEntries(tekstvelden);

  const doorgestuurdVoor = (await headers()).get("x-forwarded-for");
  const ip = doorgestuurdVoor?.split(",")[0]?.trim() || "onbekend";

  return verwerkAanvraag(
    { velden, bestanden, ip },
    { transport: standaardTransport, limiter, nu: new Date() },
  );
}
