import type { Metadata } from "next";
import { cache } from "react";
import { getBackdropImage, getMediaLabel, getPosterImage, getTitle, getYear, img, tmdb } from "./tmdb";

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stream-it.watch";
const SITE_NAME = "Stream It";

type OverviewItem = {
  overview?: string | null;
};

export function getSiteUrl(path = "") {
  return new URL(path, DEFAULT_SITE_URL).toString();
}

export function getDescription(item: OverviewItem | null | undefined, fallback: string) {
  const overview = item?.overview?.trim();
  if (overview) return overview.length > 155 ? `${overview.slice(0, 152)}...` : overview;
  return fallback;
}

function mediaTypeToOgType(type: string) {
  return type === "tv" ? "video.tv_show" : "video.movie";
}

function mediaKindLabel(type: string) {
  return type === "tv" ? "TV series" : "movie";
}

export const getMediaDetails = cache(async (id: string | number, type: "movie" | "tv") => {
  try {
    return await tmdb(`/${type}/${id}`, { append_to_response: "credits,similar,videos" });
  } catch {
    return null;
  }
});

export const getPersonDetails = cache(async (id: string | number) => {
  try {
    return await tmdb(`/person/${id}`, { append_to_response: "combined_credits" });
  } catch {
    return null;
  }
});

export async function generateMediaMetadata(id: string | number, type: "movie" | "tv"): Promise<Metadata> {
  const details = await getMediaDetails(id, type);
  const titleText = details ? getTitle(details) : (type === "tv" ? "TV Series" : "Movie");
  const year = details ? getYear(details) : "";
  const title = `${titleText}${year ? ` (${year})` : ""} Full ${type === "tv" ? "Series" : "Movie"} | Watch Online | ${SITE_NAME}`;

  const cast = details?.credits?.cast?.slice(0, 3).map((c: any) => c.name).join(", ");
  const director = details?.credits?.crew?.find((c: any) => c.job === "Director" || c.job === "Executive Producer")?.name;
  
  const description = getDescription(
    details,
    `Watch ${titleText}${year ? ` (${year})` : ""}${director ? `, directed by ${director}` : ""}.${cast ? ` Starring ${cast}.` : ""} Discover posters, cast, trailer, and streaming details on ${SITE_NAME}.`
  );

  const canonical = `/${type}/${id}`;
  const poster = getPosterImage(details, "w780");
  const backdrop = getBackdropImage(details, "original");
  const images = [backdrop, poster].filter(Boolean).map((url) => ({
    url: url as string,
    alt: `${titleText} ${type} poster and cover art`,
    width: 1280,
    height: 720,
  }));

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: mediaTypeToOgType(type),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}

export async function generatePersonMetadata(id: string | number): Promise<Metadata> {
  const person = await getPersonDetails(id);
  const title = person?.name ? `${person.name} | ${SITE_NAME}` : `Cast & Crew | ${SITE_NAME}`;
  const description = getDescription(
    person,
    `Explore cast biographies, filmography, and screen credits on ${SITE_NAME}.`
  );
  const canonical = `/person/${id}`;
  const image = person?.profile_path ? img(person.profile_path, "h632") : null;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "profile",
      images: image
        ? [
            {
              url: image,
              alt: person?.name ? `${person.name} portrait` : "Profile image",
              width: 632,
              height: 948,
            },
          ]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function makeRouteMetadata(title: string, description: string, canonical: string, noindex = false): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

type StreamChannel = {
  id?: string;
  name?: string;
  group?: string;
  logo?: string;
  url?: string;
};

type RadioStation = {
  id?: string;
  name?: string;
  country?: string;
  language?: string;
  favicon?: string;
  codec?: string;
  bitrate?: number;
  tags?: string;
  url?: string;
};

type MediaDetails = {
  id?: number;
  title?: string;
  name?: string;
  overview?: string | null;
  backdrop_path?: string | null;
  poster_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  vote_average?: number | null;
  vote_count?: number | null;
  genres?: { name?: string }[];
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  runtime?: number | null;
  credits?: {
    cast?: { name: string; character: string; id: number; profile_path: string | null }[];
    crew?: { name: string; job: string }[];
  };
  videos?: {
    results?: { key: string; site: string; type: string; name: string }[];
  };
};

type PersonDetails = {
  name?: string;
  profile_path?: string | null;
  birthday?: string | null;
  place_of_birth?: string | null;
  overview?: string | null;
};

type BreadcrumbItem = {
  name: string;
  url: string;
};

function toAbsoluteUrl(url: string) {
  return new URL(url, DEFAULT_SITE_URL).toString();
}

export function getBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    })),
  };
}

export function getWebPageJsonLd(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: toAbsoluteUrl(url),
  };
}

export function getCollectionPageJsonLd(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: toAbsoluteUrl(url),
  };
}

export function getVideoObjectJsonLd(details: MediaDetails | null | undefined) {
  const trailer = details?.videos?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  if (!trailer) return null;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${getTitle(details)} Official Trailer`,
    description: getDescription(details, `Watch the official trailer for ${getTitle(details)} on ${SITE_NAME}.`),
    thumbnailUrl: [getBackdropImage(details, "original"), getPosterImage(details, "w780")].filter(Boolean),
    uploadDate: details?.release_date || details?.first_air_date || new Date().toISOString(),
    contentUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
    embedUrl: `https://www.youtube.com/embed/${trailer.key}`,
  };
}

