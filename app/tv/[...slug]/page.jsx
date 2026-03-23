import DetailScreen from "@/components/DetailScreen";

export const generateStaticParams = () => [];

export default async function TVPage({ params }) {
  const { slug } = await params;
  const id = slug?.[0];
  if (!id) return null;
  return <DetailScreen id={id} type="tv" />;
}
