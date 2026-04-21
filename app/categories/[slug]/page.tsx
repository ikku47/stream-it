import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { findCategoryBySlug, HOME_GENRES } from "@/lib/tmdb";
import {
  generateCategoryMetadata,
  getBreadcrumbJsonLd,
  getCollectionPageJsonLd,
} from "@/lib/seo";

export function generateStaticParams() {
  return HOME_GENRES.filter((g) => g.id !== null).map((category) => ({
    slug: String(category.name)
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);
  const metadata = generateCategoryMetadata(category, `/categories/${slug}`);

  return {
    ...metadata,
    keywords: category
      ? [
          "free movies",
          "free series",
          `free ${category.name.toLowerCase()} movies`,
          `free ${category.name.toLowerCase()} tv shows`,
          "browse by genre",
        ]
      : ["free movies", "free series", "browse by genre"],
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);
  const canonical = `/categories/${slug}`;
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Categories", url: "/categories" },
      { name: category?.name || "Category", url: canonical },
    ]),
    getCollectionPageJsonLd(
      category?.name ? `${category.name} Free Movies & TV Shows` : "Categories",
      category?.name
        ? `Browse ${category.name.toLowerCase()} free movies and TV series with posters and fast discovery.`
        : "Browse free movies and TV series by category on Stream It.",
      canonical
    ),
  ];

  if (!category) {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <DiscoverLayout pageType="category" title="Categories" />
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="pt-20">
        <DiscoverLayout
          pageType="category"
          title="Categories"
          initialSelection={category.id}
        />
      </div>
    </>
  );
}
