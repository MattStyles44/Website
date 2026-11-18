import type { Metadata } from "next";
import type { ReactNode } from "react";

import { JsonLdScript } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { basisOpenGraph, paginas } from "@/content/paginas";
import { site, vestiging } from "@/content/site";
import { env } from "@/env";
import { organisatieJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    template: `%s | ${site.naam} Groningen`,
    default: paginas.home.titel,
  },
  description: paginas.home.omschrijving,
  openGraph: basisOpenGraph,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <JsonLdScript
          data={[
            organisatieJsonLd(env.APP_URL, vestiging),
            websiteJsonLd(env.APP_URL),
          ]}
        />
        <SiteHeader />
        <main id="inhoud" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
