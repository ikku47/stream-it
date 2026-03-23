'use client';
import Head from "next/head";
import { useEffect, useState } from "react";
import Hero from "@/components/ui/Hero";
import GenreBar from "@/components/ui/GenreBar";
import MediaRow from "@/components/ui/MediaRow";
import ChannelRow from "@/components/ui/ChannelRow";
import CategoryRow from "@/components/ui/CategoryRow";
import { useRows } from "@/hooks/useTMDB";
import { HOME_GENRES, LANGUAGES, YEARS } from "@/lib/tmdb";
import useStore from "@/store/useStore";

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
      <GenreBar />

      <div className="pb-24 pt-8 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        {/* Priority: Continue Watching */}
        {mounted && !loading && !currentGenreId && continueWatching.length > 0 && (
          <MediaRow title="Resume Playback" emoji="▶️" items={continueWatching} loading={false} />
        )}

        {/* Home Mix Section 1: Top Rows */}
        {loading
          ? Array.from({ length: 2 }, (_, i) => <MediaRow key={i} title="" items={[]} loading={true} />)
          : rows.slice(0, 2).map((row: any) => (
            <MediaRow key={row.title} title={row.title} emoji={row.emoji} items={row.items} loading={false} />
          ))
        }

        {/* Live TV Channels Row */}
        {!currentGenreId && <ChannelRow title="Broadcast: Live Channels" emoji="📡" />}

        {/* Discovery: Genres */}
        {!currentGenreId && <CategoryRow title="Explore by Category" emoji="📂" items={genreItems} type="categories" />}

        {/* Discovery: Languages */}
        {!currentGenreId && <CategoryRow title="Global Languages" emoji="🌐" items={languageItems} type="languages" />}

        {/* Favourites Section */}
        {mounted && !loading && !currentGenreId && favourites.length > 0 && (
          <MediaRow title="Personal Collection" emoji="⭐" items={favourites} loading={false} />
        )}

        {/* Discovery: Years */}
        {!currentGenreId && <CategoryRow title="Released by Year" emoji="📅" items={yearItems} type="years" />}

      </div>
    </>
  );
}
