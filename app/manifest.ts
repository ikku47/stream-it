export default function manifest() {
  return {
    name: "Stream It",
    short_name: "Stream It",
    description: "A streaming discovery platform for movies, TV series, live channels, and radio.",
    start_url: "/",
    display: "standalone",
    background_color: "#111111",
    theme_color: "#111111",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
