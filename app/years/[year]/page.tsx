import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { YEARS } from "@/lib/tmdb";
import {
  getBreadcrumbJsonLd,
  getCollectionPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export function generateStaticParams() {
  return YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return {
    ...makeRouteMetadata(
      `Watch Free Movies and Series from ${year} | Stream It`,
      `Browse free movies and TV shows released in ${year}.`,
      `/years/${year}`
    ),
    keywords: [
      "free movies",
      "free series",
      `movies ${year}`,
      `tv shows ${year}`,
      "browse by year",
    ],
  };
}

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const canonical = `/years/${year}`;
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Years", url: "/years" },
      { name: year, url: canonical },
    ]),
    getCollectionPageJsonLd(
      `${year} Free Movies & TV Shows`,
      `Browse free movies and TV series released in ${year}.`,
      canonical
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="pt-20">
        <DiscoverLayout
          pageType="year"
          title="Years"
          initialSelection={year}
        />
      </div>
    </>
  );
}
