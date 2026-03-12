import React, { useEffect, useRef } from "react";
import { Filter, X, Search } from "lucide-react";

interface FilterOption {
  id: string | number | null;
  name: string;
}

interface FilterBarProps {
  type: "movie" | "tv";
  setType: (type: "movie" | "tv") => void;
  genre: string | number | null;
  setGenre: (g: string | number | null) => void;
  language: string | null;
  setLanguage: (l: string | null) => void;
  year: string | null;
  setYear: (y: string | null) => void;
  genres: FilterOption[];
  languages: FilterOption[];
  years: FilterOption[];
  hiddenFilter?: "genre" | "language" | "year";
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onClear: () => void;
}

export default function FilterBar({
  type, setType,
  genre, setGenre,
  language, setLanguage,
  year, setYear,
  genres, languages, years,
  hiddenFilter,
  searchQuery, setSearchQuery,
  onClear
}: FilterBarProps) {
  
  // Custom styled select component
  const Select = ({ value, onChange, options, placeholder, hidden }: any) => {
    if (hidden) return null;
    
    return (
      <div className="relative">
        <select
          value={value === null ? "all" : String(value)}
          onChange={(e) => onChange(e.target.value === "all" ? null : e.target.value)}
          className="appearance-none bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)] transition-all cursor-pointer hover:border-white/20 font-body block w-full max-w-[160px]"
        >
          <option value="all">{placeholder}</option>
          {options.map((opt: any) => (
            <option key={String(opt.id) || "all"} value={opt.id === null ? "all" : String(opt.id)}>
              {opt.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    );
  };

  const hasActiveFilters = 
    (hiddenFilter !== "genre" && genre !== null) || 
    (hiddenFilter !== "language" && language !== null) || 
    (hiddenFilter !== "year" && year !== null) ||
    (searchQuery && searchQuery.trim().length > 0);

  return (
    <div className="sticky top-[64px] z-40 px-4 md:px-8 py-3 glass border-b border-[var(--color-border)] shadow-md animate-fade-down">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto overflow-visible pb-1 md:pb-0">
          <div className="flex items-center gap-2 text-white/70 px-2 flex-shrink-0">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider hidden sm:inline-block">Filters</span>
          </div>
          
          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

          {/* Type Toggle */}
          <div className="flex bg-[var(--color-surface-3)] rounded-lg p-1 border border-[var(--color-border)] flex-shrink-0">
            <button
              onClick={() => setType("movie")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${type === "movie" ? "bg-[var(--color-brand)] text-white shadow-sm" : "text-white/60 hover:text-white"}`}
            >
              Movies
            </button>
            <button
              onClick={() => setType("tv")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${type === "tv" ? "bg-[var(--color-brand)] text-white shadow-sm" : "text-white/60 hover:text-white"}`}
            >
              TV Shows
            </button>
          </div>

          <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Filter by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)] transition-all hover:border-white/20 font-body w-full sm:w-[180px]"
            />
          </div>

          {/* Dynamic Filters */}
          <Select 
            value={genre} 
            onChange={setGenre} 
            options={genres.filter((g) => g.id !== null)} 
            placeholder="All Categories" 
            hidden={hiddenFilter === "genre"} 
          />
          <Select 
            value={language} 
            onChange={setLanguage} 
            options={languages} 
            placeholder="All Languages" 
            hidden={hiddenFilter === "language"} 
          />
          <Select 
            value={year} 
            onChange={setYear} 
            options={years.map((y) => ({id: y, name: String(y)}))} 
            placeholder="All Years" 
            hidden={hiddenFilter === "year"} 
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button 
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-brand hover:text-white transition-colors bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-full flex-shrink-0 w-fit"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
