import DetailScreen from "@/components/DetailScreen";

export default async function TVPage({ params }) {
  const { id } = await params;
  return <DetailScreen id={id} type="tv" />;
}
