import { makeRouteMetadata } from "@/lib/seo";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata = makeRouteMetadata(
  "Stream It | Movies, TV, Live Channels & Radio",
  "Discover movies, TV shows, live channels, and radio with fast browsing, rich artwork, and curated discovery rows.",
  "/"
);

export default function HomePage() {
  return <HomePageClient />;
}
