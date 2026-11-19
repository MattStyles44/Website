import Link from "next/link";

import { TelefoonPictogram } from "@/components/pictogrammen";
import { MenuLink, MobielMenu } from "@/components/site-menu";
import { Knop, Logo } from "@/components/ui";
import { hoofdmenu, offerteKnop } from "@/content/navigatie";
import { site } from "@/content/site";

/**
 * Kop van elke pagina, vast bovenaan. Op brede schermen het hoofdmenu, het
 * telefoonnummer en de offerteknop; op kleine schermen een menuknop.
 * Alleen het menu zelf (`site-menu.tsx`) draait in de browser.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-vlak bg-wit">
      <a
        href="#inhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-navy focus:px-5 focus:font-semibold focus:text-wit"
      >
        Naar de inhoud
      </a>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg"
        >
          <Logo className="h-auto w-32 sm:w-36" />
        </Link>

        <nav aria-label="Hoofdmenu" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {hoofdmenu.map((item) => (
              <li key={item.href}>
                <MenuLink
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold text-navy decoration-2 underline-offset-8 hover:text-blauw hover:underline xl:px-4 [&[aria-current]]:text-blauw [&[aria-current]]:underline"
                >
                  {item.label}
                </MenuLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex xl:gap-4">
          <a
            href={site.telefoon.link}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-semibold whitespace-nowrap text-navy decoration-2 underline-offset-8 hover:text-blauw hover:underline"
          >
            <TelefoonPictogram className="text-blauw" />
            <span className="sr-only">Bel </span>
            {site.telefoon.weergave}
          </a>
          <Knop href={offerteKnop.href} className="whitespace-nowrap">
            {offerteKnop.label}
          </Knop>
        </div>

        <MobielMenu
          items={hoofdmenu}
          offerte={offerteKnop}
          telefoon={site.telefoon}
          whatsapp={site.whatsapp}
        />
      </div>
    </header>
  );
}
