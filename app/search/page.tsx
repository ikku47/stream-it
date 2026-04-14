'use client';
import { useEffect } from "react";
import { Search as SearchIcon, Loader2, Radio, Clapperboard } from "lucide-react";
import MediaCard from "@/components/cards/MediaCard";
import RadioCard from "@/components/cards/RadioCard";
import { useSearch } from "@/hooks/useTMDB";
import useStore from "@/store/useStore";

export default function SearchPage() {
    const { searchQuery, searchResults, radioResults, searchLoading, setSearchOpen } = useStore();
    useSearch(searchQuery);

    useEffect(() => { setSearchOpen(true); }, [setSearchOpen]);

    const totalCount = searchResults.length + radioResults.length;

    return (
        <div className="pt-24 pb-32 px-4 md:px-8 min-h-screen bg-black text-white">
            <div className="max-w-[1800px] mx-auto">
            {/* Search State Indicator */}
                <div className="mb-12">
                    {searchQuery ? (
                        <div className="space-y-2">
                             <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                                Results for <span className="text-orange-500">&quot;{searchQuery}&quot;</span>
                             </h1>
                             {!searchLoading && (
                                <p className="text-white/40 font-medium uppercase tracking-[0.3em] text-xs">
                                    {totalCount} Items discovered across global archive
                                </p>
                             )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8">
                                <SearchIcon className="w-10 h-10 text-white/20" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">What&apos;s on your mind?</h2>
                            <p className="text-white/40 max-w-md mx-auto text-lg leading-relaxed">
                                Search for movies, actors, world radio stations, or live broadcasters from across the globe.
                            </p>
                        </div>
                    )}
                </div>

                {searchLoading && (
                    <div className="flex items-center gap-4 text-orange-500 mb-12 animate-pulse">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="font-black uppercase tracking-widest text-sm">Searching World Archives...</span>
                    </div>
                )}

                {!searchLoading && searchQuery.length >= 2 && (
                    <div className="space-y-20">
                        {/* Radio Results Section */}
                        {radioResults.length > 0 && (
                            <section className="animate-fade-in">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-orange-500/20 rounded-lg">
                                        <Radio className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">World Radio Stations</h2>
                                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest uppercase">Global Archive</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-6">
                                    {radioResults.map((station: RadioStation) => (
                                        <RadioCard key={station.id} station={station} inGrid={true} compact={true} spotify={true} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Media Results Section */}
                        {searchResults.length > 0 && (
                            <section className="animate-fade-in">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                                        <Clapperboard className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">Movies & TV Shows</h2>
                                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest uppercase">TMDB Data</span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
                                    {searchResults.map((item: MediaItem) => (
                                        <MediaCard key={`${item.id}-${item.media_type}`} item={item} inGrid />
                                    ))}
                                </div>
                            </section>
                        )}

                        {totalCount === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="text-6xl mb-6">🏝️</div>
                                <h3 className="text-3xl font-black tracking-tight mb-2">No broadcasts found</h3>
                                <p className="text-white/40">Try searching for a different genre, country, or title.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
