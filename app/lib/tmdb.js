// lib/tmdb.js
import useStore from "@/store/useStore";
export const TMDB_KEY = "2dca580c2a14b55200e784d157207b4d";
export const TMDB_BASE = "https://api.themoviedb.org/3";
export const IMG_BASE = "https://image.tmdb.org/t/p/";

export const img = (path, size = "w500") =>
  path ? `${IMG_BASE}${size}${path}` : null;

export const imgFallback = (path, size = "w342") =>
  img(path, size) ||
  `https://via.placeholder.com/${size === "original" ? "1280x720" : "300x450"}/100f18/444?text=No+Image`;

export const getPosterImage = (item, size = "w342") =>
  img(item?.poster_path || item?.backdrop_path || item?.profile_path, size);

export const getBackdropImage = (item, size = "original") =>
  img(item?.backdrop_path || item?.poster_path, size);

export const getMediaImage = (item, kind = "poster", size = "w342") =>
  kind === "backdrop"
    ? getBackdropImage(item, size)
    : getPosterImage(item, size);

export async function tmdb(endpoint, params = {}) {
  const region = useStore.getState().region;
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", TMDB_KEY);
  url.searchParams.set("language", "en-US");
  
  if (region) {
    if (endpoint.includes("/discover/") || endpoint.includes("/movie/") || endpoint.includes("/tv/")) {
      url.searchParams.set("region", region);
      url.searchParams.set("watch_region", region);
    }
  }

  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export async function fetchWatchProviders(id, type) {
  try {
    const region = useStore.getState().region || "US";
    const data = await tmdb(`/${type}/${id}/watch/providers`);
    const results = data.results || {};
    // Prioritize user region, then US, then GB, then anything available
    const regional = results[region] || results.US || results.GB || Object.values(results)[0] || {};
    console.log("Watch Providers for region", region, ":", regional);
    return {
      link: regional.link,
      flatrate: regional.flatrate || []
    };
  } catch {
    return { link: null, flatrate: [] };
  }
}

export const scoreColor = (s) =>
  s >= 7.5 ? "var(--color-score-high)"
    : s >= 6 ? "var(--color-score-mid)"
      : "var(--color-score-low)";

export const formatYear = (s) => (s ? new Date(s).getFullYear().toString() : "");
export const isTV = (i) => i?.media_type === "tv" || i?.first_air_date !== undefined;
export const getTitle = (i) => i?.title || i?.name || "—";
export const getYear = (i) => formatYear(i?.release_date || i?.first_air_date);
export const getMediaLabel = (i) => `${getTitle(i)}${getYear(i) ? ` (${getYear(i)})` : ""}`;
export const normalizeItem = (i) => ({ ...i, media_type: isTV(i) ? "tv" : "movie" });

export const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getCategorySlug = (category) => slugify(category?.name);
export const getLanguageSlug = (language) => String(language?.id || "").toLowerCase();
export const findCategoryBySlug = (slug) => HOME_GENRES.find((g) => g.id !== null && slugify(g.name) === slug) || null;
export const findLanguageBySlug = (slug) => LANGUAGES.find((l) => String(l.id).toLowerCase() === String(slug).toLowerCase()) || null;

export const HOME_GENRES = [
  { id: null, name: "All" },
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" }
];

export const ROW_CONFIG = {
  home: [
    { title: "Trending This Week", endpoint: "/trending/all/week", icon: "Flame" },
    { title: "Popular Movies", endpoint: "/movie/popular", icon: "Clapperboard" },
    { title: "Popular TV Shows", endpoint: "/tv/popular", icon: "Tv" },
    { title: "Top Rated Movies", endpoint: "/movie/top_rated", icon: "Star" },
    { title: "Now Playing", endpoint: "/movie/now_playing", icon: "Theater" },
    { title: "Airing Today", endpoint: "/tv/airing_today", icon: "Radio" },
    { title: "Top Rated TV", endpoint: "/tv/top_rated", icon: "Trophy" },
    { title: "Upcoming Movies", endpoint: "/movie/upcoming", icon: "Calendar" },
  ],
  movies: [
    { title: "Popular Movies", endpoint: "/movie/popular", icon: "Clapperboard" },
    { title: "Top Rated", endpoint: "/movie/top_rated", icon: "Star" },
    { title: "Now Playing", endpoint: "/movie/now_playing", icon: "Theater" },
    { title: "Upcoming", endpoint: "/movie/upcoming", icon: "Calendar" },
  ],
  tv: [
    { title: "Popular Shows", endpoint: "/tv/popular", icon: "Tv" },
    { title: "Top Rated", endpoint: "/tv/top_rated", icon: "Star" },
    { title: "Airing Today", endpoint: "/tv/airing_today", icon: "Radio" },
    { title: "On The Air", endpoint: "/tv/on_the_air", icon: "RadioTower" },
  ],
};

export const LANGUAGES = [
  { id: "en", name: "English" },
  { id: "hi", name: "हिन्दी" },
  { id: "es", name: "Español" },
  { id: "fr", name: "Français" },
  { id: "ja", name: "日本語" },
  { id: "ko", name: "한국어" },
  { id: "zh", name: "中文" },
  { id: "ar", name: "العربية" },
  { id: "ru", name: "Русский" },
  { id: "pt", name: "Português" },
  { id: "de", name: "Deutsch" },
  { id: "it", name: "Italiano" },
  { id: "te", name: "తెలుగు" },
  { id: "ta", name: "தமிழ்" },
  { id: "bn", name: "বাংলা" },
  { id: "ml", name: "മലയാളം" },
  { id: "kn", name: "ಕನ್ನಡ" },
  { id: "mr", name: "मराठी" },
  { id: "gu", name: "ગુજરાતી" },
  { id: "pa", name: "ਪੰਜਾਬੀ" },
  { id: "ur", name: "اردو" }
];

const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);

export const getProviderSearchUrl = (provider, title) => {
  const q = encodeURIComponent(title);
  const id = provider.provider_id;

  // Mapping of TMDB provider IDs to search/base URLs
  const searchMap = {
    8: `https://www.netflix.com/search?q=${q}`,            // Netflix
    337: `https://www.disneyplus.com/search?q=${q}`,        // Disney+
    350: `https://tv.apple.com/search?term=${q}`,           // Apple TV+
    119: `https://www.amazon.com/s?k=${q}&i=instant-video`,  // Amazon Prime
    15: `https://www.hulu.com/search?q=${q}`,              // Hulu
    384: `https://proweb.max.com/search?q=${q}`,            // HBO Max / Max
    2: `https://tv.apple.com/search?term=${q}`,           // Apple TV (iTunes)
    10: `https://www.amazon.com/s?k=${q}&i=instant-video`,  // Amazon Video
    192: `https://www.youtube.com/results?search_query=${q}`, // YouTube
    300: `https://www.paramountplus.com/search/?q=${q}`,    // Paramount+
    210: `https://www.sky.com/search?q=${q}`,               // Sky
    444: `https://viaplay.com/search?query=${q}`,             // Viaplay
  };

  return searchMap[id] || `https://www.google.com/search?q=watch+${q}+on+${encodeURIComponent(provider.provider_name)}`;
};
