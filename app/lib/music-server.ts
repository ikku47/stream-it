import "@/lib/youtubeEval";
import { Innertube } from "youtubei.js";
import { unstable_cache } from "next/cache";
import type { MusicCardItem, MusicCardKind, MusicHomeData, MusicSearchData } from "@/lib/music";

type MusicRenderer = {
  item_type?: string;
  id?: string;
  title?: { toString?: () => string } | string;
  subtitle?: { toString?: () => string } | string;
  duration?: { text?: { toString?: () => string } | string; toString?: () => string } | string;
  album?: { name?: { toString?: () => string } | string; toString?: () => string } | string | null;
  artists?: { name?: { toString?: () => string } | string; toString?: () => string }[];
  authors?: { name?: { toString?: () => string } | string; toString?: () => string }[];
  subtitle_badges?: { text?: string }[];
  badges?: { label?: string }[];
  year?: string;
  subscribers?: string;
  thumbnail?: { url?: string }[];
};

type MusicShelf = {
  header?: { title?: { toString?: () => string } | string };
  contents?: MusicRenderer[];
};

type MusicSearchResult = {
  contents?: MusicShelf[];
};

let tubePromise: Promise<Innertube> | null = null;

function text(value: { toString?: () => string } | string | null | undefined) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.toString?.() || "";
}

function getMusicClient() {
  if (!tubePromise) {
    const cookie = process.env.YT_COOKIE || process.env.YOUTUBE_COOKIE;
    const visitorData = process.env.YT_VISITOR_DATA || process.env.YOUTUBE_VISITOR_DATA;
    const poToken = process.env.YT_PO_TOKEN || process.env.YOUTUBE_PO_TOKEN;

    tubePromise = Innertube.create({
      lang: "en",
      location: "US",
      retrieve_player: true,
      cookie,
      visitor_data: visitorData,
      po_token: poToken,
    });
  }

  return tubePromise;
}

function getImage(item: MusicRenderer) {
  const url = item.thumbnail?.[item.thumbnail.length - 1]?.url || item.thumbnail?.[0]?.url || null;
  if (!url) return null;
  return `/api/music/image?url=${encodeURIComponent(url)}`;
}

function joinPeople(entries: MusicRenderer["artists"] | MusicRenderer["authors"]) {
  return entries?.map((entry) => text(entry?.name || entry)).filter(Boolean).join(" • ") || "";
}

function normalizeKind(itemType?: string): MusicCardKind | null {
  if (!itemType) return null;
  if (itemType === "song") return "song";
  if (itemType === "video") return "video";
  if (itemType === "album") return "album";
  if (itemType === "artist") return "artist";
  if (itemType === "playlist") return "playlist";
  return null;
}

function normalizeItem(item: MusicRenderer | undefined | null): MusicCardItem | null {
  const kind = normalizeKind(item?.item_type);
  const id = item?.id;

  if (!kind || !id) return null;

  const title = text(item?.title);
  const artists = joinPeople(item?.artists);
  const authors = joinPeople(item?.authors);
  const album = text(item?.album && typeof item.album === "object" && "name" in item.album ? item.album.name : item?.album);
  const subtitle =
    kind === "artist"
      ? item?.subscribers || "Artist"
      : artists || authors || album || text(item?.subtitle) || "Play now";

  const badge =
    item?.badges?.[0]?.label ||
    item?.subtitle_badges?.[0]?.text ||
    (kind === "album" ? item?.year || "Album" : null);

  const meta =
    kind === "song" || kind === "video"
      ? text(typeof item?.duration === "object" && item?.duration?.text ? item.duration.text : item?.duration)
      : kind === "playlist"
        ? authors || null
        : kind === "album"
          ? album || null
          : null;

  return {
    id,
    kind,
    title,
    subtitle,
    image: getImage(item),
    badge,
    meta,
  };
}

