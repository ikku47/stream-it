import TVPageClient from "@/components/browse/TVPageClient";
import {
  getBreadcrumbJsonLd,
  getCollectionPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export const metadata = makeRouteMetadata(
  "TV Shows | Stream It",
  "Browse the latest and most popular TV shows with fast discovery, artwork, and metadata.",
  "/tv"
);

export default function TVPage() {
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "TV Shows", url: "/tv" },
    ]),
    getCollectionPageJsonLd(
      "TV Shows",
      "Browse the latest and most popular TV shows with fast discovery, artwork, and metadata.",
      "/tv"
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <TVPageClient />
    </>
  );
}
