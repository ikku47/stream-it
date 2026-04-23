import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { Metadata } from "next";
import {
  getBreadcrumbJsonLd,
  getCollectionPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

const SLUG_MAP: Record<string, string> = {
  popular: "popular",
  "top-rated": "top_rated",
  "airing-today": "airing_today",
  "on-the-air": "on_the_air",
};

export function generateStaticParams() {
  return Object.keys(SLUG_MAP).map((slug) => ({ category: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const categoryName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  return makeRouteMetadata(
    `${categoryName} Free TV Shows | Stream It`,
    `Watch ${categoryName.toLowerCase()} free TV series and shows online with fast streaming and rich metadata.`,
    `/tv/${slug}`
  );
}

export default async function TVCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const tmdbCategory = SLUG_MAP[slug] || "popular";
  const categoryName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  const canonical = `/tv/${slug}`;
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "TV", url: "/tv" },
      { name: categoryName, url: canonical },
    ]),
    getCollectionPageJsonLd(
      `${categoryName} Free TV Shows`,
      `Watch ${categoryName.toLowerCase()} free TV series and shows online with fast streaming and rich metadata.`,
      canonical
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="pt-20">
        <DiscoverLayout
          pageType="collection"
          title={`TV: ${categoryName}`}
          initialCategory={tmdbCategory}
          initialType="tv"
        />
      </div>
    </>
  );
}
