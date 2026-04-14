import type { Metadata } from "next";
import { cache } from "react";
import { getBackdropImage, getMediaLabel, getPosterImage, getTitle, img, tmdb } from "./tmdb";

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stream-it.vercel.app";
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
    return await tmdb(`/${type}/${id}`, { append_to_response: "credits,similar" });
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
  const mediaLabel = details ? getMediaLabel(details) : "";
  const title = mediaLabel && mediaLabel !== "—"
    ? `${mediaLabel} | ${SITE_NAME}`
    : `${type === "tv" ? "TV Series" : "Movie"} | ${SITE_NAME}`;
  const description = getDescription(
    details,
    `Discover ${mediaKindLabel(type)} details, posters, cast, and more on ${SITE_NAME}.`
  );
  const canonical = `/${type}/${id}`;
  const poster = getPosterImage(details, "w780");
  const backdrop = getBackdropImage(details, "original");
  const images = [backdrop, poster].filter(Boolean).map((url) => ({
    url: url as string,
    alt: `${getTitle(details)} poster and cover art`,
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

export function generateLiveChannelMetadata(channel: StreamChannel | null | undefined, canonical: string): Metadata {
  const title = channel?.name ? `${channel.name} Live | ${SITE_NAME}` : `Live TV | ${SITE_NAME}`;
  const description = channel?.group
    ? `Watch ${channel.name || "this channel"} live on Stream It. Browse the ${channel.group.split(";")[0]} lineup and jump into the stream.`
    : `Watch live TV channels on Stream It with fast discovery and direct playback.`;
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
    : `Listen to radio stations from around the world on Stream It.`;
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
  const title = category?.name ? `${category.name} Movies & TV Shows | ${SITE_NAME}` : `Categories | ${SITE_NAME}`;
  const description = category?.name
    ? `Browse ${category.name.toLowerCase()} movies and TV series with posters, titles, and fast discovery.`
    : `Browse movies and TV series by category on ${SITE_NAME}.`;

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
  const title = language?.name ? `${language.name} Movies & TV Shows | ${SITE_NAME}` : `Languages | ${SITE_NAME}`;
  const description = language?.name
    ? `Browse ${language.name} movies and TV series with language-first discovery and cover artwork.`
    : `Browse movies and TV series by language on ${SITE_NAME}.`;

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
