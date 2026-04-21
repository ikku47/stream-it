import RadioStationPage from "@/components/radio/RadioStationPage";
import { getRadioStationById } from "@/lib/radio";
import {
  generateRadioStationMetadata,
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { stationId } = await params;
  const station = await getRadioStationById(stationId);
  return generateRadioStationMetadata(station, `/radio/${stationId}`);
}

export default async function RadioStationRoutePage({ params }) {
  const { stationId } = await params;
  const station = await getRadioStationById(stationId);
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Radio", url: "/radio" },
      { name: station?.name || "Station", url: `/radio/${stationId}` },
    ]),
    getWebPageJsonLd(
      station?.name ? `${station.name} Radio` : "Radio",
      station
        ? `Listen to ${station.name}${station.country ? ` in ${station.country}` : ""}.`
        : "Listen to radio stations from around the world on Stream It.",
      `/radio/${stationId}`
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <RadioStationPage station={station} />
    </>
  );
}
