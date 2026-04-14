import DetailScreen from "@/components/DetailScreen";
import { generateMediaMetadata, getMediaDetails } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return generateMediaMetadata(id, "tv");
}

export default async function TVPage({ params }) {
  const { id } = await params;
  const initialDetails = await getMediaDetails(id, "tv");
  return <DetailScreen id={id} type="tv" initialDetails={initialDetails} />;
}
