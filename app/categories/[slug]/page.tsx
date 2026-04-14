import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { findCategoryBySlug, HOME_GENRES } from "@/lib/tmdb";
import { generateCategoryMetadata } from "@/lib/seo";

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
  return generateCategoryMetadata(category, `/categories/${slug}`);
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);

  if (!category) {
    return <DiscoverLayout pageType="category" title="Categories" />;
  }

  return (
    <div className="pt-20">
      <DiscoverLayout
        pageType="category"
        title="Categories"
        initialSelection={category.id}
      />
    </div>
  );
}
