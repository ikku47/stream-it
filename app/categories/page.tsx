import type { Metadata } from "next";
import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { makeRouteMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...makeRouteMetadata(
    "Free Movies and Series by Genre | Stream It",
    "Browse free movies and series by genre, then open a dedicated page for each category.",
    "/categories"
  ),
  keywords: [
    "free movies",
    "free series",
    "browse by genre",
    "movie genres",
    "tv genres",
    "genre discovery",
  ],
};

export default function CategoriesPage() {
  return (
    <>
      <div className="pt-20">
        <DiscoverLayout pageType="category" title="Categories" />
      </div>
    </>
  );
}
