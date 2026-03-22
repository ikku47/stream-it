import DetailScreen from "@/components/DetailScreen";

export default async function MoviePage({ params }) {
  const { id } = await params;
  return <DetailScreen id={id} type="movie" />;
}
