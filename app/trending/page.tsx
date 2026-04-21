import TrendingPageClient from "@/components/browse/TrendingPageClient";
import {
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export const metadata = makeRouteMetadata(
  "Trending | Stream It",
  "See what is trending right now across movies and TV series, with fast-loading posters and details.",
  "/trending"
);

export default function TrendingPage() {
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Trending", url: "/trending" },
    ]),
    getWebPageJsonLd(
      "Trending",
      "See what is trending right now across movies and TV series, with fast-loading posters and details.",
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
