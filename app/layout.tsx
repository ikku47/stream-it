import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import PlayerOverlay from "@/components/player/PlayerOverlay";
import SpotifyPlayerBar from "@/components/radio/SpotifyPlayerBar";
import Toast from "@/components/ui/Toast";
import BraveSuggestionDialog from "@/components/layout/BraveSuggestionDialog";
import RegionManager from "@/components/layout/RegionManager";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Discover Movies, TV & Live Streams",
    template: "%s | Stream It",
  },
  description: "Stream It helps you discover movies, TV shows, live channels, and radio with rich artwork and fast browsing.",
  applicationName: "Stream It",
  keywords: [
    "movies",
    "tv shows",
    "streaming discovery",
    "live tv",
    "radio",
    "TMDB",
  ],
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Stream It",
    description: "Discover movies, TV series, live channels, and radio in one fast streaming hub.",
    siteName: "Stream It",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stream It",
    description: "Discover movies, TV series, live channels, and radio in one fast streaming hub.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stream It",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main className="min-h-screen bg-[var(--color-bg)] md:pl-[80px]">
          {children}
        </main>
        <Analytics />
        <PlayerOverlay />
        <SpotifyPlayerBar />
        <BraveSuggestionDialog />
        <RegionManager />
        <Toast />
      </body>
    </html>
  );
}
