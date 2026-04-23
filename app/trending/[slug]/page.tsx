import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { Metadata } from "next";
import {
  getBreadcrumbJsonLd,
  getCollectionPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

const SLUG_MAP: Record<string, string> = {
  today: "trending_day",
  week: "trending_week",
  movies: "trending_movie",
  tv: "trending_tv",
};

export function generateStaticParams() {
  return Object.keys(SLUG_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = slug === "tv" ? "TV Shows" : slug.charAt(0).toUpperCase() + slug.slice(1);
  
  return makeRouteMetadata(
    `Trending ${name} | Stream It`,
    `See which ${name.toLowerCase()} are trending right now. Watch free trending content with rich metadata.`,
    `/trending/${slug}`
  );
}

export default async function TrendingSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tmdbCategory = SLUG_MAP[slug] || "trending_week";
  const name = slug === "tv" ? "TV Shows" : slug.charAt(0).toUpperCase() + slug.slice(1);
  
  const canonical = `/trending/${slug}`;
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Trending", url: "/trending" },
      { name: name, url: canonical },
    ]),
    getCollectionPageJsonLd(
      `Trending ${name}`,
      `See which ${name.toLowerCase()} are trending right now. Watch free trending content with rich metadata.`,
      canonical
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="pt-20">
        <DiscoverLayout
          pageType="collection"
          title={`Trending: ${name}`}
          initialCategory={tmdbCategory}
          initialType={slug === "tv" ? "tv" : "movie"}
        />
      </div>
    </>
  );
}
