import DetailScreen from "@/components/DetailScreen";
import { generateMediaMetadata, getMediaDetails } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return generateMediaMetadata(id, "movie");
}

export default async function MoviePage({ params }) {
  const { id } = await params;
  const initialDetails = await getMediaDetails(id, "movie");
  return <DetailScreen id={id} type="movie" initialDetails={initialDetails} />;
}
