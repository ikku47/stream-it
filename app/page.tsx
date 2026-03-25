'use client';
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Hero from "@/components/ui/Hero";
import MediaRow from "@/components/ui/MediaRow";
import ChannelRow from "@/components/ui/ChannelRow";
import CategoryRow from "@/components/ui/CategoryRow";
import { useRows } from "@/hooks/useTMDB";
import { HOME_GENRES, LANGUAGES, YEARS } from "@/lib/tmdb";
import useStore from "@/store/useStore";
import { Headphones, MoveRight } from "lucide-react";

export default function HomePage() {
  const { currentGenreId, setTab, heroItem, favourites, continueWatching } = useStore();
  const { rows, loading } = useRows("home", currentGenreId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTab("home");
    setMounted(true);
  }, [setTab]);

  const genreItems = HOME_GENRES.filter(g => g.id !== null);
  const languageItems = LANGUAGES.slice(0, 15).map(l => ({ id: l.id, name: l.name }));
  const yearItems = YEARS.slice(0, 15).map(y => ({ id: y, name: String(y) }));

  return (
    <>
      <Head>
        <title>JoyFlix – Premium Streaming Discovery</title>
      </Head>

      <Hero item={heroItem} />

      <div className="pb-24 pt-8 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        {/* Priority: Continue Watching */}
        {mounted && !loading && !currentGenreId && continueWatching.length > 0 && (
          <MediaRow title="Resume Playback" icon="RotateCcw" items={continueWatching} loading={false} />
        )}

        {/* Home Mix Section 1: Top Rows */}
        {loading
          ? Array.from({ length: 2 }, (_, i) => <MediaRow key={i} title="" items={[] as any} loading={true} />)
          : rows.slice(0, 2).map((row: any) => (
            <MediaRow key={row.title} title={row.title} icon={row.icon} items={row.items} loading={false} />
          ))
        }

        {/* Live TV Channels Row */}
        {!currentGenreId && <ChannelRow title="Broadcast: Live Channels" icon="RadioTower" />}

        {!currentGenreId && (
          <section className="mb-10 px-4 md:px-8">
            <Link
              href="/music"
              className="group relative block overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.24),transparent_28%),linear-gradient(135deg,#171117_0%,#0b0a11_62%,#161118_100%)] p-6 md:p-8"
            >
              <div className="absolute right-[-2rem] top-[-2rem] h-36 w-36 rounded-full bg-orange-400/20 blur-3xl" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/65">
                    <Headphones className="h-3.5 w-3.5 text-[var(--color-brand)]" />
                    New music section
                  </div>
                  <h2 className="font-display text-4xl leading-none tracking-[0.04em] text-white md:text-5xl">
                    Jump from the watchlist to the soundtrack.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--color-text-mute)] md:text-base">
                    Search YouTube Music, browse top tracks, and open albums or playlists straight from JoyFlix.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)] transition-transform duration-300 group-hover:translate-x-1">
                  Explore Music
                  <MoveRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Discovery: Genres */}
        {!currentGenreId && <CategoryRow title="Explore by Category" icon="LayoutGrid" items={genreItems} type="categories" />}
 
        {/* Discovery: Languages */}
        {!currentGenreId && <CategoryRow title="Global Languages" icon="Languages" items={languageItems} type="languages" />}
 
        {/* Favourites Section */}
        {mounted && !loading && !currentGenreId && favourites.length > 0 && (
          <MediaRow title="Personal Collection" icon="Heart" items={favourites} loading={false} />
        )}
 
        {/* Discovery: Years */}
        {!currentGenreId && <CategoryRow title="Released by Year" icon="History" items={yearItems} type="years" />}

      </div>
    </>
  );
}
