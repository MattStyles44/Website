import Link from "next/link";

import { footermenu } from "@/content/navigatie";
import { site } from "@/content/site";

// Structuur zonder vormgeving: de huisstijl volgt in de interfacefase.
export function SiteFooter() {
  return (
    <footer className="border-t px-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{site.naam}</p>
          <p>{site.slogan}</p>
          <p>{site.regio}</p>
          <p>
            <a href={site.telefoon.link}>{site.telefoon.weergave}</a>
            {" · "}
            <a href={site.whatsapp} rel="noopener">
              WhatsApp
            </a>
            {" · "}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
        <nav aria-label="Footermenu">
          <ul className="flex flex-col gap-1">
            {footermenu.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
