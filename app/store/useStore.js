// store/useStore.js
import { create } from "zustand";

const useStore = create((set, get) => ({
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

  // ── Modal ─────────────────────────────────────────────────
  modalItem: null,
  openModal:  (item) => set({ modalItem: item }),
  closeModal: ()     => set({ modalItem: null }),

  // ── Player ────────────────────────────────────────────────
  playerItem:      null,
  selectedSeason:  1,
  selectedEpisode: 1,
  openPlayer: (item, season = 1, episode = 1) =>
    set({ playerItem: item, selectedSeason: season, selectedEpisode: episode }),
  closePlayer:  ()  => set({ playerItem: null }),
  setSeason:    (s) => set({ selectedSeason: s,  selectedEpisode: 1 }),
  setEpisode:   (e) => set({ selectedEpisode: e }),

  // ── Search ────────────────────────────────────────────────
  searchOpen:    false,
  searchQuery:   "",
  searchResults: [],
  searchLoading: false,
  setSearchOpen:    (v)  => set({ searchOpen: v }),
  setSearchQuery:   (q)  => set({ searchQuery: q }),
  setSearchResults: (r)  => set({ searchResults: r }),
  setSearchLoading: (v)  => set({ searchLoading: v }),

  // ── Toast ─────────────────────────────────────────────────
  toastMsg:     "",
  toastVisible: false,
  showToast: (msg) => {
    set({ toastMsg: msg, toastVisible: true });
    setTimeout(() => set({ toastVisible: false }), 3000);
  },
}));

export default useStore;
