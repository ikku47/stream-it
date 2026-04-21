import type { Metadata } from "next";
import Link from "next/link";
import { getBreadcrumbJsonLd, getWebPageJsonLd, makeRouteMetadata } from "@/lib/seo";

export const metadata: Metadata = makeRouteMetadata(
  "About | Stream It",
  "Learn what Stream It does, how it is built, and what kind of media discovery experience it provides.",
  "/about"
);

export default function AboutPage() {
  const canonical = "/about";
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "About", url: canonical },
    ]),
    getWebPageJsonLd(
      "About Stream It",
      "Stream It is an open-source movie and TV discovery platform with live channels, radio, and fast browsing.",
      canonical
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="px-4 md:px-8 pt-24 pb-20 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--color-brand)]">
              About Stream It
            </p>
            <h1 className="font-display text-4xl md:text-6xl tracking-wide text-white">
              A cinematic discovery platform for movies, TV, live channels, and radio.
            </h1>
            <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-3xl">
              Stream It is an open-source streaming discovery app built for fast browsing, rich artwork, and a clean
              content-first experience. It pulls in movie and TV metadata from TMDB and combines that with live TV and
              radio discovery so users can explore one place for multiple kinds of media.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-display text-white mb-4">What it includes</h2>
              <ul className="space-y-3 text-white/65 leading-relaxed">
                <li>Movie and TV browse pages with discovery rows and detail screens.</li>
                <li>Category, language, and year filtering for broader discovery.</li>
                <li>Live TV channel browsing through IPTV sources.</li>
                <li>Radio station discovery through public radio-browser data.</li>
                <li>Search, favourites, and continue-watching state stored locally in the browser.</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-display text-white mb-4">How it is built</h2>
              <ul className="space-y-3 text-white/65 leading-relaxed">
                <li>Next.js App Router with TypeScript and React 19.</li>
                <li>TMDB metadata for posters, titles, cast, and media details.</li>
                <li>Zustand for local UI state and persisted preferences.</li>
                <li>Tailwind CSS for the visual system and layout styling.</li>
                <li>Open search and streaming-provider integrations for flexible browsing.</li>
              </ul>
            </section>
          </div>

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-display text-white mb-4">For users</h2>
            <p className="text-white/65 leading-relaxed max-w-4xl">
              This app is designed as a discovery and navigation layer. It helps users find movies, TV shows, live
              channels, and radio stations faster, but it does not host the underlying media itself.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/policy"
                className="px-5 py-3 rounded-xl bg-[var(--color-brand)] text-white font-medium hover:opacity-90 transition"
              >
                Read Policy
              </Link>
              <Link
                href="/"
                className="px-5 py-3 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 transition"
              >
                Browse Content
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