function normalizeShelf(section: MusicShelf | undefined, fallbackId: string, fallbackKicker: string) {
  const items = (section?.contents || []).map(normalizeItem).filter(Boolean) as MusicCardItem[];

  return {
    id: fallbackId,
    title: text(section?.header?.title) || fallbackKicker,
    kicker: fallbackKicker,
    items,
  };
}

export async function getMusicHomeData(): Promise<MusicHomeData> {
  const yt = await getMusicClient();
  const home = await yt.music.getHomeFeed();
  const homeContinuation = home.has_continuation ? await home.getContinuation() : null;
  const explore = await yt.music.getExplore();

  const homeShelves = [home, homeContinuation]
    .flatMap((feed) => feed?.sections || [])
    .filter(Boolean) as MusicShelf[];

  const exploreShelves = (explore.sections || []) as MusicShelf[];

  const sections = [
    ...homeShelves.map((section, index) =>
      normalizeShelf(section, `home-${index + 1}`, "Home Shelf")
    ),
    ...exploreShelves.map((section, index) =>
      normalizeShelf(section, `explore-${index + 1}`, "Explore Shelf")
    ),
  ].filter((section) => section.items.length > 0);

  return {
    spotlight: sections[0]?.items[0] || null,
    sections: sections.slice(0, 10),
  };
}

export async function searchMusic(query: string): Promise<MusicSearchData> {
  const yt = await getMusicClient();
  const [songs, videos, albums, artists, playlists] = await Promise.all([
    yt.music.search(query, { type: "song" }),
    yt.music.search(query, { type: "video" }),
    yt.music.search(query, { type: "album" }),
    yt.music.search(query, { type: "artist" }),
    yt.music.search(query, { type: "playlist" }),
  ]);

  const collectItems = (result: MusicSearchResult) =>
    (result.contents || [])
      .flatMap((section) => section.contents || [])
      .map(normalizeItem)
      .filter(Boolean) as MusicCardItem[];

  const songItems = collectItems(songs as MusicSearchResult);

  return {
    topResult: songItems[0] || null,
    sections: [
      { title: "Songs", items: songItems },
      { title: "Videos", items: collectItems(videos as MusicSearchResult) },
      { title: "Albums", items: collectItems(albums as MusicSearchResult) },
      { title: "Artists", items: collectItems(artists as MusicSearchResult) },
      { title: "Playlists", items: collectItems(playlists as MusicSearchResult) },
    ].filter((section) => section.items.length > 0),
  };
}

export function getMusicHomeDataCached() {
  return unstable_cache(() => getMusicHomeData(), ["music-home"], { revalidate: 300 })();
}

export function searchMusicCached(query: string) {
  return unstable_cache(() => searchMusic(query), ["music-search", query], { revalidate: 180 })();
}

export function getTrackDetailCached(id: string) {
  return unstable_cache(() => getTrackDetail(id), ["music-track", id], { revalidate: 600 })();
}

export function getAlbumDetailCached(id: string) {
  return unstable_cache(() => getAlbumDetail(id), ["music-album", id], { revalidate: 600 })();
}

export function getPlaylistDetailCached(id: string) {
  return unstable_cache(() => getPlaylistDetail(id), ["music-playlist", id], { revalidate: 600 })();
}

export function getArtistDetailCached(id: string) {
  return unstable_cache(() => getArtistDetail(id), ["music-artist", id], { revalidate: 600 })();
}

type DetailHeader = {
  title: string;
  subtitle: string;
  description?: string;
  meta?: string;
  image?: string | null;
};

type MusicDetailSection = {
  title: string;
  items: MusicCardItem[];
};

export type TrackDetail = {
  header: DetailHeader;
  item: MusicCardItem;
};

export type AlbumDetail = {
  header: DetailHeader;
  tracks: MusicCardItem[];
};

export type PlaylistDetail = {
  header: DetailHeader;
  tracks: MusicCardItem[];
};

export type ArtistDetail = {
  header: DetailHeader;
  sections: MusicDetailSection[];
};

