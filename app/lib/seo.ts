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
