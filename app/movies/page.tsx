import MoviesPageClient from "@/components/browse/MoviesPageClient";
import type { Metadata } from "next";
import {
  getBreadcrumbJsonLd,
  getCollectionPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...makeRouteMetadata(
    "Watch Free Movies Online | Stream It",
    "Watch free movies online, browse popular films, and discover rich artwork, cast details, and watch-ready metadata.",
    "/movies"
  ),
  keywords: [
    "watch free movies",
    "free movies",
    "free movies online",
    "movie discovery",
    "popular movies",
    "latest movies",
  ],
};

export default function MoviesPage() {
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Movies", url: "/movies" },
    ]),
    getCollectionPageJsonLd(
      "Watch Free Movies Online",
      "Watch free movies online, browse popular films, and discover rich artwork, cast details, and watch-ready metadata.",
      "/movies"
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <MoviesPageClient />
    </>
  );
}
