import LiveTVPage3Column from "@/components/live-tv/Livetvpage3column";
import {
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export const metadata = makeRouteMetadata(
  "Live TV | Stream It",
  "Browse live TV channels with broadcast details and direct playback.",
  "/live-tv"
);

export default function LiveTV() {
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Live TV", url: "/live-tv" },
    ]),
    getWebPageJsonLd(
      "Live TV",
      "Browse live TV channels with broadcast details and direct playback.",
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
