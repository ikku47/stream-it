'use client';

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FilterBar from "./FilterBar";
import SelectionGrid from "./SelectionGrid";
import MediaCard from "../cards/MediaCard";
import SkeletonCard from "../cards/SkeletonCard";
import { useDiscover } from "@/hooks/useDiscover";
import { HOME_GENRES, LANGUAGES, YEARS, getCategorySlug, getLanguageSlug } from "@/lib/tmdb";
import { ChevronLeft, Loader2 } from "lucide-react";

interface DiscoverLayoutProps {
  pageType: "category" | "language" | "year" | "collection";
  title: string;
  initialSelection?: string | number | null;
  initialGenre?: string | number | null;
  initialYear?: string | null;
  initialCategory?: string | null;
  initialType?: "movie" | "tv" | null;
}

function DiscoverContent({ pageType, title, initialSelection = null, initialGenre = null, initialYear = null, initialCategory = null, initialType = null }: DiscoverLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSelection = initialSelection;

  // Filter States
  const [type, setType] = useState<"movie" | "tv">(initialType || (searchParams.get("type") as any) || "movie");
  const [genre, setGenre] = useState<string | number | null>(pageType === "category" ? initialSelection : (initialGenre ?? null));
  const [language, setLanguage] = useState<string | null>(pageType === "language" ? String(initialSelection ?? "") || null : null);
  const [year, setYear] = useState<string | null>(pageType === "year" ? String(initialSelection ?? "") || null : (initialYear ?? null));
  const [category, setCategory] = useState<string | null>(initialCategory || searchParams.get("category"));
  const [searchQuery, setSearchQuery] = useState("");

  type DiscoverOption = { id: string | number | null; name: string };

  const { items, loading, loadMore, hasMore } = useDiscover({
    type,
    genre,
    language,
    year,
    searchQuery,
    category,
  });

  const getSelectionItems = (): DiscoverOption[] => {
    switch (pageType) {
      case "category": return HOME_GENRES.filter(g => g.id !== null);
      case "language": return LANGUAGES;
      case "year": return YEARS.map(y => ({ id: y, name: String(y) }));
      case "collection": return [];
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
  const handleSelection = (selection: string | number | null) => {
    if (pageType === "category") {
      const selected = HOME_GENRES.find((g) => String(g.id) === String(selection));
      if (selected?.id !== null) {
        router.push(`/categories/${getCategorySlug(selected)}`);
      }
      return;
    }
    if (pageType === "language") {
      const selected = LANGUAGES.find((l) => String(l.id) === String(selection));
      if (selected) {
        router.push(`/languages/${getLanguageSlug(selected)}`);
      }
      return;
    }
    if (pageType === "year") {
      router.push(`/years/${selection}`);
    }
  };

  if (pageType !== "collection" && activeSelection === null) {
    return (
      <SelectionGrid
        title={title}
        items={getSelectionItems()}
        onSelect={handleSelection}
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
        genres={HOME_GENRES.filter((g) => g.id !== null)}
        languages={LANGUAGES}
        years={YEARS.map((y) => ({ id: y, name: String(y) }))}
        hiddenFilter={pageType === "category" ? "genre" : pageType === "language" ? "language" : "year"}
        onClear={handleClearFilter}
      />

      {/* Content Area */}
      <div className="pt-8 px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide flex items-center gap-3">
            <button
              onClick={() => router.push(pageType === "category" ? "/categories" : pageType === "language" ? "/languages" : "/years")}
              className="text-white/40 hover:text-white transition-colors text-2xl pb-1"
            >
              <ChevronLeft />
            </button>
            {pageType === "collection" ? title : getPrimaryLabel()}
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

export default function DiscoverLayout(props: DiscoverLayoutProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand" />
          <p className="text-white/40 text-sm font-medium animate-pulse tracking-widest uppercase">Initializing Discovery...</p>
        </div>
      </div>
    }>
      <DiscoverContent {...props} />
    </Suspense>
  );
}
