import { buildSectionOgImage } from "@/lib/og";

export const alt = "Stream It years preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return buildSectionOgImage({
    title: "Years",
    subtitle: "Explore movies and shows by release year with a clean timeline-style browse view.",
    accent: "#38bdf8",
    highlight: "Movies",
  });
}
