import Radio from "@/components/radio/Radio";
import {
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  makeRouteMetadata,
} from "@/lib/seo";

export const metadata = makeRouteMetadata(
  "Radio | Stream It",
  "Listen to radio stations from around the world with an easy discovery experience.",
  "/radio"
);

export default function RadioPage() {
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Radio", url: "/radio" },
    ]),
    getWebPageJsonLd(
      "Radio",
      "Listen to radio stations from around the world with an easy discovery experience.",
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
