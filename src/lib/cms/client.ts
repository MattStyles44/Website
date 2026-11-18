import { createClient, type SanityClient } from "@sanity/client";

import { env } from "@/env";

/** Vaste API-versie, zodat Sanity het antwoordformaat niet ongemerkt verandert. */
export const sanityApiVersion = "2026-11-01";

let client: SanityClient | null | undefined;

/**
 * De Sanity-client, of null als er geen project-ID is ingesteld.
 * Leest alleen gepubliceerde inhoud; concepten in de Studio blijven onzichtbaar.
 * Geen CDN: Next.js cachet zelf, en de webhook ververst direct na publiceren.
 */
export function sanityClient(): SanityClient | null {
  if (client === undefined) {
    client = env.SANITY_PROJECT_ID
      ? createClient({
          projectId: env.SANITY_PROJECT_ID,
          dataset: env.SANITY_DATASET,
          apiVersion: sanityApiVersion,
          useCdn: false,
          perspective: "published",
        })
      : null;
  }
  return client;
}
