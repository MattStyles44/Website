import Image from "next/image";
import type { CSSProperties } from "react";

import type { Foto } from "@/lib/cms";
import { cn } from "@/lib/utils";

/**
 * Een foto uit Sanity via `next/image`, met de afmetingen en de beschrijving
 * uit Sanity. `sizes` vertelt de browser hoe breed de foto op de pagina staat.
 * `style` is voor wat geen klasse kan zijn, zoals een verhouding uit Sanity.
 */
export function SanityFoto({
  foto,
  sizes,
  className,
  style,
}: {
  foto: Foto;
  sizes: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Image
      src={foto.url}
      alt={foto.alt}
      width={foto.breedte}
      height={foto.hoogte}
      sizes={sizes}
      className={cn("h-auto w-full bg-vlak", className)}
      style={style}
    />
  );
}

/**
 * Alle foto's als collage: in kolommen, elke foto in zijn eigen verhouding.
 * Eén foto staat over de volle breedte.
 */
export function Fotogalerij({ fotos }: { fotos: readonly Foto[] }) {
  const eerste = fotos[0];
  if (!eerste) return null;
  if (fotos.length === 1) {
    return (
      <SanityFoto
        foto={eerste}
        sizes="(min-width: 72rem) 1088px, 100vw"
        className="rounded-kaart"
      />
    );
  }
  const drieKolommen = fotos.length >= 5;
  return (
    <ul
      className={cn(
        "columns-1 gap-4 sm:columns-2",
        drieKolommen && "lg:columns-3",
      )}
    >
      {fotos.map((foto, index) => (
        <li key={`${index}-${foto.url}`} className="mb-4 break-inside-avoid">
          <SanityFoto
            foto={foto}
            sizes={
              drieKolommen
                ? "(min-width: 72rem) 352px, (min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
                : "(min-width: 72rem) 536px, (min-width: 40rem) 50vw, 100vw"
            }
            className="rounded-kaart"
          />
        </li>
      ))}
    </ul>
  );
}
