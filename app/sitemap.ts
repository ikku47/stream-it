import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { HOME_GENRES, LANGUAGES, YEARS, slugify } from "@/lib/tmdb";

type SitemapEntry = {
  url: string;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
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

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryEntries = HOME_GENRES.filter((genre) => genre.id !== null).map((genre) => ({
    url: `/categories/${slugify(genre.name)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const languageEntries = LANGUAGES.map((language) => ({
    url: `/languages/${String(language.id).toLowerCase()}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const yearEntries = YEARS.map((year) => ({
    url: `/years/${year}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return toAbsoluteSitemap([...baseEntries, ...categoryEntries, ...languageEntries, ...yearEntries]);
}
