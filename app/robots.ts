import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const host = new URL(getSiteUrl()).host;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/search", "/favourites"],
      },
    ],
    sitemap: getSiteUrl("/sitemap.xml"),
    host,
  };
}
