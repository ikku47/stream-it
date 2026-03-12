'use client'
// pages/tv/index.jsx
import Head from "next/head";
import { useEffect } from "react";
import Hero from "@/components/ui/Hero";
import GenreBar from "@/components/ui/GenreBar";
import MediaRow from "@/components/ui/MediaRow";
import { useRows } from "@/hooks/useTMDB";
import useStore from "@/store/useStore";

export default function TVPage() {
    const { currentGenreId, setTab, heroItem } = useStore();
    const { rows, loading } = useRows("tv", currentGenreId);

    useEffect(() => { setTab("tv"); }, []);

    return (
        <>
            <Head>
                <title>TV Shows – JoyFlix</title>
            </Head>

            <Hero item={heroItem} />

            <div className="px-4 md:px-8 pt-6 pb-1 flex items-center gap-3">
                <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">TV Shows</h1>
                <div
                    className="h-0.5 flex-1 rounded-full"
                    style={{ background: "linear-gradient(to right, var(--color-brand), transparent)" }}
                />
            </div>

            <GenreBar />

            <div className="pb-12">
                {loading
                    ? Array.from({ length: 3 }, (_, i) => (
                        <MediaRow key={i} title="" emoji="" items={[] as MediaItem[]} loading={true} />
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
