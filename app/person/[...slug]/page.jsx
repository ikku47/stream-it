import PersonDetailScreen from "@/components/PersonDetailScreen";

export const generateStaticParams = () => [];

export default async function PersonPage({ params }) {
  const { slug } = await params;
  const id = slug?.[0];
  if (!id) return null;
  return <PersonDetailScreen id={id} />;
}
