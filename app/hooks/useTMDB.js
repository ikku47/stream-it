// hooks/useTMDB.js
import { useEffect, useState, useCallback } from "react";
import { tmdb, ROW_CONFIG, normalizeItem } from "../lib/tmdb";
import useStore from "../store/useStore";

/* ── Row data for a tab+genre ─────────────────────────── */
export function useRows(tab, genreId) {
  const { rowCache, setRowCache, setHeroItem } = useStore();
  const key = `${tab}_${genreId ?? "null"}`;
  const cached = rowCache[key];

  const [rows,    setRows]    = useState(cached || []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) { setRows(cached); setLoading(false); return; }
    let dead = false;
    setLoading(true);
    const cfg    = ROW_CONFIG[tab] || ROW_CONFIG.home;
    const params = genreId ? { with_genres: genreId, page: 1 } : { page: 1 };

    Promise.all(
      cfg.map(async (r) => {
        try {
          const data  = await tmdb(r.endpoint, params);
          const items = (data.results || [])
            .filter((i) => i.poster_path)
            .map(normalizeItem);
          return { title: r.title, emoji: r.emoji, items };
        } catch { return { title: r.title, emoji: r.emoji, items: [] }; }
      })
    ).then((results) => {
      if (dead) return;
      const filtered = results.filter((r) => r.items.length);
      setRows(filtered);
      setRowCache(key, filtered);
      setLoading(false);
      if (filtered[0]?.items.length) {
        const pool = filtered[0].items.slice(0, 6);
        setHeroItem(pool[Math.floor(Math.random() * pool.length)]);
      }
    });
    return () => { dead = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, genreId]);

  return { rows, loading };
}

/* ── Genre map ───────────────────────────────────────── */
export function useGenreMap() {
  const { genreMap, setGenreMap } = useStore();
  useEffect(() => {
    if (genreMap) return;
    Promise.all([tmdb("/genre/movie/list"), tmdb("/genre/tv/list")])
      .then(([m, t]) => {
        const map = {};
        [...(m.genres || []), ...(t.genres || [])].forEach((g) => { map[g.id] = g.name; });
        setGenreMap(map);
      })
      .catch(() => setGenreMap({}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return genreMap;
}

/* ── TV details + season/episode ─────────────────────── */
export function useTVDetails(id, enabled) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!enabled || !id) return;
    tmdb(`/tv/${id}`).then(setDetails).catch(() => {});
  }, [id, enabled]);

  const fetchEpisodes = useCallback(async (season) => {
    try {
      const data = await tmdb(`/tv/${id}/season/${season}`);
      return (data.episodes || []).length || 12;
    } catch { return 12; }
  }, [id]);

  return { details, fetchEpisodes };
}

/* ── Search ──────────────────────────────────────────── */
export function useSearch(query) {
  const { setSearchResults, setSearchLoading } = useStore();

  useEffect(() => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const data  = await tmdb("/search/multi", { query });
        const items = (data.results || []).filter(
          (i) => (i.media_type === "movie" || i.media_type === "tv") && i.poster_path
        );
        setSearchResults(items);
      } catch { setSearchResults([]); }
      finally  { setSearchLoading(false); }
    }, 420);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
}

/* ── Trailer ─────────────────────────────────────────── */
export async function fetchTrailer(id, type) {
  const data    = await tmdb(`/${type}/${id}/videos`);
  const trailer = (data.results || []).find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}
