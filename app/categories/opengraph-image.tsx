import { buildSectionOgImage } from "@/lib/og";

export const alt = "Stream It categories preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return buildSectionOgImage({
    title: "Categories",
    subtitle: "Browse movies and TV series by genre with a bold, structured discovery view.",
    accent: "#f97316",
    highlight: "Movies",
  });
}
