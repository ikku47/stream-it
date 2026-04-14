'use client';
import { useEffect } from "react";
import Hero from "@/components/ui/Hero";
import MediaRow from "@/components/ui/MediaRow";
import ChannelRow from "@/components/ui/ChannelRow";
import CategoryRow from "@/components/ui/CategoryRow";
import RadioRow from "@/components/ui/RadioRow";
import { useRows } from "@/hooks/useTMDB";
import { HOME_GENRES, LANGUAGES, YEARS } from "@/lib/tmdb";
import useStore from "@/store/useStore";

export default function HomePage() {
  const { currentGenreId, setTab, heroItem, favourites, continueWatching } = useStore();
  const { rows, loading } = useRows("home", currentGenreId);

  useEffect(() => {
    setTab("home");
  }, [setTab]);

  const genreItems = HOME_GENRES.filter(g => g.id !== null);
  const languageItems = LANGUAGES.slice(0, 15).map(l => ({ id: l.id, name: l.name }));
  const yearItems = YEARS.slice(0, 15).map(y => ({ id: y, name: String(y) }));

  return (
    <>
      <Hero item={heroItem} />

      <div className="pb-24 pt-8 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        {/* Priority: Continue Watching */}
        {!loading && !currentGenreId && continueWatching.length > 0 && (
          <MediaRow title="Resume Playback" icon="RotateCcw" items={continueWatching} loading={false} />
        )}

        {/* Home Mix Section 1: Top Rows */}
        {loading
          ? Array.from({ length: 2 }, (_, i) => <MediaRow key={i} title="" items={[]} loading={true} />)
          : rows.slice(0, 2).map((row: MediaRowType) => (
            <MediaRow key={row.title} title={row.title} icon={row.icon} items={row.items} loading={false} />
          ))
        }

        {/* Live TV Channels Row */}
        {!currentGenreId && <ChannelRow title="Broadcast: Live Channels" icon="RadioTower" />}

        {/* Radio Broadcasts Row */}
        {!currentGenreId && <RadioRow title="Live Radio Stations" icon="Mic2" />}

        {/* Discovery: Genres */}
        {!currentGenreId && <CategoryRow title="Explore by Category" icon="LayoutGrid" items={genreItems} type="categories" />}
 
        {/* Discovery: Languages */}
        {!currentGenreId && <CategoryRow title="Global Languages" icon="Languages" items={languageItems} type="languages" />}
 
        {/* Favourites Section */}
        {!loading && !currentGenreId && favourites.length > 0 && (
          <MediaRow title="Personal Collection" icon="Heart" items={favourites} loading={false} />
        )}
 
        {/* Discovery: Years */}
        {!currentGenreId && <CategoryRow title="Released by Year" icon="History" items={yearItems} type="years" />}

      </div>
    </>
  );
}
