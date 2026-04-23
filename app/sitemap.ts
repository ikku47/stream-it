import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { HOME_GENRES, LANGUAGES, ROW_CONFIG, YEARS, normalizeItem, slugify, tmdb } from "@/lib/tmdb";

type SitemapEntry = {
  url: string;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
};

type HomeRowItem = {
  id?: string | number;
  media_type?: "movie" | "tv";
  poster_path?: string | null;
  title?: string | null;
  name?: string | null;
};

const baseEntries: SitemapEntry[] = [
  { url: "/", changeFrequency: "daily", priority: 1 },
  { url: "/trending", changeFrequency: "daily", priority: 0.9 },
  { url: "/movies", changeFrequency: "weekly", priority: 0.9 },
  { url: "/tv", changeFrequency: "weekly", priority: 0.9 },
  { url: "/live-tv", changeFrequency: "weekly", priority: 0.8 },
  { url: "/radio", changeFrequency: "weekly", priority: 0.8 },
  { url: "/categories", changeFrequency: "weekly", priority: 0.8 },
  { url: "/languages", changeFrequency: "weekly", priority: 0.8 },
  { url: "/years", changeFrequency: "weekly", priority: 0.8 },
  { url: "/about", changeFrequency: "monthly", priority: 0.5 },
  { url: "/policy", changeFrequency: "monthly", priority: 0.5 },
  { url: "/dmca", changeFrequency: "monthly", priority: 0.5 },
];

function toAbsoluteSitemap(entries: SitemapEntry[]): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return entries.map((entry) => ({
    url: getSiteUrl(entry.url),
    lastModified,
    ...(entry.changeFrequency ? { changeFrequency: entry.changeFrequency } : {}),
    ...(typeof entry.priority === "number" ? { priority: entry.priority } : {}),
  }));
}

async function getHomeDetailEntries(): Promise<SitemapEntry[]> {
  const rowConfigs = [...ROW_CONFIG.home, ...ROW_CONFIG.movies, ...ROW_CONFIG.tv];
  const settled = await Promise.allSettled(
    rowConfigs.map(async (row) => {
      const data = await tmdb(row.endpoint, { page: 1 });

      return ((data.results || []) as HomeRowItem[])
        .map(normalizeItem)
        .filter((item) => item.id && item.poster_path)
        .filter((item) => item.media_type === "movie" || item.media_type === "tv")
        .map((item) => ({
          url: item.media_type === "tv" ? `/tv-show/${item.id}` : `/${item.media_type}/${item.id}`,
          changeFrequency: "weekly" as const,
          priority: 0.75,
        }));
    })
  );

  const entries = settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

async function getTrendingPersonEntries(): Promise<SitemapEntry[]> {
  try {
    const data = await tmdb("/trending/person/week", { page: 1 });
    return ((data.results || []) as any[])
      .filter((p) => p.id && p.profile_path)
      .map((p) => ({
        url: `/person/${p.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch {
    return [];
  }
}

async function getCollectionEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  const topGenres = HOME_GENRES.filter((g) => g.id !== null).slice(0, 10);
  const recentYears = YEARS.slice(0, 5);

  topGenres.forEach((genre) => {
    recentYears.forEach((year) => {
      entries.push({
        url: `/best/${slugify(genre.name)}-movies-${year}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      });
    });
  });
  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categoryEntries: SitemapEntry[] = HOME_GENRES.filter((genre) => genre.id !== null).map((genre) => ({
    url: `/categories/${slugify(genre.name)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const languageEntries: SitemapEntry[] = LANGUAGES.map((language) => ({
    url: `/languages/${String(language.id).toLowerCase()}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const yearEntries: SitemapEntry[] = YEARS.map((year) => ({
    url: `/years/${year}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const [detailEntries, collectionEntries, movieData, tvData, personEntries] = await Promise.all([
    getHomeDetailEntries(),
    getCollectionEntries(),
    tmdb("/movie/popular", { page: 1 }),
    tmdb("/tv/popular", { page: 1 }),
    getTrendingPersonEntries(),
  ]);

  const movies = (movieData.results || []).map((m: any) => ({
    url: `/movie/${m.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const series = (tvData.results || []).map((t: any) => ({
    url: `/tv-show/${t.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const movieCategories = ["popular", "top-rated", "upcoming", "now-playing"].map((slug) => ({
    url: `/movies/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const tvCategories = ["popular", "top-rated", "airing-today", "on-the-air"].map((slug) => ({
    url: `/tv/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const trendingSlugs = ["today", "week", "movies", "tv"].map((slug) => ({
    url: `/trending/${slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return toAbsoluteSitemap([
    ...baseEntries,
    ...categoryEntries,
    ...languageEntries,
    ...yearEntries,
    ...detailEntries,
    ...collectionEntries,
    ...movies,
    ...series,
    ...toAbsoluteSitemap(personEntries as any),
    ...movieCategories,
    ...tvCategories,
    ...trendingSlugs,
  ]);
}
