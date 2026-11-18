import { serialiseerJsonLd, type JsonLd } from "@/lib/seo/json-ld";

/** Gestructureerde gegevens als <script type="application/ld+json">. */
export function JsonLdScript({
  data,
}: {
  data: JsonLd | ReadonlyArray<JsonLd>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialiseerJsonLd(data) }}
    />
  );
}
