export type MusicCardKind = "song" | "video" | "album" | "artist" | "playlist";

export type MusicCardItem = {
  id: string;
  kind: MusicCardKind;
  title: string;
  subtitle: string;
  image: string | null;
  badge?: string | null;
  meta?: string | null;
};

export type MusicHomeData = {
  spotlight: MusicCardItem | null;
  sections: {
    id: string;
    title: string;
    kicker: string;
    items: MusicCardItem[];
  }[];
};

export type MusicSearchData = {
  topResult: MusicCardItem | null;
  sections: {
    title: string;
    items: MusicCardItem[];
  }[];
};

export type MusicDetailHeader = {
  title: string;
  subtitle: string;
  description?: string;
  meta?: string;
  image?: string | null;
};

export type MusicTrackDetail = {
  header: MusicDetailHeader;
  item: MusicCardItem;
};

export type MusicAlbumDetail = {
  header: MusicDetailHeader;
  tracks: MusicCardItem[];
};

export type MusicPlaylistDetail = {
  header: MusicDetailHeader;
  tracks: MusicCardItem[];
};

export type MusicArtistDetail = {
  header: MusicDetailHeader;
  sections: {
    title: string;
    items: MusicCardItem[];
  }[];
};

async function readJson<T>(input: RequestInfo | URL): Promise<T> {
  const response = await fetch(input, { cache: "no-store" });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Music request failed.");
  }

  return response.json();
}

export function fetchMusicHomeData() {
  return readJson<MusicHomeData>("/api/music/home");
}

export function fetchMusicSearchData(query: string) {
  const params = new URLSearchParams({ q: query });
  return readJson<MusicSearchData>(`/api/music/search?${params.toString()}`);
}

export function fetchMusicTrackDetail(id: string) {
  return readJson<MusicTrackDetail>(`/api/music/track/${id}`);
}

export function fetchMusicAlbumDetail(id: string) {
  return readJson<MusicAlbumDetail>(`/api/music/album/${id}`);
}

export function fetchMusicPlaylistDetail(id: string) {
  return readJson<MusicPlaylistDetail>(`/api/music/playlist/${id}`);
}

export function fetchMusicArtistDetail(id: string) {
  return readJson<MusicArtistDetail>(`/api/music/artist/${id}`);
}
