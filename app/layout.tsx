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

const siteUrl = getSiteUrl();
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Stream It",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Stream It",
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Watch Free Movies, Free Series, Live TV & Radio",
    template: "%s | Stream It",
  },
  description: "Watch free movies, free series, live TV, and radio with rich artwork, fast browsing, and discovery rows.",
  applicationName: "Stream It",
  keywords: [
    "watch free movies",
    "free movies",
    "free series",
    "free tv shows",
    "watch free series",
    "free movies online",
    "live tv",
    "radio",
    "streaming discovery",
    "movie discovery",
    "tv discovery",
  ],
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Stream It",
    description: "Watch free movies, free series, live TV, and radio in one fast streaming hub.",
    siteName: "Stream It",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stream It",
    description: "Watch free movies, free series, live TV, and radio in one fast streaming hub.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
