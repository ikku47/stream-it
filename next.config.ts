import type { NextConfig } from "next";

const isTauri = process.env.TAURI_ENV === 'true';

const nextConfig: NextConfig = {
  // Use static export ONLY during 'npm run build' for Tauri production
  // We NEVER use 'export' during development (npm run dev) as it breaks dynamic routes
  output: isTauri && process.env.NODE_ENV === 'production' ? 'export' : undefined,
  
  images: {
    // Only unoptimize images if we're doing a static export
    unoptimized: isTauri && process.env.NODE_ENV === 'production',
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
