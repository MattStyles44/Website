import type { MetadataRoute } from "next";

import { env } from "@/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", env.APP_URL).toString(),
  };
}
