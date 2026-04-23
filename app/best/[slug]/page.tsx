import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { findCategoryBySlug, HOME_GENRES, slugify, YEARS } from "@/lib/tmdb";
import {
  generateCollectionMetadata,
  getBreadcrumbJsonLd,
} from "@/lib/seo";

// This generates a large number of static params for common combinations
export function generateStaticParams() {
  const params: { slug: string }[] = [];
  const topGenres = HOME_GENRES.filter((g) => g.id !== null).slice(0, 10);
  const recentYears = YEARS.slice(0, 5);

  topGenres.forEach((genre) => {
    recentYears.forEach((year) => {
      params.push({
        slug: `${slugify(genre.name)}-movies-${year}`,
      });
    });
  });

  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Parse slug: e.g. "action-movies-2026"
  const match = slug.match(/^(.+)-movies-(\d{4})$/);
  if (!match) return { title: "Best Movies | Stream It" };

  const genreSlug = match[1];
  const year = match[2];
  const category = findCategoryBySlug(genreSlug);

  if (!category) return { title: `Best Movies of ${year} | Stream It` };

  return generateCollectionMetadata(category.name, year, `/best/${slug}`);
}

export default async function BestCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const canonical = `/best/${slug}`;
  
  const match = slug.match(/^(.+)-movies-(\d{4})$/);
  if (!match) return <div>Invalid Collection</div>;

  const genreSlug = match[1];
  const year = match[2];
  const category = findCategoryBySlug(genreSlug);

  const title = category 
    ? `Best ${category.name} Movies of ${year}`
    : `Best Movies of ${year}`;

  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Categories", url: "/categories" },
      { name: title, url: canonical },
    ]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="pt-20">
        <DiscoverLayout
          pageType="collection"
          title={title}
          initialGenre={category?.id}
          initialYear={year}
          initialSelection={category?.id}
        />
      </div>
    </>
  );
}
