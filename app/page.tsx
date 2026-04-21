import type { Metadata } from "next";
import { makeRouteMetadata } from "@/lib/seo";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  ...makeRouteMetadata(
    "Watch Free Movies, Free Series, Live TV & Radio | Stream It",
    "Watch free movies, free TV shows, free series, live TV, and radio with fast browsing, rich artwork, and curated discovery rows.",
    "/"
  ),
  keywords: [
    "watch free movies",
    "free movies",
    "free movies online",
    "free series",
    "free tv shows",
    "free series online",
    "watch free series",
    "watch free tv shows",
    "live tv",
    "radio",
  ],
};

export default function HomePage() {
  return <HomePageClient />;
}
