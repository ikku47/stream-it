import DetailScreen from "@/components/DetailScreen";
import {
  generateMediaMetadata,
  getBreadcrumbJsonLd,
  getMediaDetails,
  getTVSeriesJsonLd,
  getVideoObjectJsonLd,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return generateMediaMetadata(id, "tv");
}

export default async function TVPage({ params }) {
  const { id } = await params;
  const initialDetails = await getMediaDetails(id, "tv");
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "TV Shows", url: "/tv" },
      { name: initialDetails?.name || "TV Show", url: `/tv/${id}` },
    ]),
    getTVSeriesJsonLd(initialDetails, `/tv/${id}`),
    getVideoObjectJsonLd(initialDetails),
  ].filter(Boolean);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <DetailScreen id={id} type="tv" initialDetails={initialDetails} />
    </>
  );
}
