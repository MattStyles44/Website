import type { MetadataRoute } from "next";

import { allePaden } from "@/content/paginas";
import { env } from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return allePaden().map((pad) => ({
    url: new URL(pad, env.APP_URL).toString(),
  }));
}
