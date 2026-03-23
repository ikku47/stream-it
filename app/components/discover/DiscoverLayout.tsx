'use client';

import React, { useState, useEffect } from "react";
import FilterBar from "./FilterBar";
import SelectionGrid from "./SelectionGrid";
import MediaCard from "../cards/MediaCard";
import SkeletonCard from "../cards/SkeletonCard";
import { useDiscover } from "@/hooks/useDiscover";
import { HOME_GENRES, LANGUAGES, YEARS } from "@/lib/tmdb";
import { ChevronLeft, Loader2 } from "lucide-react";

interface DiscoverLayoutProps {
  pageType: "category" | "language" | "year";
  title: string;
}

export default function DiscoverLayout({ pageType, title }: DiscoverLayoutProps) {
  const [activeSelection, setActiveSelection] = useState<string | number | null>(null);

  // Filter States
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [genre, setGenre] = useState<string | number | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // When activeSelection changes, set the corresponding filter
  useEffect(() => {
    if (activeSelection !== null) {
      if (pageType === "category") setGenre(activeSelection);
      if (pageType === "language") setLanguage(String(activeSelection));
      if (pageType === "year") setYear(String(activeSelection));
    }
  }, [activeSelection, pageType]);

  const { items, loading, loadMore, hasMore } = useDiscover({
    type,
    genre,
    language,
    year,
    searchQuery,
  });

  const getSelectionItems = () => {
    switch (pageType) {
      case "category": return HOME_GENRES.filter(g => g.id !== null);
      case "language": return LANGUAGES;
      case "year": return YEARS.map(y => ({ id: y, name: String(y) }));
    }
  };

  const getPrimaryLabel = () => {
    const items = getSelectionItems();
    const active = items.find(i => String(i.id) === String(activeSelection));
    return active ? active.name : title;
  };

  // Handle intersection observer for infinite scrolling
  const observerTarget = React.useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [loadMore]);

  // If no primary selection is made, show the grid.
  if (activeSelection === null) {
    return (
      <SelectionGrid
        title={title}
        items={getSelectionItems() as any}
        onSelect={setActiveSelection}
      />
    );
  }

  const handleClearFilter = () => {
    if (pageType !== "category") setGenre(null);
    if (pageType !== "language") setLanguage(null);
    if (pageType !== "year") setYear(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-16">

      {/* Header and Filter */}
      <FilterBar
        type={type}
        setType={setType}
        genre={genre}
        setGenre={setGenre}
        language={language}
        setLanguage={setLanguage}
        year={year}
        setYear={setYear}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        genres={HOME_GENRES as any}
        languages={LANGUAGES}
        years={YEARS as any}
        hiddenFilter={pageType === "category" ? "genre" : pageType === "language" ? "language" : "year"}
        onClear={handleClearFilter}
      />

      {/* Content Area */}
      <div className="pt-8 px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide flex items-center gap-3">
            <button onClick={() => setActiveSelection(null)} className="text-white/40 hover:text-white transition-colors text-2xl pb-1">
              <ChevronLeft />
            </button>
            {getPrimaryLabel()}
            <span className="text-xl text-brand font-body px-2 py-0.5 rounded-lg bg-brand/10 border border-brand/20 ml-2 shadow-sm">
              {type === "movie" ? "Movies" : "TV Shows"}
            </span>
          </h2>
          <span className="text-[var(--color-text-dim)] text-sm font-medium font-body hidden sm:block">
            Discovering new favorites
          </span>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
          {items.map((item) => (
            <MediaCard key={`${item.id}-${item.media_type}`} item={item} inGrid />
          ))}
          {loading && items.length === 0 && Array.from({ length: 14 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>

        {/* Loading More Indicator */}
        <div ref={observerTarget} className="py-12 flex justify-center w-full">
          {loading && items.length > 0 && (
            <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading more...
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <div className="text-white/30 text-sm font-medium">- End of results -</div>
          )}
        </div>

        {/* No Results */}
        {!loading && items.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
            <span className="text-6xl filter grayscale opacity-50">🍿</span>
            <h3 className="font-display text-2xl text-white/60 tracking-wide">No titles found</h3>
            <p className="text-[var(--color-text-dim)] text-sm font-body max-w-sm">
              Try adjusting your filters or switching between Movies and TV Shows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
