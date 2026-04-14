import { makeRouteMetadata } from "@/lib/seo";
import DiscoverLayout from "@/components/discover/DiscoverLayout";

export const metadata = makeRouteMetadata(
  "Years | Stream It",
  "Browse movies and TV series by release year.",
  "/years"
);

export default function YearsPage() {
  return (
    <>
      <div className="pt-20">
        <DiscoverLayout pageType="year" title="Years" />
      </div>
    </>
  );
}
