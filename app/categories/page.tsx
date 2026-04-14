import { makeRouteMetadata } from "@/lib/seo";
import DiscoverLayout from "@/components/discover/DiscoverLayout";

export const metadata = makeRouteMetadata(
  "Categories | Stream It",
  "Browse movie and TV categories, then open a dedicated page for each genre.",
  "/categories"
);

export default function CategoriesPage() {
  return (
    <>
      <div className="pt-20">
        <DiscoverLayout pageType="category" title="Categories" />
      </div>
    </>
  );
}
