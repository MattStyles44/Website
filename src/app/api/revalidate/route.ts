import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidateTag } from "next/cache";

import { env } from "@/env";
import { cmsTag } from "@/lib/cms/tag";

/**
 * Webhook van Sanity: na elke publicatie ververst de site de inhoud uit het CMS.
 * Alleen verzoeken met een geldige handtekening (SANITY_WEBHOOK_SECRET) tellen.
 */
export async function POST(request: Request): Promise<Response> {
  const geheim = env.SANITY_WEBHOOK_SECRET;
  if (!geheim) {
    return Response.json(
      { fout: "Webhook is niet ingesteld." },
      { status: 503 },
    );
  }

  const handtekening = request.headers.get(SIGNATURE_HEADER_NAME);
  const inhoud = await request.text();
  const geldig =
    handtekening !== null &&
    (await isValidSignature(inhoud, handtekening, geheim).catch(() => false));
  if (!geldig) {
    return Response.json({ fout: "Ongeldige handtekening." }, { status: 401 });
  }

  // Direct verlopen: de volgende bezoeker krijgt meteen de nieuwe tekst.
  revalidateTag(cmsTag, { expire: 0 });
  return Response.json({ ververst: true });
}
