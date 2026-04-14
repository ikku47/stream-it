import PersonDetailScreen from "@/components/PersonDetailScreen";
import { generatePersonMetadata, getPersonDetails } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return generatePersonMetadata(id);
}

export default async function PersonPage({ params }) {
  const { id } = await params;
  const person = await getPersonDetails(id);
  const initialCredits = (person?.combined_credits?.cast || [])
    .filter((credit) => credit.poster_path)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  return (
    <PersonDetailScreen
      id={id}
      initialPerson={person}
      initialCredits={initialCredits}
    />
  );
}
