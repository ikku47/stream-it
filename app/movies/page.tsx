import MoviesPageClient from "@/components/browse/MoviesPageClient";
import {
  getBreadcrumbJsonLd,
  getCollectionPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export const metadata = makeRouteMetadata(
  "Movies | Stream It",
  "Browse the latest and most popular movies with rich artwork, cast details, and watch-ready metadata.",
  "/movies"
);

export default function MoviesPage() {
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Movies", url: "/movies" },
    ]),
    getCollectionPageJsonLd(
      "Movies",
      "Browse the latest and most popular movies with rich artwork, cast details, and watch-ready metadata.",
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
