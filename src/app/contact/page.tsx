import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { paginaMetadata, paginas } from "@/content/paginas";
import { site } from "@/content/site";

export const metadata: Metadata = paginaMetadata(paginas.contact);

export default function ContactPage() {
  return (
    <Container>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{paginas.contact.titel}</h1>
        <p>{site.reactiebelofte}. Je spreekt direct met de vakman zelf.</p>
      </header>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        <dt>WhatsApp</dt>
        <dd>
          <a href={site.whatsapp} rel="noopener" className="underline">
            {site.telefoon.weergave}
          </a>
        </dd>
        <dt>Telefoon</dt>
        <dd>
          <a href={site.telefoon.link} className="underline">
            {site.telefoon.weergave}
          </a>
        </dd>
        <dt>E-mail</dt>
        <dd>
          <a href={`mailto:${site.email}`} className="underline">
            {site.email}
          </a>
        </dd>
        <dt>Werkgebied</dt>
        <dd>{site.regio}</dd>
      </dl>

      <p>
        Liever meteen een offerte op maat?{" "}
        <Link href={paginas.offerte.pad} className="font-semibold underline">
          Vraag een offerte aan
        </Link>{" "}
        of plan een meet- of adviesafspraak.
      </p>
    </Container>
  );
}
