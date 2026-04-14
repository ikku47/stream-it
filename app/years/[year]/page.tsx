import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { YEARS } from "@/lib/tmdb";
import { makeRouteMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return makeRouteMetadata(
    `${year} | Stream It`,
    `Browse movies and TV shows released in ${year}.`,
    `/years/${year}`
  );
}

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;

  return (
    <div className="pt-20">
      <DiscoverLayout
        pageType="year"
        title="Years"
        initialSelection={year}
      />
    </div>
  );
}
