import { buildSectionOgImage } from "@/lib/og";

export const alt = "Stream It languages preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return buildSectionOgImage({
    title: "Languages",
    subtitle: "Find international movies and TV series faster with language-first discovery.",
    accent: "#22c55e",
    highlight: "TV Shows",
  });
}
