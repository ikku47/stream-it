import type { Metadata } from "next";
import { Bebas_Neue, Outfit, JetBrains_Mono } from "next/font/google"

const display = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const body = Outfit({ subsets: ["latin"], variable: "--font-body" })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

import Navbar from "@/components/layout/Navbar";
import DetailModal from "@/components/modals/DetailModal";
import PlayerOverlay from "@/components/player/PlayerOverlay";
import Toast from "@/components/ui/Toast";
import BraveSuggestionDialog from "@/components/layout/BraveSuggestionDialog";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stream It",
  description: "A stunning, high-performance open-source streaming discovery platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stream It",
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
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
      >
        <Navbar />
        <main className="min-h-screen bg-[var(--color-bg)]">
          {children}
        </main>
        <DetailModal />
        <PlayerOverlay />
        <BraveSuggestionDialog />
        <Toast />
      </body>
    </html>
  );
}
