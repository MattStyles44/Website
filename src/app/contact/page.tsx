import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { OfferteCta } from "@/components/offerte-cta";
import { Intro, PaginaKop } from "@/components/pagina-kop";
import {
  BerichtPictogram,
  LocatiePictogram,
  MailPictogram,
  TelefoonPictogram,
} from "@/components/pictogrammen";
import { Knop, Sectie } from "@/components/ui";
import { paginaMetadata, paginas } from "@/content/paginas";
import { site, vestiging } from "@/content/site";
import { routeplannerLink } from "@/lib/weergave";

export const metadata: Metadata = paginaMetadata(paginas.contact);

/** Een manier om contact op te nemen: kop, gegevens en één duidelijke actie. */
function Contactkaart({
  titel,
  pictogram,
  gegeven,
  children,
}: {
  titel: string;
  pictogram: ReactNode;
  gegeven: string;
  children: ReactNode;
}) {
  return (
    <li className="flex h-full flex-col gap-5 rounded-kaart border-2 border-vlak bg-wit p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-vlak text-blauw">
          {pictogram}
        </span>
        <h2 className="text-2xl leading-kop">{titel}</h2>
      </div>
      <p className="text-xl font-semibold break-words">{gegeven}</p>
      <div className="mt-auto">{children}</div>
    </li>
  );
}

export default function ContactPage() {
  return (
    <>
      <PaginaKop titel={paginas.contact.titel}>
        <Intro>
          {site.reactiebelofte}. Je spreekt direct met de vakman zelf.
        </Intro>
      </PaginaKop>

      <Sectie>
        <ul className="grid gap-4 md:grid-cols-3">
          <Contactkaart
            titel="WhatsApp"
            pictogram={<BerichtPictogram />}
            gegeven={site.telefoon.weergave}
          >
            <Knop href={site.whatsapp}>Stuur een WhatsApp</Knop>
          </Contactkaart>
          <Contactkaart
            titel="Telefoon"
            pictogram={<TelefoonPictogram />}
            gegeven={site.telefoon.weergave}
          >
            <Knop href={site.telefoon.link} variant="secundair">
              Bel ons
            </Knop>
          </Contactkaart>
          <Contactkaart
            titel="E-mail"
            pictogram={<MailPictogram />}
            gegeven={site.email}
          >
            <Knop href={`mailto:${site.email}`} variant="secundair">
              Stuur een e-mail
            </Knop>
          </Contactkaart>
        </ul>

        <div className="grid gap-10 border-t-2 border-vlak pt-10 md:grid-cols-2 lg:gap-8 lg:pt-12">
          {vestiging ? (
            <section
              aria-labelledby="adres-kop"
              className="flex flex-col gap-4"
            >
              <h2
                id="adres-kop"
                className="flex items-center gap-3 text-3xl leading-kop tracking-tight"
              >
                <LocatiePictogram className="size-7 text-blauw" />
                Adres
              </h2>
              <address className="text-intro not-italic">
                {site.naam}
                <br />
                {vestiging.straat}
                <br />
                {vestiging.postcode} {vestiging.plaats}
              </address>
              <div>
                <Knop href={routeplannerLink(vestiging)} variant="tekst">
                  Plan je route (Google Maps)
                </Knop>
              </div>
            </section>
          ) : null}
          <section aria-labelledby="regio-kop" className="flex flex-col gap-4">
            <h2 id="regio-kop" className="text-3xl leading-kop tracking-tight">
              Werkgebied
            </h2>
            <p className="max-w-[45ch] text-intro">{site.regio}</p>
            <p className="max-w-[45ch]">
              Liever meteen een offerte op maat?{" "}
              <Link
                href={paginas.offerte.pad}
                className="font-semibold text-blauw underline decoration-2 underline-offset-4 hover:text-navy"
              >
                Vraag een offerte aan
              </Link>{" "}
              of plan een meet- of adviesafspraak.
            </p>
          </section>
        </div>
      </Sectie>

      <OfferteCta />
    </>
  );
}
