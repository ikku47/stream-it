import TrendingPageClient from "@/components/browse/TrendingPageClient";
import type { Metadata } from "next";
import {
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...makeRouteMetadata(
    "Trending Free Movies and Series | Stream It",
    "See trending free movies and series right now, with fast-loading posters, artwork, and details.",
    "/trending"
  ),
  keywords: [
    "trending movies",
    "trending series",
    "free movies",
    "free series",
    "watch free movies",
    "watch free series",
  ],
};

export default function TrendingPage() {
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Trending", url: "/trending" },
    ]),
    getWebPageJsonLd(
      "Trending Free Movies and Series",
      "See trending free movies and series right now, with fast-loading posters, artwork, and details.",
      "/trending"
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <TrendingPageClient />
    </>
  );
}
