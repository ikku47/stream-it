// lib/tmdb.js
export const TMDB_KEY = "2dca580c2a14b55200e784d157207b4d";
export const TMDB_BASE = "https://api.themoviedb.org/3";
export const IMG_BASE = "https://image.tmdb.org/t/p/";
export const PLAYER_URL = "https://tmdbplayer.nunesnetwork.com/";

export const img = (path, size = "w500") =>
  path ? `${IMG_BASE}${size}${path}` : null;

export const imgFallback = (path, size = "w342") =>
  img(path, size) ||
  `https://via.placeholder.com/300x450/100f18/444?text=No+Image`;

export async function tmdb(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", TMDB_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export const scoreColor = (s) =>
  s >= 7.5 ? "var(--color-score-high)"
    : s >= 6 ? "var(--color-score-mid)"
      : "var(--color-score-low)";

export const formatYear = (s) => (s ? new Date(s).getFullYear().toString() : "");
export const isTV = (i) => i?.media_type === "tv" || i?.first_air_date !== undefined;
export const getTitle = (i) => i?.title || i?.name || "—";
export const getYear = (i) => formatYear(i?.release_date || i?.first_air_date);
export const normalizeItem = (i) => ({ ...i, media_type: isTV(i) ? "tv" : "movie" });

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
    { title: "Trending This Week", endpoint: "/trending/all/week", emoji: "🔥" },
    { title: "Popular Movies", endpoint: "/movie/popular", emoji: "🎬" },
    { title: "Popular TV Shows", endpoint: "/tv/popular", emoji: "📺" },
    { title: "Top Rated Movies", endpoint: "/movie/top_rated", emoji: "⭐" },
    { title: "Now Playing", endpoint: "/movie/now_playing", emoji: "🎭" },
    { title: "Airing Today", endpoint: "/tv/airing_today", emoji: "📡" },
    { title: "Top Rated TV", endpoint: "/tv/top_rated", emoji: "🏆" },
    { title: "Upcoming Movies", endpoint: "/movie/upcoming", emoji: "🗓" },
  ],
  movies: [
    { title: "Popular Movies", endpoint: "/movie/popular", emoji: "🎬" },
    { title: "Top Rated", endpoint: "/movie/top_rated", emoji: "⭐" },
    { title: "Now Playing", endpoint: "/movie/now_playing", emoji: "🎭" },
    { title: "Upcoming", endpoint: "/movie/upcoming", emoji: "🗓" },
  ],
  tv: [
    { title: "Popular Shows", endpoint: "/tv/popular", emoji: "📺" },
    { title: "Top Rated", endpoint: "/tv/top_rated", emoji: "⭐" },
    { title: "Airing Today", endpoint: "/tv/airing_today", emoji: "📡" },
    { title: "On The Air", endpoint: "/tv/on_the_air", emoji: "📻" },
  ],
  trending: [
    { title: "Trending Today", endpoint: "/trending/all/day", emoji: "📈" },
    { title: "Trending This Week", endpoint: "/trending/all/week", emoji: "📅" },
    { title: "Trending Movies", endpoint: "/trending/movie/week", emoji: "🎥" },
    { title: "Trending TV", endpoint: "/trending/tv/week", emoji: "📺" },
  ],
};

export const LANGUAGES = [
  { id: "en", name: "English" },
  { id: "es", name: "Spanish" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
  { id: "it", name: "Italian" },
  { id: "ja", name: "Japanese" },
  { id: "ko", name: "Korean" },
  { id: "zh", name: "Chinese" },
  { id: "hi", name: "Hindi" },
  { id: "ru", name: "Russian" },
  { id: "pt", name: "Portuguese" },
  { id: "ar", name: "Arabic" },
  // India (TMDB supported)
  { id: "hi", name: "Hindi" },
  { id: "bn", name: "Bengali" },
  { id: "ta", name: "Tamil" },
  { id: "te", name: "Telugu" },
  { id: "ml", name: "Malayalam" },
  { id: "kn", name: "Kannada" },
  { id: "mr", name: "Marathi" },
  { id: "gu", name: "Gujarati" },
  { id: "pa", name: "Punjabi" },
  { id: "ur", name: "Urdu" },
];

const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);

