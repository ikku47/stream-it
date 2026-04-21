import type { Metadata } from "next";
import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { makeRouteMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...makeRouteMetadata(
    "Free Movies and Series by Language | Stream It",
    "Browse free movies and series by language, then open a dedicated page for each language.",
    "/languages"
  ),
  keywords: [
    "free movies",
    "free series",
    "browse by language",
    "language discovery",
    "international movies",
    "international tv",
  ],
};

export default function LanguagesPage() {
  return (
    <>
      <div className="pt-20">
        <DiscoverLayout pageType="language" title="Languages" />
      </div>
    </>
  );
}
