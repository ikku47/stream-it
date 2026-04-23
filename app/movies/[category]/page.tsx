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
  upcoming: "upcoming",
  "now-playing": "now_playing",
};

export function generateStaticParams() {
  return Object.keys(SLUG_MAP).map((slug) => ({ category: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const categoryName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  return makeRouteMetadata(
    `${categoryName} Free Movies | Stream It`,
    `Watch ${categoryName.toLowerCase()} free movies online with rich artwork and cast details.`,
    `/movies/${slug}`
  );
}

export default async function MovieCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const tmdbCategory = SLUG_MAP[slug] || "popular";
  const categoryName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  const canonical = `/movies/${slug}`;
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Movies", url: "/movies" },
      { name: categoryName, url: canonical },
    ]),
    getCollectionPageJsonLd(
      `${categoryName} Free Movies`,
      `Watch ${categoryName.toLowerCase()} free movies online with rich artwork and cast details.`,
      canonical
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="pt-20">
        <DiscoverLayout
          pageType="collection"
          title={`Movies: ${categoryName}`}
          initialCategory={tmdbCategory}
          initialType="movie"
        />
      </div>
    </>
  );
}
