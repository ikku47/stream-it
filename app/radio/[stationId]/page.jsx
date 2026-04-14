import RadioStationPage from "@/components/radio/RadioStationPage";
import { getRadioStationById } from "@/lib/radio";
import { generateRadioStationMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { stationId } = await params;
  const station = await getRadioStationById(stationId);
  return generateRadioStationMetadata(station, `/radio/${stationId}`);
}

export default async function RadioStationRoutePage({ params }) {
  const { stationId } = await params;
  const station = await getRadioStationById(stationId);

  return <RadioStationPage station={station} />;
}
