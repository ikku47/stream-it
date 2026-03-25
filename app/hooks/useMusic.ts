"use client";

import { useEffect, useState } from "react";
import {
  fetchMusicHomeData,
  fetchMusicSearchData,
  fetchMusicAlbumDetail,
  fetchMusicArtistDetail,
  fetchMusicPlaylistDetail,
  fetchMusicTrackDetail,
  type MusicAlbumDetail,
  type MusicArtistDetail,
  type MusicPlaylistDetail,
  type MusicTrackDetail,
  type MusicHomeData,
  type MusicSearchData,
} from "@/lib/music";
import useMusicStore, { MUSIC_TTL, getCachedSearch, isFresh } from "@/store/useMusicStore";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useMusicHome() {
  const { home, homeFetchedAt, setHome } = useMusicStore();
  const [state, setState] = useState<AsyncState<MusicHomeData>>({
    data: home,
    loading: !home,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const hasFresh = home && homeFetchedAt && Date.now() - homeFetchedAt < MUSIC_TTL.home;

    if (hasFresh) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setState({ data: home, loading: false, error: null });
        }
      });
    } else {
      fetchMusicHomeData()
        .then((data) => {
          if (!cancelled) {
            setHome(data);
            setState({ data, loading: false, error: null });
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setState({
              data: home || null,
              loading: false,
              error: error instanceof Error ? error.message : "Failed to load music discovery.",
            });
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [home, homeFetchedAt, setHome]);

  return state;
}

export function useMusicSearch(query: string) {
  const { setSearch } = useMusicStore();
  const cached = useMusicStore((state) => getCachedSearch(query, state));
  const [state, setState] = useState<AsyncState<MusicSearchData>>({
    data: cached?.data || null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setState({ data: null, loading: false, error: null });
        }
      });

      return () => {
        cancelled = true;
      };
    }

    const cachedEntry = getCachedSearch(trimmedQuery, useMusicStore.getState());
    const hasFresh = isFresh(cachedEntry, MUSIC_TTL.search);

    if (hasFresh) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setState({ data: cachedEntry?.data || null, loading: false, error: null });
        }
      });
    } else {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setState((current) => ({
            data: current.data,
            loading: true,
            error: null,
          }));
        }
      });

      const timer = window.setTimeout(() => {
        fetchMusicSearchData(trimmedQuery)
          .then((data) => {
            if (!cancelled) {
              setSearch(trimmedQuery, data);
              setState({ data, loading: false, error: null });
            }
          })
          .catch((error) => {
            if (!cancelled) {
              setState({
                data: cachedEntry?.data || null,
                loading: false,
                error: error instanceof Error ? error.message : "Search failed.",
              });
            }
          });
      }, 250);

      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [query]);

  return state;
}

type DetailKind = "track" | "album" | "playlist" | "artist";

const detailFetchers = {
  track: fetchMusicTrackDetail,
  album: fetchMusicAlbumDetail,
  playlist: fetchMusicPlaylistDetail,
  artist: fetchMusicArtistDetail,
} as const;

export function useMusicDetail<T>(kind: DetailKind, id: string) {
  const { detailCache, setDetail } = useMusicStore();
  const cached = detailCache[kind][id];

  const [state, setState] = useState<AsyncState<T>>({
    data: (cached?.data as T) || null,
    loading: !cached,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const cachedEntry = detailCache[kind][id];
    const hasFresh = isFresh(cachedEntry, MUSIC_TTL.detail);

    if (hasFresh) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setState({ data: cachedEntry?.data as T, loading: false, error: null });
        }
      });
    } else {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setState((current) => ({ ...current, loading: true, error: null }));
        }
      });

      detailFetchers[kind](id)
        .then((data) => {
          if (!cancelled) {
            setDetail(kind, id, data as any);
            setState({ data: data as T, loading: false, error: null });
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setState({
              data: cachedEntry?.data as T,
              loading: false,
              error: error instanceof Error ? error.message : "Failed to load details.",
            });
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [detailCache, id, kind, setDetail]);

  return state;
}
