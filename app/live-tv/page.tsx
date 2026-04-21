import LiveTVPage3Column from "@/components/live-tv/Livetvpage3column";
import type { Metadata } from "next";
import {
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...makeRouteMetadata(
    "Watch Free Live TV Channels | Stream It",
    "Watch free live TV channels with broadcast details, direct playback, and fast discovery.",
    "/live-tv"
  ),
  keywords: [
    "watch free live tv",
    "free live tv",
    "live tv channels",
    "watch live tv",
    "live tv discovery",
  ],
};

export default function LiveTV() {
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Live TV", url: "/live-tv" },
    ]),
    getWebPageJsonLd(
      "Watch Free Live TV Channels",
      "Watch free live TV channels with broadcast details, direct playback, and fast discovery.",
      "/live-tv"
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <LiveTVPage3Column />
    </>
  );
}
