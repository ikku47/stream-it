// store/useStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set, get) => ({
      // ── Row cache ─────────────────────────────────────────────
      rowCache:  {},   // `${tab}_${genreId}` → [{ title, emoji, items }]
      genreMap:  null, // { [id]: name }
      heroItem:  null,

      setRowCache: (key, rows) =>
        set((s) => ({ rowCache: { ...s.rowCache, [key]: rows } })),
      setGenreMap: (map) => set({ genreMap: map }),
      setHeroItem: (item) => set({ heroItem: item }),

      // ── Navigation ────────────────────────────────────────────
      currentTab:     "home",
      currentGenreId: null,
      setTab:         (tab) => set({ currentTab: tab, currentGenreId: null }),
      setGenreId:     (id)  => set({ currentGenreId: id }),

      // ── Media Selection (Details) ─────────────────────────────
      selectedMedia: null,
      selectMedia: (item) => set({ selectedMedia: item }),
      clearSelectedMedia: () => set({ selectedMedia: null }),

      // ── Player ────────────────────────────────────────────────
      playerItem:      null,
      selectedSeason:  1,
      selectedEpisode: 1,
      provider:        "tmdbplayer",
      setProvider:     (p) => set({ provider: p }),
      openPlayer: (item, season = 1, episode = 1) =>
        set({ playerItem: item, selectedSeason: season, selectedEpisode: episode }),
      closePlayer:  ()  => set({ playerItem: null }),
      setSeason:    (s) => set({ selectedSeason: s,  selectedEpisode: 1 }),
      setEpisode:   (e) => set({ selectedEpisode: e }),

      // ── Search ────────────────────────────────────────────────
      searchOpen:    false,
      searchQuery:   "",
      searchResults: [],
      radioResults:  [],
      searchLoading: false,
      setSearchOpen:    (v)  => set({ searchOpen: v }),
      setSearchQuery:   (q)  => set({ searchQuery: q }),
      setSearchResults: (r)  => set({ searchResults: r }),
      setRadioResults:  (r)  => set({ radioResults: r }),
      setSearchLoading: (v)  => set({ searchLoading: v }),

      // ── Toast ─────────────────────────────────────────────────
      toastMsg:     "",
      toastVisible: false,
      showToast: (msg) => {
        set({ toastMsg: msg, toastVisible: true });
        setTimeout(() => set({ toastVisible: false }), 3000);
      },

      // ── Brave Suggestion ──────────────────────────────────────
      braveSuggestionDismissed: false,
      dismissBraveSuggestion: () => set({ braveSuggestionDismissed: true }),

      // ── Favourites & Continue Watching ────────────────────────
      favourites: [],
      continueWatching: [],
      
      toggleFavourite: (item) => set((s) => {
        const isFav = s.favourites.some(f => f.id === item.id);
        return {
          favourites: isFav
            ? s.favourites.filter(f => f.id !== item.id)
            : [item, ...s.favourites]
        };
      }),

      addToContinueWatching: (item, progressData) => set((s) => {
        const existing = s.continueWatching.filter(i => i.id !== item.id);
        const updatedItem = { ...item, _progress: progressData || {} };
        return {
          continueWatching: [updatedItem, ...existing].slice(0, 20)
        };
      }),
      removeFromContinueWatching: (id) => set((s) => ({
        continueWatching: s.continueWatching.filter(i => i.id !== id)
      })),

      // ── IPTV Provider ─────────────────────────────────────────
      iptvProviderId: "iptv-org",
      activeLiveChannel: null,
      setIPTVProvider: (id) => set({ iptvProviderId: id }),
      setActiveLiveChannel: (c) => set({ activeLiveChannel: c }),
      
      // ── Radio ─────────────────────────────────────────────────
      activeRadioStation: null,
      setActiveRadioStation: (s) => set({ activeRadioStation: s }),
    }),
    {
      name: "stream-it-storage",
      partialize: (state) => ({ 
        provider: state.provider,
        iptvProviderId: state.iptvProviderId,
        activeLiveChannel: state.activeLiveChannel,
        activeRadioStation: state.activeRadioStation,
        braveSuggestionDismissed: state.braveSuggestionDismissed,
        favourites: state.favourites,
        continueWatching: state.continueWatching
      }), 
    }
  )
);

export default useStore;
