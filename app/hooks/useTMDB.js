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
    const cfg = ROW_CONFIG[tab] || ROW_CONFIG.home;

    Promise.all(
      cfg.map(async (r) => {
        try {
          let endpoint = r.endpoint;
          const params = { page: 1 };

          // If a genre is selected, we MUST use /discover since /movie/popular, /trending, etc ignore with_genres
          if (genreId) {
            params.with_genres = genreId;

            const isMovie = endpoint.includes("/movie/") || endpoint.includes("trending/movie");
            const isTV = endpoint.includes("/tv/") || endpoint.includes("trending/tv");
            const type = isMovie ? "movie" : isTV ? "tv" : "movie"; // Default to movie for mixed endpoints

            endpoint = `/discover/${type}`;
            
            // Replicate the original endpoint's behavior using sorting/filtering
            if (r.endpoint.includes("top_rated")) {
              params.sort_by = "vote_average.desc";
              params["vote_count.gte"] = 200;
            } else if (r.endpoint.includes("airing") || r.endpoint.includes("now_playing")) {
              params.sort_by = "popularity.desc";
              // Ideally we'd filter by release date but keep it simple
            } else {
              params.sort_by = "popularity.desc"; // Default for popular/trending
            }
          }

          const data  = await tmdb(endpoint, params);
          const items = (data.results || [])
            .filter((i) => i.poster_path)
            .map(normalizeItem);
          return { title: r.title, icon: r.icon, items };
        } catch { return { title: r.title, icon: r.icon, items: [] }; }
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

/* ── Item details + season/episodes ────────────────── */
export function useItemDetails(id, type, initialDetails = null) {
  const [details, setDetails] = useState(initialDetails);

  useEffect(() => {
    if (!id || !type) return;
    tmdb(`/${type}/${id}`, { append_to_response: 'credits,similar' })
      .then(setDetails)
      .catch((err) => console.error("Error fetching details", err));
  }, [id, type]);

  const fetchSeasonEpisodes = useCallback(async (season) => {
    if (type !== 'tv') return [];
    try {
      const data = await tmdb(`/tv/${id}/season/${season}`);
      return data.episodes || [];
    } catch { return []; }
  }, [id, type]);

  return { details, fetchSeasonEpisodes };
}

/* ── Person details + Combined Credits ───────────────── */
export function usePersonDetails(id, initialPerson = null, initialCredits = []) {
  const [person, setPerson] = useState(initialPerson);
  const [credits, setCredits] = useState(initialCredits);
  const [loading, setLoading] = useState(!initialPerson);

  useEffect(() => {
    if (!id) return;
    tmdb(`/person/${id}`, { append_to_response: 'combined_credits' })
      .then(data => {
        setPerson(data);
        const sorted = (data.combined_credits?.cast || [])
          .filter(c => c.poster_path)
          .sort((a,b) => (b.popularity || 0) - (a.popularity || 0));
        setCredits(sorted);
      })
      .catch((err) => console.error("Error fetching person details", err))
      .finally(() => setLoading(false));
  }, [id, initialPerson]);

  return { person, credits, loading };
}

/* ── Search ──────────────────────────────────────────── */
import { searchRadioStations } from "../lib/radio";

export function useSearch(query) {
  const { setSearchResults, setRadioResults, setSearchLoading } = useStore();

  useEffect(() => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setRadioResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const [tmdbData, radioData] = await Promise.all([
          tmdb("/search/multi", { query }),
          searchRadioStations(query, 50)
        ]);
        
        const items = (tmdbData.results || []).filter(
          (i) => (i.media_type === "movie" || i.media_type === "tv") && i.poster_path
        );
        
        setSearchResults(items);
        setRadioResults(radioData);
      } catch { 
        setSearchResults([]); 
        setRadioResults([]);
      }
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
