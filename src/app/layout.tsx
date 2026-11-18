import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { paginas } from "@/content/paginas";
import { site } from "@/content/site";
import { env } from "@/env";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    template: `%s | ${site.naam} Groningen`,
    default: paginas.home.titel,
  },
  description: paginas.home.omschrijving,
  openGraph: {
    locale: "nl_NL",
    siteName: site.naam,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main id="inhoud" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
