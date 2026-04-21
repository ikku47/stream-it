import DetailScreen from "@/components/DetailScreen";
import {
  generateMediaMetadata,
  getBreadcrumbJsonLd,
  getMediaDetails,
  getMovieJsonLd,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return generateMediaMetadata(id, "movie");
}

export default async function MoviePage({ params }) {
  const { id } = await params;
  const initialDetails = await getMediaDetails(id, "movie");
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Movies", url: "/movies" },
      { name: initialDetails?.title || "Movie", url: `/movie/${id}` },
    ]),
    getMovieJsonLd(initialDetails, `/movie/${id}`),
  ].filter(Boolean);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <DetailScreen id={id} type="movie" initialDetails={initialDetails} />
    </>
  );
}
