import type { Metadata } from "next";
import { Barlow, Barlow_Semi_Condensed } from "next/font/google";
import type { ReactNode } from "react";

import { JsonLdScript } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SnelleActies } from "@/components/snelle-acties";
import { basisOpenGraph, paginas } from "@/content/paginas";
import { site, vestiging } from "@/content/site";
import { env } from "@/env";
import { organisatieJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

import "./globals.css";

// Zelf gehost via next/font: bezoekers laden niets bij Google.
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-barlow",
});

const barlowSemiCondensed = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-barlow-semi-condensed",
});

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
    <html
      lang="nl"
      className={`${barlow.variable} ${barlowSemiCondensed.variable} h-full antialiased`}
    >
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
        <SnelleActies />
      </body>
    </html>
  );
}
