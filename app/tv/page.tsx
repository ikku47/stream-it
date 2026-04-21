import TVPageClient from "@/components/browse/TVPageClient";
import type { Metadata } from "next";
import {
  getBreadcrumbJsonLd,
  getCollectionPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...makeRouteMetadata(
    "Watch Free TV Shows Online | Stream It",
    "Watch free TV shows online, browse the latest series, and explore fast discovery, artwork, and metadata.",
    "/tv"
  ),
  keywords: [
    "watch free tv shows",
    "free tv shows",
    "free series",
    "watch free series",
    "free tv shows online",
    "tv discovery",
  ],
};

export default function TVPage() {
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "TV Shows", url: "/tv" },
    ]),
    getCollectionPageJsonLd(
      "Watch Free TV Shows Online",
      "Watch free TV shows online, browse the latest series, and explore fast discovery, artwork, and metadata.",
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
