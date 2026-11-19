import { cacheLife, cacheTag } from "next/cache";

import { env } from "@/env";

import { maakContentBron } from "./bron";
import { sanityClient } from "./client";
import { cmsTag } from "./tag";

export type {
  Blok,
  CategorieTekst,
  DienstTekst,
  Foto,
  ProjectKaart,
} from "./bron";

function bron() {
  const client = sanityClient();
  return maakContentBron(
    client ? (query, params) => client.fetch(query, params) : null,
  );
}

/**
 * Cache-instellingen voor inhoud uit Sanity. In productie een uur, en direct
 * vernieuwd via de webhook (`/api/revalidate`). Lokaal een minuut, zodat
 * wijzigingen in de Studio snel zichtbaar zijn.
 */
function cacheVoorCms() {
  cacheTag(cmsTag);
  if (env.NODE_ENV === "development") cacheLife("minutes");
  else cacheLife("hours");
}

export async function haalCategorieTekst(slug: string) {
  "use cache";
  cacheVoorCms();
  return bron().categorieTekst(slug);
}

export async function haalDienstTekst(categorie: string, dienst: string) {
  "use cache";
  cacheVoorCms();
  return bron().dienstTekst(categorie, dienst);
}

export async function haalProjecten() {
  "use cache";
  cacheVoorCms();
  return bron().projecten();
}
