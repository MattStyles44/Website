import Link from "next/link";

import {
  BerichtPictogram,
  LocatiePictogram,
  MailPictogram,
  TelefoonPictogram,
} from "@/components/pictogrammen";
import { Logo } from "@/components/ui";
import { footermenu } from "@/content/navigatie";
import { site, vestiging } from "@/content/site";

const linkKlassen =
  "inline-flex min-h-11 items-center gap-3 font-medium underline decoration-1 underline-offset-4 hover:decoration-2";

/** Navy voet van elke pagina: slogan, contact, adres en het footermenu. */
export function SiteFooter() {
  return (
    <footer className="op-donker">
      {/* Een merkblauwe lijn scheidt de voet van een navy vlak erboven. */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 border-t-2 border-blauw py-14 sm:py-20 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-start gap-6 lg:col-span-5">
            <Link href="/" className="inline-flex rounded-lg">
              <Logo toon="licht" className="h-auto w-44" />
            </Link>
            <p className="max-w-[20ch] font-display text-3xl leading-kop font-bold">
              {site.slogan}
            </p>
            <p className="max-w-[40ch]">
              {site.reactiebelofte}. Je spreekt direct met de vakman zelf.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-4">
            <h2 className="text-xl">Contact</h2>
            <ul className="flex flex-col">
              <li>
                <a href={site.telefoon.link} className={linkKlassen}>
                  <TelefoonPictogram />
                  <span>
                    <span className="sr-only">Bel </span>
                    {site.telefoon.weergave}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={site.whatsapp}
                  rel="noopener noreferrer"
                  className={linkKlassen}
                >
                  <BerichtPictogram />
                  Stuur een WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className={linkKlassen}>
                  <MailPictogram />
                  {site.email}
                </a>
              </li>
            </ul>
            {vestiging ? (
              <address className="flex items-start gap-3 not-italic">
                <LocatiePictogram className="mt-0.5" />
                <span>
                  {vestiging.straat}
                  <br />
                  {vestiging.postcode} {vestiging.plaats}
                </span>
              </address>
            ) : null}
            <p className="max-w-[40ch]">
              <span className="font-semibold">Werkgebied:</span> {site.regio}
            </p>
          </div>

          <nav
            aria-label="Footermenu"
            className="flex flex-col gap-4 lg:col-span-3"
          >
            <h2 className="text-xl">Menu</h2>
            <ul className="grid grid-cols-2 gap-x-6 lg:grid-cols-1">
              {footermenu.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkKlassen}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