function proxyImage(url?: string | null) {
  if (!url) return null;
  return `/api/music/image?url=${encodeURIComponent(url)}`;
}

function headerImage(header: any) {
  return (
    header?.thumbnail?.contents?.[0]?.url ||
    header?.thumbnail?.[0]?.url ||
    header?.image?.[0]?.url ||
    null
  );
}

function formatDuration(seconds?: number | null) {
  if (!seconds || Number.isNaN(seconds)) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export async function getTrackDetail(id: string): Promise<TrackDetail> {
  const yt = await getMusicClient();
  const info = await yt.music.getInfo(id);

  const title = info.basic_info?.title || "Track";
  const subtitle = info.basic_info?.author || "";
  const image = proxyImage(info.basic_info?.thumbnail?.[info.basic_info.thumbnail.length - 1]?.url);
  const duration = formatDuration(info.basic_info?.duration);

  const item: MusicCardItem = {
    id,
    kind: "song",
    title,
    subtitle,
    image,
    badge: null,
    meta: duration || null,
  };

  return {
    header: {
      title,
      subtitle,
      description: info.basic_info?.short_description || "",
      image,
      meta: duration || "",
    },
    item,
  };
}

export async function getAlbumDetail(id: string): Promise<AlbumDetail> {
  const yt = await getMusicClient();
  const album = await yt.music.getAlbum(id);
  const header = album.header as any;

  const tracks = (album.contents || [])
    .map((item: any) => normalizeItem(item))
    .filter(Boolean) as MusicCardItem[];

  return {
    header: {
      title: text(header?.title) || "Album",
      subtitle: text(header?.subtitle) || "",
      description: text(header?.second_subtitle) || "",
      image: proxyImage(headerImage(header)),
    },
    tracks,
  };
}

export async function getPlaylistDetail(id: string): Promise<PlaylistDetail> {
  const yt = await getMusicClient();
  try {
    const playlist = await yt.music.getPlaylist(id);
    const header = playlist.header as any;

    const tracks = (playlist.items || [])
      .map((item: any) => normalizeItem(item))
      .filter(Boolean) as MusicCardItem[];

    return {
      header: {
        title: text(header?.title) || "Playlist",
        subtitle: text(header?.subtitle) || "",
        description: text(header?.second_subtitle) || "",
        image: proxyImage(headerImage(header)),
      },
      tracks,
    };
  } catch (error) {
    const playlist = await yt.getPlaylist(id);
    const info = playlist.info as any;

    const tracks = (playlist.items || [])
      .map((item: any) => ({
        id: item.id,
        kind: "video" as const,
        title: text(item.title) || "Track",
        subtitle: text(item.author?.name) || "",
        image: proxyImage(item.thumbnail?.[0]?.url || null),
        badge: null,
        meta: "",
      }))
      .filter((item: MusicCardItem) => Boolean(item.id));

    return {
      header: {
        title: text(info?.title) || "Playlist",
        subtitle: text(info?.author?.name) || "",
        description: text(info?.subtitle) || "",
        image: proxyImage(info?.thumbnails?.[0]?.url || null),
      },
      tracks,
    };
  }
}

export async function getArtistDetail(id: string): Promise<ArtistDetail> {
  const yt = await getMusicClient();
  const artist = await yt.music.getArtist(id);
  const header = artist.header as any;

  const sections = (artist.sections || [])
    .map((section: any) => ({
      title: text(section?.header?.title) || "Section",
      items: (section?.contents || []).map(normalizeItem).filter(Boolean) as MusicCardItem[],
    }))
    .filter((section: MusicDetailSection) => section.items.length > 0)
    .slice(0, 8);

  return {
    header: {
      title: text(header?.title) || text(header?.name) || "Artist",
      subtitle: "",
      description: text(header?.description) || "",
      image: proxyImage(headerImage(header)),
    },
    sections,
  };
}
