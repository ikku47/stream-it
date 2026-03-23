'use client';
import Head from "next/head";
import { Heart } from "lucide-react";
import MediaCard from "@/components/cards/MediaCard";
import useStore from "@/store/useStore";

export default function FavouritesPage() {
    const { favourites } = useStore();

    return (
        <>
            <Head>
                <title>My Favourites – JoyFlix</title>
            </Head>

            <div className="pt-24 pb-16 px-4 md:px-8 min-h-screen">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand)] flex items-center justify-center shadow-lg shadow-brand/20">
                            <Heart className="w-6 h-6 text-white fill-current" />
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
                            My Favourites
                        </h1>
                    </div>
                </div>

                {/* Results grid */}
                {favourites && favourites.length > 0 ? (
                    <>
                        <p className="text-[var(--color-text-mute)] text-sm mb-5 font-body">
                            {favourites.length} item{favourites.length !== 1 ? "s" : ""} in your library
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
                            {favourites.map((item: MediaItem) => (
                                <MediaCard 
                                    key={`${item.id}-${item.media_type || 'unknown'}`} 
                                    item={item} 
                                    inGrid 
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                            <Heart className="w-10 h-10 text-[var(--color-text-dim)]" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="font-display text-4xl text-[var(--color-text-mute)] tracking-wide">
                                Your library is empty
                            </p>
                            <p className="text-[var(--color-text-dim)] text-sm font-body max-w-sm mx-auto">
                                Add movies and series to your favourites to keep track of what you want to watch.
                            </p>
                        </div>
                        <a 
                            href="/"
                            className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                        >
                            Browse Content
                        </a>
                    </div>
                )}
            </div>
        </>
    );
}
