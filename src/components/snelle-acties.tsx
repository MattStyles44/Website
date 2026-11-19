"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BerichtPictogram, TelefoonPictogram } from "@/components/pictogrammen";
import { offerteKnop } from "@/content/navigatie";
import { site } from "@/content/site";

const offerteKlassen =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-blauw px-4 font-semibold whitespace-nowrap text-wit transition-colors duration-150 ease-out hover:bg-navy focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-(--kleur-focus) motion-reduce:transition-none";

const pictogramKnop =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-blauw text-blauw transition-colors duration-150 ease-out hover:bg-blauw hover:text-wit focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-(--kleur-focus) motion-reduce:transition-none";

/**
 * Vaste balk onderaan op kleine schermen: offerte aanvragen, WhatsApp en
 * bellen, zodat die op elke pagina binnen bereik zijn (docs/processen.md).
 * Op /offerte staat het formulier al, dus daar blijft de balk weg.
 */
export function SnelleActies() {
  const pad = usePathname();
  if (pad?.startsWith(offerteKnop.href)) return null;

  return (
    <>
      {/* Ruimte onder de footer, zodat de balk niets afdekt. */}
      <div aria-hidden="true" className="h-20 bg-navy lg:hidden" />
      <nav
        aria-label="Snel contact"
        className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-vlak bg-wit pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
          <Link href={offerteKnop.href} className={offerteKlassen}>
            {offerteKnop.label}
          </Link>
          <a
            href={site.whatsapp}
            rel="noopener noreferrer"
            aria-label="Stuur een WhatsApp"
            className={pictogramKnop}
          >
            <BerichtPictogram className="size-5" />
          </a>
          <a
            href={site.telefoon.link}
            aria-label={`Bel ${site.telefoon.weergave}`}
            className={pictogramKnop}
          >
            <TelefoonPictogram className="size-5" />
          </a>
        </div>
      </nav>
    </>
  );
}
