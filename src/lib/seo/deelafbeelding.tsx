import { ImageResponse } from "next/og";

import { merkKleuren } from "@/content/merk";
import { site } from "@/content/site";

/** Standaardformaat voor Open Graph-afbeeldingen (Facebook, LinkedIn, WhatsApp). */
export const deelafbeeldingFormaat = { width: 1200, height: 630 } as const;

/**
 * Tijdelijke deelafbeelding: merkblauw vlak met de naam van de pagina.
 * Het woordmerk is een benadering in tekst; zodra het logo als SVG er is
 * (docs/merk.md), komt dat ervoor in de plaats.
 */
export function maakDeelafbeelding({
  titel,
  ondertitel,
}: {
  titel: string;
  ondertitel?: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: merkKleuren.navy,
        color: merkKleuren.wit,
        padding: "72px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignSelf: "flex-start",
          border: `4px solid ${merkKleuren.wit}`,
          borderRadius: 16,
          padding: "14px 26px",
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: 4 }}>
          SIGNUP
        </span>
        <span style={{ fontSize: 20, letterSpacing: 11, marginTop: 8 }}>
          RECLAME
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            fontSize: titel.length > 32 ? 64 : 80,
            fontWeight: 700,
            lineHeight: 1.08,
          }}
        >
          {titel}
        </div>
        {ondertitel ? (
          <div style={{ display: "flex", fontSize: 36, opacity: 0.85 }}>
            {ondertitel}
          </div>
        ) : null}
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 28 }}
      >
        <div
          style={{ width: 96, height: 8, backgroundColor: merkKleuren.blauw }}
        />
        <span>{`${site.ervaring} vakmanschap · Groningen en Noord-Nederland`}</span>
      </div>
    </div>,
    deelafbeeldingFormaat,
  );
}
