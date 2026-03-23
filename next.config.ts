import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

const nextConfig: NextConfig = {
  // Ensure Next.js can be used in a desktop app (Tauri)
  output: isProd ? 'export' : undefined,
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
  // If you are using a custom domain for your local development
  // you might need to specify it here
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
};

export default nextConfig;
