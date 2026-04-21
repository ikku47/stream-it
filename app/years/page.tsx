import type { Metadata } from "next";
import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { makeRouteMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...makeRouteMetadata(
    "Free Movies and Series by Year | Stream It",
    "Browse free movies and series by release year and jump into dedicated year pages.",
    "/years"
  ),
  keywords: [
    "free movies",
    "free series",
    "browse by year",
    "movie years",
    "tv years",
    "release year",
  ],
};

export default function YearsPage() {
  return (
    <>
      <div className="pt-20">
        <DiscoverLayout pageType="year" title="Years" />
      </div>
    </>
  );
}
