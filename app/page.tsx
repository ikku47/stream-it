'use client';
// pages/index.jsx
import Head from "next/head";
import { useEffect, useState } from "react";
import Hero from "@/components/ui/Hero";
import GenreBar from "@/components/ui/GenreBar";
import MediaRow from "@/components/ui/MediaRow";
import { useRows } from "@/hooks/useTMDB";
import useStore from "@/store/useStore";

export default function HomePage() {
  const { currentGenreId, setTab, heroItem, favourites, continueWatching } = useStore();
  const { rows, loading } = useRows("home", currentGenreId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setTab("home"); 
    setMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>JoyFlix – Watch Movies &amp; TV Shows</title>
      </Head>

      <Hero item={heroItem} />
      <GenreBar />

      <div className="pb-12">
        {mounted && !loading && !currentGenreId && continueWatching.length > 0 && (
          <MediaRow title="Continue Watching" emoji="▶️" items={continueWatching} loading={false} />
        )}
        {mounted && !loading && !currentGenreId && favourites.length > 0 && (
          <MediaRow title="My Favourites" emoji="⭐️" items={favourites} loading={false} />
        )}
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
            <MediaRow key={i} title="" items={[] as any[]} loading={true} emoji="" />
          ))
          : rows.map((row: any) => (
            <MediaRow
              key={row.title}
              title={row.title}
              emoji={row.emoji || ""}
              items={row.items}
              loading={false}
            />
          ))}
      </div>
    </>
  );
}
