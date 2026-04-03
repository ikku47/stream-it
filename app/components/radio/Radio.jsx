'use client';

import { Search, Play, Mic2, Globe, Library, Sparkles, Menu, Home, Compass, Heart, Clock, ListMusic, MoreHorizontal, LayoutGrid, List, X, Languages, TrendingUp, Radio, ChevronLeft } from "lucide-react";
import useStore from "@/store/useStore";
import { getTopRadioStations, getRadioCountries, getRadioTags, searchRadioStations, getStationsByCountry, getStationsByTag, getRadioLanguages, getStationsByLanguage, getTrendingRadioStations } from "@/lib/radio";
import RadioCard from "../cards/RadioCard";
import { useEffect, useState, useRef, useMemo } from "react";

/**
 * ─── SPOTIFY STYLE SIDEBAR ─────────────────────────────────────────────────────
 */
const SpotifySidebar = ({ 
    countries, tags, languages, favourites, selectedCategory, onSelectCategory, loading, isOpen, onClose 
}) => {
    const [libSearch, setLibSearch] = useState("");

    const filteredCountries = useMemo(() => 
        countries.filter(c => c.name.toLowerCase().includes(libSearch.toLowerCase())),
    [countries, libSearch]);

    const filteredTags = useMemo(() => 
        tags.filter(t => t.name.toLowerCase().includes(libSearch.toLowerCase())),
    [tags, libSearch]);

    const filteredLangs = useMemo(() => 
        languages.filter(l => l.name.toLowerCase().includes(libSearch.toLowerCase())),
    [languages, libSearch]);

    const filteredFavourites = useMemo(() => 
        favourites.filter(f => f.type === 'radio' && f.name.toLowerCase().includes(libSearch.toLowerCase())),
    [favourites, libSearch]);

    return (
        <aside className={`fixed top-16 md:top-0 lg:relative inset-y-0 left-0 z-[140] w-72 shrink-0 bg-black flex flex-col overflow-hidden transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl shadow-orange-500/20'}`}>
            <div className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between mb-2 lg:hidden">
                    <button 
                        onClick={onClose}
                        className="p-2 -ml-2 text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="text-xs font-bold text-white/20 uppercase tracking-[0.2em]">Nav Archive</span>
                </div>
                <button className="flex items-center gap-4 w-full px-4 py-2.5 rounded-md text-sm font-bold text-white transition-colors">
                    <Radio className="w-6 h-6" />
                    <span>World Radio</span>
                </button>
                <div className="relative group px-4 py-2.5">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white" />
                    <input 
                        type="text" 
                        placeholder="Search your library..." 
                        value={libSearch}
                        onChange={(e) => setLibSearch(e.target.value)}
                        className="w-full bg-[#121212] rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white"
                    />
                </div>
            </div>

            <div className="flex-1 m-2 bg-[#121212] rounded-xl flex flex-col overflow-hidden shadow-inner">
                <div className="p-4 pb-2">
                    <button className="flex items-center gap-3 text-white/50 hover:text-white transition-colors">
                        <Library className="w-6 h-6" />
                        <span className="font-bold text-sm">Your Archive</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-2 space-y-6 pb-24">
                    
                    {/* Core Collection */}
                    {!libSearch && (
                        <div className="space-y-1">
                            {/* Favourites Entry */}
                             {favourites.length > 0 && (
                                <button
                                    onClick={() => onSelectCategory({ type: 'favourites', value: 'Liked Stations' })}
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all ${selectedCategory.type === 'favourites' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center flex-shrink-0 animate-pulse">
                                        <Heart className="w-5 h-5 text-white fill-current" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[13px] font-bold">Liked Stations</p>
                                        <p className="text-[11px] opacity-60">Playlist • {favourites.filter(f => f.type === 'radio').length} stations</p>
                                    </div>
                                </button>
                             )}

                            {/* Trending Entry */}
                            <button
                                onClick={() => onSelectCategory({ type: 'trending', value: 'Trending Now' })}
                                className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all ${selectedCategory.type === 'trending' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                            >
                                <div className="w-12 h-12 rounded-md bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[13px] font-bold">Trending Now</p>
                                    <p className="text-[11px] opacity-60">Based on recent clicks</p>
                                </div>
                            </button>

                            {/* Global Top Entry */}
                            <button
                                onClick={() => onSelectCategory({ type: 'top', value: 'Global Radio' })}
                                className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all ${selectedCategory.type === 'top' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                            >
                                <div className="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-700 to-indigo-900 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[13px] font-bold">Global Radio</p>
                                    <p className="text-[11px] opacity-60">Archive • Discovery</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Regional Section */}
                    {filteredCountries.length > 0 && (
                        <div className="space-y-2">
                            <p className="px-3 text-[11px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <Globe className="w-3 h-3" />
                                Regions
                            </p>
                            <div className="space-y-1">
                                {filteredCountries.slice(0, libSearch ? 100 : 20).map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => onSelectCategory({ type: 'country', value: c.iso_3166_1, label: c.name })}
                                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all ${selectedCategory.value === c.iso_3166_1 ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <p className="text-[10px] font-black text-white/20 uppercase">{c.iso_3166_1}</p>
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-[13px] font-bold truncate">{c.name}</p>
                                            <p className="text-[11px] opacity-60">{c.stationcount} Stations</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages Section */}
                    {filteredLangs.length > 0 && (
                        <div className="space-y-2">
                            <p className="px-3 text-[11px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <Languages className="w-3 h-3" />
                                Languages
                            </p>
                            <div className="space-y-1">
                                {filteredLangs.slice(0, libSearch ? 100 : 20).map(l => (
                                    <button
                                        key={l.name}
                                        onClick={() => onSelectCategory({ type: 'language', value: l.name })}
                                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all ${selectedCategory.value === l.name ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                           <Languages className="w-5 h-5 opacity-20" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-[13px] font-bold truncate capitalize">{l.name}</p>
                                            <p className="text-[11px] opacity-60">{l.stationcount} Stations</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Genres Section */}
                    {filteredTags.length > 0 && (
                        <div className="space-y-2 pb-24">
                            <p className="px-3 text-[11px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <ListMusic className="w-3 h-3" />
                                Music Styles
                            </p>
                            <div className="space-y-1">
                                {filteredTags.slice(0, libSearch ? 100 : 20).map(t => (
                                    <button
                                        key={t.name}
                                        onClick={() => onSelectCategory({ type: 'tag', value: t.name })}
                                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all ${selectedCategory.value === t.name ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <ListMusic className="w-5 h-5 opacity-20" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-[13px] font-bold truncate capitalize">{t.name}</p>
                                            <p className="text-[11px] opacity-60">{t.stationcount} Stations</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

/**
 * ─── MAIN VIEW ──────────────────────────────────────────────────────────────
 */
export default function RadioPage() {
    const { setTab, setActiveRadioStation, favourites } = useStore();
    const [stations, setStations] = useState([]);
    const [countries, setCountries] = useState([]);
    const [tags, setTags] = useState([]);
    const [languages, setLanguages] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [stationsLoading, setStationsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState({ type: 'top', value: 'Global Radio' });
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const mainRef = useRef(null);

    useEffect(() => {
        setTab("radio");
        async function init() {
            setLoading(true);
            try {
                const [cData, tData, lData] = await Promise.all([getRadioCountries(), getRadioTags(), getRadioLanguages()]);
                setCountries(cData);
                setTags(tData);
                setLanguages(lData);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [setTab]);

    useEffect(() => {
        async function loadStations() {
            setStationsLoading(true);
            try {
                let data = [];
                if (searchQuery) data = await searchRadioStations(searchQuery, 1000);
                else if (selectedCategory.type === 'favourites') data = favourites.filter(f => f.type === 'radio');
                else if (selectedCategory.type === 'trending') data = await getTrendingRadioStations(1000);
                else if (selectedCategory.type === 'top') data = await getTopRadioStations(1000);
                else if (selectedCategory.type === 'country') data = await getStationsByCountry(selectedCategory.value, 1000);
                else if (selectedCategory.type === 'tag') data = await getStationsByTag(selectedCategory.value, 1000);
                else if (selectedCategory.type === 'language') data = await getStationsByLanguage(selectedCategory.value, 1000);
                setStations(data);
                if (mainRef.current) mainRef.current.scrollTo(0, 0);
            } finally {
                setStationsLoading(false);
            }
        }
        const timer = setTimeout(loadStations, searchQuery ? 500 : 0);
        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery, favourites]);

    const handlePlay = (station) => {
        setActiveRadioStation(station);
    };

    return (
        <div className="flex  h-[calc(100vh-64px)] md:h-screen fixed top-16 md:top-0 left-0 md:left-[80px] right-0 bg-[var(--color-bg)] text-white overflow-hidden font-body">
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130] lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <SpotifySidebar 
                countries={countries} 
                tags={tags} 
                languages={languages}
                favourites={favourites}
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
                loading={loading}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main ref={mainRef} className="flex-1 m-2 bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-xl overflow-y-auto custom-scrollbar relative shadow-2xl">
                <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-transparent backdrop-blur-md">
                    <div className="flex items-center gap-4">
                         <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-white/50 hover:text-white"><Menu /></button>
                         <div className="relative group min-w-[200px] md:min-w-[400px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search stations or genres..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#242424] hover:bg-[#2a2a2a] border-none rounded-full py-2.5 pl-12 pr-6 w-full text-sm text-white focus:ring-1 focus:ring-white transition-all placeholder:text-white/40"
                            />
                        </div>
                    </div>
                </header>

                <div className="px-6 py-4">
                    <div className="relative h-60 md:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#000] p-8 flex items-end shadow-2xl border border-white/5">
                        {/* Dynamic category bg */}
                        <div className={`absolute inset-0 opacity-40 mix-blend-overlay ${selectedCategory.type === 'trending' ? 'bg-gradient-to-r from-orange-600 to-red-800' : selectedCategory.type === 'top' ? 'bg-gradient-to-r from-indigo-800 to-purple-900' : 'bg-gradient-to-r from-blue-900 to-black'}`} />
                        <div className="absolute inset-0 bg-black/40" />
                        
                        <div className="relative z-10 flex items-center gap-8 animate-fade-in">
                            <div className="w-40 h-40 md:w-56 md:h-56 bg-white/5 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                                {selectedCategory.type === 'top' ? (
                                    <Sparkles className="w-24 h-24 text-white/20" />
                                ) : selectedCategory.type === 'country' ? (
                                    <Globe className="w-24 h-24 text-white/20" />
                                ) : selectedCategory.type === 'language' ? (
                                    <Languages className="w-24 h-24 text-white/20" />
                                ) : selectedCategory.type === 'trending' ? (
                                    <TrendingUp className="w-24 h-24 text-white/20" />
                                ) : selectedCategory.type === 'favourites' ? (
                                    <Heart className="w-24 h-24 text-white/20 fill-current" />
                                ) : (
                                    <ListMusic className="w-24 h-24 text-white/20" />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/80">Broadcaster Discovery</p>
                                <h2 className="text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none pr-4 capitalize truncate max-w-[600px]">
                                    {selectedCategory.label || selectedCategory.value}
                                </h2>
                                <div className="flex items-center gap-2 mt-4 text-[13px] text-white/80">
                                    <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white font-black text-[10px]">R</div>
                                    <span className="font-bold">Real-time Archive</span>
                                    <span className="opacity-50">• {stations.length > 0 ? stations.length : '...'} stations currently verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 pt-8">
                     <div className="h-px bg-white/5 w-full" />
                </div>

                <div className="px-6 pb-32 pt-8">
                    {stationsLoading ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-6">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-[#1a1a1a] rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-6">
                            {stations.map(station => (
                                <div key={station.id} onClick={() => handlePlay(station)} className="cursor-pointer">
                                    <RadioCard station={station} inGrid={true} compact={true} spotify={true} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
