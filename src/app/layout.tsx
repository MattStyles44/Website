import type { Metadata } from "next";
import type { ReactNode } from "react";

import { env } from "@/env";

import "./globals.css";

export const metadata: Metadata = {
  title: env.APP_NAME,
  description: "A production-ready Next.js foundation.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
