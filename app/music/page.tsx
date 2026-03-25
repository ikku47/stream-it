"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { Loader2, Search, Volume2 } from "lucide-react";
import { useMusicHome, useMusicSearch } from "@/hooks/useMusic";
import MusicRow from "@/components/music/MusicRow";
import MusicPlayerDock from "@/components/music/MusicPlayerDock";
import type { MusicCardItem } from "@/lib/music";
import useMusicStore from "@/store/useMusicStore";

export default function MusicPage() {
  const [query, setQuery] = useState("");
  const nowPlaying = useMusicStore((state) => state.nowPlaying);
  const setNowPlaying = useMusicStore((state) => state.setNowPlaying);
  const { data: homeData, loading, error } = useMusicHome();
  const { data: searchData, loading: searchLoading, error: searchError } = useMusicSearch(query);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const showSearch = query.trim().length >= 2;

  return (
    <>
      <Head>
        <title>Music – JoyFlix</title>
      </Head>

      <div className="min-h-screen pb-24">
        <section className="relative px-4 pb-10 pt-24 md:px-8 md:pt-12">
          <div className="absolute inset-x-0 top-0 h-[240px] bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_42%),linear-gradient(180deg,#171117_0%,#090810_60%)]" />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/65">
              <Volume2 className="h-3.5 w-3.5 text-[var(--color-brand)]" />
              In-app music player
            </div>

            <h1 className="font-display text-5xl leading-[0.95] tracking-[0.03em] text-white md:text-6xl">
              Music inside JoyFlix.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-mute)] md:text-base">
              Search tracks and browse multiple shelves without leaving the app.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-[22px] border border-white/10 bg-black/30 px-5 py-4 backdrop-blur-xl">
                <Search className="h-4 w-4 text-white/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search songs, albums, artists, playlists"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                />
              </div>
            </div>
          </div>
        </section>

        {showSearch ? (
          <section className="px-4 md:px-8">
            <div className="mb-6 flex items-center gap-3 text-[var(--color-text-mute)]">
              {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <p className="text-sm">
                {searchLoading ? "Searching YouTube Music..." : `Results for “${query.trim()}”`}
              </p>
            </div>

            {searchError && (
              <div className="mb-8 rounded-[22px] border border-amber-500/20 bg-amber-500/8 px-5 py-4 text-sm text-amber-100/90">
                {searchError}
              </div>
            )}

            {searchData?.topResult && (
              <MusicRow title="Top Match" kicker="Best hit" items={[searchData.topResult]} onPlay={setNowPlaying} />
            )}

            {searchData?.sections.map((section) => (
              <MusicRow
                key={section.title}
                title={section.title}
                kicker="Search shelf"
                items={section.items}
                onPlay={setNowPlaying}
              />
            ))}

            {!searchLoading && !searchError && searchData && searchData.sections.length === 0 && !searchData.topResult && (
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-6 py-12 text-center text-sm text-[var(--color-text-mute)]">
                Nothing surfaced for that search yet. Try an artist name, track title, or playlist.
              </div>
            )}
          </section>
        ) : (
          <>
            {error && (
              <div className="px-4 md:px-8">
                <div className="mb-8 rounded-[22px] border border-amber-500/20 bg-amber-500/8 px-5 py-4 text-sm text-amber-100/90">
                  {error}
                </div>
              </div>
            )}

            {loading && !homeData ? (
              <div className="px-4 md:px-8">
                <MusicRow title="Top Songs Right Now" kicker="Pulse" items={[]} loading />
                <MusicRow title="Trending Right Now" kicker="Heatwave" items={[]} loading />
              </div>
            ) : (
              homeData?.sections.map((section) => (
                <MusicRow
                  key={section.id}
                  title={section.title}
                  kicker={section.kicker}
                  items={section.items}
                  onPlay={setNowPlaying}
                />
              ))
            )}
          </>
        )}
      </div>

      <MusicPlayerDock item={nowPlaying} onClose={() => setNowPlaying(null)} />
    </>
  );
}