export function getMovieJsonLd(details: MediaDetails | null | undefined, canonical: string) {
  if (!details) return null;

  const director = details.credits?.crew?.find((c) => c.job === "Director")?.name;

  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: getTitle(details),
    description: getDescription(details, `Discover movie details on ${SITE_NAME}.`),
    url: toAbsoluteUrl(canonical),
    image: [getBackdropImage(details, "original"), getPosterImage(details, "w780")].filter(Boolean),
    datePublished: details.release_date || undefined,
    director: director ? { "@type": "Person", name: director } : undefined,
    aggregateRating: details.vote_average
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(details.vote_average),
          bestRating: 10,
          worstRating: 1,
          ratingCount: details.vote_count || undefined,
        }
      : undefined,
    genre: details.genres?.map((genre: { name?: string }) => genre.name).filter(Boolean),
  };
}

export function getTVEpisodeJsonLd(seriesDetails: MediaDetails, episode: any, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    name: episode.name,
    episodeNumber: episode.episode_number,
    partOfSeason: {
      "@type": "TVSeason",
      seasonNumber: episode.season_number,
    },
    partOfSeries: {
      "@type": "TVSeries",
      name: getTitle(seriesDetails),
    },
    description: episode.overview || seriesDetails.overview,
    url: toAbsoluteUrl(canonical),
  };
}

export function getTVSeriesJsonLd(details: MediaDetails | null | undefined, canonical: string) {
  if (!details) return null;

  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: getTitle(details),
    description: getDescription(details, `Discover TV series details on ${SITE_NAME}.`),
    url: toAbsoluteUrl(canonical),
    image: [getBackdropImage(details, "original"), getPosterImage(details, "w780")].filter(Boolean),
    startDate: details.first_air_date || undefined,
    numberOfSeasons: details.number_of_seasons || undefined,
    numberOfEpisodes: details.number_of_episodes || undefined,
    aggregateRating: details.vote_average
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(details.vote_average),
          bestRating: 10,
          worstRating: 1,
          ratingCount: details.vote_count || undefined,
        }
      : undefined,
    genre: details.genres?.map((genre: { name?: string }) => genre.name).filter(Boolean),
  };
}

export function getPersonJsonLd(person: PersonDetails | null | undefined, canonical: string) {
  if (!person) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    url: toAbsoluteUrl(canonical),
    image: person.profile_path ? img(person.profile_path, "h632") : undefined,
    birthDate: person.birthday || undefined,
    birthPlace: person.place_of_birth || undefined,
    description: getDescription(person, `Explore cast biographies and filmography on ${SITE_NAME}.`),
  };
}

export function generateLiveChannelMetadata(channel: StreamChannel | null | undefined, canonical: string): Metadata {
  const title = channel?.name ? `${channel.name} Live | ${SITE_NAME}` : `Live TV | ${SITE_NAME}`;
  const description = channel?.group
    ? `Watch ${channel.name || "this channel"} live on Stream It. Browse the ${channel.group.split(";")[0]} lineup, discover free live TV, and jump into the stream.`
    : `Watch free live TV channels on Stream It with fast discovery, broadcast details, and direct playback.`;
  const image = channel?.logo || null;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "video.other",
      images: image
        ? [
            {
              url: image,
              alt: `${channel?.name || "Live TV"} logo`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function generateRadioStationMetadata(station: RadioStation | null | undefined, canonical: string): Metadata {
  const title = station?.name ? `${station.name} Radio | ${SITE_NAME}` : `Radio | ${SITE_NAME}`;
  const description = station
    ? `Listen to ${station.name}. ${station.country ? `${station.country} station.` : ""} ${station.tags ? `Tags: ${station.tags}.` : ""}`.trim()
    : `Listen to free radio stations from around the world on Stream It.`;
  const image = station?.favicon || null;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "music.radio_station",
      images: image
        ? [
            {
              url: image,
              alt: `${station?.name || "Radio station"} logo`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

type DiscoverCategory = {
  id: string | number | null;
  name: string;
};

type DiscoverLanguage = {
  id: string | number;
  name: string;
};

export function generateCategoryMetadata(category: DiscoverCategory | null | undefined, canonical: string): Metadata {
  const title = category?.name ? `${category.name} Free Movies & TV Shows | ${SITE_NAME}` : `Categories | ${SITE_NAME}`;
  const description = category?.name
    ? `Browse ${category.name.toLowerCase()} free movies and TV series with posters, titles, and fast discovery.`
    : `Browse free movies and TV series by category on ${SITE_NAME}.`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function generateLanguageMetadata(language: DiscoverLanguage | null | undefined, canonical: string): Metadata {
  const title = language?.name ? `${language.name} Free Movies & TV Shows | ${SITE_NAME}` : `Languages | ${SITE_NAME}`;
  const description = language?.name
    ? `Browse ${language.name} free movies and TV series with language-first discovery and cover artwork.`
    : `Browse free movies and TV series by language on ${SITE_NAME}.`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function generateCollectionMetadata(name: string, year?: string | number, canonical: string = ""): Metadata {
  const yearSuffix = year ? ` (${year})` : "";
  const title = `Best ${name}${yearSuffix} Movies & TV Shows | Watch Online | ${SITE_NAME}`;
  const description = `Discover the best ${name.toLowerCase()} ${year ? `of ${year} ` : ""}available to watch online. Browse full cast, ratings, and trailers for top ${name.toLowerCase()} titles on ${SITE_NAME}.`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
