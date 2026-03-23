'use client';
// pages/search/index.jsx
import Head from "next/head";
import { useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import MediaCard from "@/components/cards/MediaCard";
import { useSearch } from "@/hooks/useTMDB";
import useStore from "@/store/useStore";

export default function SearchPage() {
    const { searchQuery, searchResults, searchLoading, setSearchOpen } = useStore();
    useSearch(searchQuery); // reactive search

    // Ensure search bar is open when on this page
    useEffect(() => { setSearchOpen(true); }, []);

    return (
        <>
            <Head>
                <title>Search – JoyFlix</title>
            </Head>

            <div className="pt-24 pb-16 px-4 md:px-8 min-h-screen">
                {/* Header */}
                <div className="mb-8">
                    {searchQuery ? (
                        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
                            Results for{" "}
                            <span style={{ color: "var(--color-brand)" }}>&ldquo;{searchQuery}&rdquo;</span>
                        </h1>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                            <Search className="w-16 h-16 text-[var(--color-text-dim)]" />
                            <p className="font-display text-4xl text-[var(--color-text-mute)] tracking-wide">
                                Search for movies &amp; shows
                            </p>
                            <p className="text-[var(--color-text-dim)] text-sm font-body">
                                Use the search bar above to find your favorites
                            </p>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {searchLoading && (
                    <div className="flex items-center gap-3 text-[var(--color-text-mute)] mb-6">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-body">Searching…</span>
                    </div>
                )}

                {/* Results grid */}
                {!searchLoading && searchResults.length > 0 && (
                    <>
                        <p className="text-[var(--color-text-mute)] text-sm mb-5 font-body">
                            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
                            {searchResults.map((item: MediaItem) => (
                                <MediaCard key={`${item.id}-${item.media_type}`} item={item} inGrid />
                            ))}
                        </div>
                    </>
                )}

                {/* No results */}
                {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <span className="text-5xl">🎬</span>
                        <p className="font-display text-3xl text-[var(--color-text-mute)] tracking-wide">
                            No results found
                        </p>
                        <p className="text-[var(--color-text-dim)] text-sm font-body">
                            Try a different title or check your spelling
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
