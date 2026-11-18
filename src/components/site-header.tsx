import Link from "next/link";

import { hoofdmenu, offerteKnop } from "@/content/navigatie";
import { site } from "@/content/site";

// Structuur zonder vormgeving: de huisstijl volgt in de interfacefase.
export function SiteHeader() {
  return (
    <header className="border-b px-4 py-3">
      <a href="#inhoud" className="sr-only focus:not-sr-only">
        Naar de inhoud
      </a>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-semibold">
          {site.naam}
        </Link>
        <nav aria-label="Hoofdmenu">
          <ul className="flex flex-wrap gap-4">
            {hoofdmenu.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center gap-4">
          <a href={site.whatsapp} rel="noopener">
            WhatsApp
          </a>
          <a href={site.telefoon.link}>{site.telefoon.weergave}</a>
          <Link href={offerteKnop.href} className="font-semibold underline">
            {offerteKnop.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
