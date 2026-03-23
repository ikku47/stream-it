import PersonDetailScreen from "@/components/PersonDetailScreen";

export default async function PersonPage({ params }) {
  const { id } = await params;
  return <PersonDetailScreen id={id} />;
}
