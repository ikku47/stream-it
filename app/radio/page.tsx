import Radio from "@/components/radio/Radio";
import type { Metadata } from "next";
import {
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...makeRouteMetadata(
    "Watch Free Radio Stations | Stream It",
    "Listen to free radio stations from around the world with an easy discovery experience.",
    "/radio"
  ),
  keywords: [
    "free radio",
    "radio stations",
    "watch free radio",
    "listen to radio",
    "radio discovery",
  ],
};

export default function RadioPage() {
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Radio", url: "/radio" },
    ]),
    getWebPageJsonLd(
      "Watch Free Radio Stations",
      "Listen to free radio stations from around the world with an easy discovery experience.",
      "/radio"
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Radio />
    </>
  );
}
