import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  MusicHomeData,
  MusicSearchData,
  MusicAlbumDetail,
  MusicArtistDetail,
  MusicPlaylistDetail,
  MusicTrackDetail,
  MusicCardItem,
} from "@/lib/music";

type DetailMap = {
  track: MusicTrackDetail;
  album: MusicAlbumDetail;
  playlist: MusicPlaylistDetail;
  artist: MusicArtistDetail;
};

type DetailEntry<T> = {
  data: T;
  fetchedAt: number;
};

type MusicStore = {
  home: MusicHomeData | null;
  homeFetchedAt: number | null;
  searchCache: Record<string, DetailEntry<MusicSearchData>>;
  detailCache: {
    track: Record<string, DetailEntry<MusicTrackDetail>>;
    album: Record<string, DetailEntry<MusicAlbumDetail>>;
    playlist: Record<string, DetailEntry<MusicPlaylistDetail>>;
    artist: Record<string, DetailEntry<MusicArtistDetail>>;
  };
  nowPlaying: MusicCardItem | null;
  setHome: (data: MusicHomeData) => void;
  setSearch: (query: string, data: MusicSearchData) => void;
  setDetail: <K extends keyof DetailMap>(kind: K, id: string, data: DetailMap[K]) => void;
  setNowPlaying: (item: MusicCardItem | null) => void;
};

export const MUSIC_TTL = {
  home: 5 * 60 * 1000,
  search: 3 * 60 * 1000,
  detail: 10 * 60 * 1000,
};

const normalizeQuery = (query: string) => query.trim().toLowerCase();

const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      home: null,
      homeFetchedAt: null,
      searchCache: {},
      detailCache: {
        track: {},
        album: {},
        playlist: {},
        artist: {},
      },
      nowPlaying: null,
      setHome: (data) =>
        set(() => ({
          home: data,
          homeFetchedAt: Date.now(),
        })),
      setSearch: (query, data) =>
        set((state) => ({
          searchCache: {
            ...state.searchCache,
            [normalizeQuery(query)]: { data, fetchedAt: Date.now() },
          },
        })),
      setDetail: (kind, id, data) =>
        set((state) => ({
          detailCache: {
            ...state.detailCache,
            [kind]: {
              ...state.detailCache[kind],
              [id]: { data, fetchedAt: Date.now() },
            },
          },
        })),
      setNowPlaying: (item) => set({ nowPlaying: item }),
    }),
    {
      name: "music-store",
      partialize: (state) => ({
        home: state.home,
        homeFetchedAt: state.homeFetchedAt,
        searchCache: state.searchCache,
        detailCache: state.detailCache,
        nowPlaying: state.nowPlaying,
      }),
    }
  )
);

export function getCachedSearch(query: string, state: MusicStore) {
  const key = normalizeQuery(query);
  return state.searchCache[key] || null;
}

export function isFresh(entry: DetailEntry<any> | null, ttl: number) {
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < ttl;
}

export default useMusicStore;
