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
          url: `/${item.media_type}/${item.id}`,
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

  const detailEntries = await getHomeDetailEntries();

  return toAbsoluteSitemap([
    ...baseEntries,
    ...categoryEntries,
    ...languageEntries,
    ...yearEntries,
    ...detailEntries,
  ]);
}
