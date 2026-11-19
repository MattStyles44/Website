import type { NextConfig } from "next";

import { nextRedirects } from "./src/content/redirects";
// Validate environment variables at startup (dev, build and start).
import "./src/env";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // Foto's van projecten en diensten komen van het CDN van Sanity
    // (src/lib/cms/bron.ts laat alleen die adressen door).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Het offerteformulier mag samen 20 MiB aan bestanden meesturen
      // (src/lib/offerte/uploads.ts). De limiet geldt voor het hele verzoek,
      // dus met ruimte voor de velden en de multipart-overhead.
      bodySizeLimit: "21mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Oude URL's van de WordPress-site naar de nieuwe pagina's (308 permanent).
  async redirects() {
    return nextRedirects();
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
