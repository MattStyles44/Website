import type { Aanvraag } from "@/lib/offerte/aanvraag";

/**
 * Een grote klus komt bovenaan (docs/processen.md, kwalificatie): drie of meer
 * voertuigen, of een gevelproject.
 */
export function isGroteKlus(aanvraag: Aanvraag): boolean {
  if (aanvraag.categorie === "gevelreclame") return true;
  if (aanvraag.categorie === "voertuigreclame") {
    const aantal = aanvraag.details.aantalVoertuigen;
    return typeof aantal === "number" && aantal >= 3;
  }
  return false;
}
