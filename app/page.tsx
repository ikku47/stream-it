'use client';
// pages/index.jsx
import Head from "next/head";
import { useEffect } from "react";
import Hero from "@/components/ui/Hero";
import GenreBar from "@/components/ui/GenreBar";
import MediaRow from "@/components/ui/MediaRow";
import { useRows } from "@/hooks/useTMDB";
import useStore from "@/store/useStore";

export default function HomePage() {
  const { currentGenreId, setTab, heroItem } = useStore();
  const { rows, loading } = useRows("home", currentGenreId);

  useEffect(() => { setTab("home"); }, []);

  return (
    <>
      <Head>
        <title>JoyFlix – Watch Movies &amp; TV Shows</title>
      </Head>

      <Hero item={heroItem} />
      <GenreBar />

      <div className="pb-12">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
            <MediaRow key={i} title="" items={[] as MediaItem[]} loading={true} emoji="" />
          ))
          : rows.map((row: MediaRowType) => (
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
