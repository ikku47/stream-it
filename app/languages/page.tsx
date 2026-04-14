import { makeRouteMetadata } from "@/lib/seo";
import DiscoverLayout from "@/components/discover/DiscoverLayout";

export const metadata = makeRouteMetadata(
  "Languages | Stream It",
  "Browse movies and TV series by language, then open a dedicated page for each language.",
  "/languages"
);

export default function LanguagesPage() {
  return (
    <>
      <div className="pt-20">
        <DiscoverLayout pageType="language" title="Languages" />
      </div>
    </>
  );
}
