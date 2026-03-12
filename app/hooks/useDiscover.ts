import { useEffect, useState, useRef, useCallback } from "react";
import { tmdb, normalizeItem } from "../lib/tmdb";

export interface UseDiscoverArgs {
  type?: "movie" | "tv";
  genre?: string | number | null;
  language?: string | null;
  year?: string | null;
  searchQuery?: string;
}

export function useDiscover({ type = "movie", genre, language, year, searchQuery = "" }: UseDiscoverArgs) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Reset when filters change
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, genre, language, year, searchQuery]);

  const fetchItems = useCallback(async () => {
    if (!hasMore) return;
    setLoading(true);

    try {
      const params: any = {
        page,
      };

      if (language && language !== "all") params.language = language; // Changed from with_original_language for search compatibility support
      
      let endpoint = "";
      
      if (searchQuery && searchQuery.trim().length > 0) {
        endpoint = `/search/${type}`;
        params.query = searchQuery;
        if (year && year !== "all") {
          if (type === "movie") params.primary_release_year = year;
          else params.first_air_date_year = year;
        }
      } else {
        endpoint = `/discover/${type}`;
        params.sort_by = "popularity.desc";
        
        if (genre && genre !== "all") params.with_genres = genre;
        if (language && language !== "all") params.with_original_language = language;
        if (year && year !== "all") {
          if (type === "movie") params.primary_release_year = year;
          else params.first_air_date_year = year;
        }
      }

      const data = await tmdb(endpoint, params);
      
      const newItems = (data.results || [])
        .filter((i: any) => i.poster_path)
        .map(normalizeItem);

      setItems(prev => page === 1 ? newItems : [...prev, ...newItems]);
      setHasMore(data.page < data.total_pages && data.page < 500); // tmdb limit is 500 pages
    } catch (e) {
      console.error(e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [type, genre, language, year, page, hasMore]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
    }
  };

  return { items, loading, loadMore, hasMore };
}
