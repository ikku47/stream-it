'use client';
// components/modals/DetailModal.jsx
import { useEffect, useState } from "react";
import { X, Play, Youtube, Star, Tv, Film, Heart } from "lucide-react";
import { img, imgFallback, scoreColor, getTitle, getYear, isTV } from "../../lib/tmdb";
import { useTVDetails, fetchTrailer } from "../../hooks/useTMDB";
import useStore from "../../store/useStore";

export default function DetailModal() {
  const {
    modalItem, closeModal,
    openPlayer, showToast,
    selectedSeason, selectedEpisode,
    setSeason, setEpisode,
    genreMap,
    favourites, toggleFavourite,
  } = useStore();

  const item = modalItem;
  const tv = item ? isTV(item) : false;
  const { details, fetchEpisodes } = useTVDetails(item?.id, tv);

  const isFav = item ? favourites.some(f => f.id === item.id) : false;

  const [episodeCount, setEpisodeCount] = useState(12);

  // Fetch episodes when season changes
  useEffect(() => {
    if (!tv || !item) return;
    fetchEpisodes(selectedSeason).then(setEpisodeCount);
  }, [selectedSeason, item?.id, tv]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = item ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [!!item]);

  // Escape key
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (!item) return null;

  const title = getTitle(item);
  const score = (item.vote_average || 0).toFixed(1);
  const year = getYear(item);
  const scoreC = scoreColor(parseFloat(score));
  const backdrop = img(item.backdrop_path, "w1280") || imgFallback(item.poster_path);
  const seasons = details?.number_of_seasons || item.number_of_seasons || 1;

  const handleTrailer = async () => {
    const type = tv ? "tv" : "movie";
    try {
      const url = await fetchTrailer(item.id, type);
      if (url) window.open(url, "_blank");
      else showToast("No trailer available");
    } catch {
      showToast("Could not load trailer");
    }
  };

  const handlePlay = () => {
    closeModal();
    openPlayer({ ...item, media_type: tv ? "tv" : "movie" }, selectedSeason, selectedEpisode);
  };

  const genres = (item.genre_ids || [])
    .slice(0, 5)
    .map((id) => genreMap?.[id])
    .filter(Boolean);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl overflow-hidden animate-scale-in no-scrollbar"
          style={{
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
            pointerEvents: "auto",
          }}
        >
          {/* Close */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full glass-light flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Backdrop image */}
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <img
              src={backdrop}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-1)] via-[var(--color-surface-1)]/20 to-transparent" />

            {/* Type pill on backdrop */}
            <div
              className="absolute top-4 left-4 flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full"
              style={{ background: "var(--color-brand-dim)", border: "1px solid rgba(249,115,22,0.3)", color: "var(--color-brand-hover)" }}
            >
              {tv ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
              {tv ? "TV Series" : "Film"}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pb-7 -mt-6 relative z-10">
            <h2 className="font-display text-4xl md:text-5xl text-white leading-none mb-3 tracking-wide">
              {title}
            </h2>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <span className="font-bold font-mono text-sm flex items-center gap-1" style={{ color: scoreC }}>
                <Star className="w-3.5 h-3.5 fill-current" />
                {score}
              </span>
              {year && <span className="text-[var(--color-text-mute)] text-sm">{year}</span>}
              <span
                className="px-2 py-0.5 rounded-md text-xs font-semibold"
                style={{ background: "var(--color-surface-3)", color: "var(--color-text-mute)" }}
              >
                {item.adult ? "18+" : tv ? "TV-14" : "PG-13"}
              </span>
              {details?.episode_run_time?.[0] && (
                <span className="text-[var(--color-text-mute)] text-sm">
                  {details.episode_run_time[0]}m / ep
                </span>
              )}
              {details?.number_of_episodes && (
                <span className="text-[var(--color-text-mute)] text-sm">
                  {details.number_of_episodes} episodes
                </span>
              )}
            </div>

            {/* Overview */}
            <p className="text-[var(--color-text-mute)] text-sm leading-relaxed mb-5 font-body">
              {item.overview || "No description available."}
            </p>

            {/* Genre chips */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full text-[12px] font-medium font-body"
                    style={{ background: "var(--color-surface-3)", color: "var(--color-text-mute)", border: "1px solid var(--color-border)" }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* TV season/episode controls */}
            {tv && (
              <div className="mb-5 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-text-dim)] mb-2 font-body">
                    Season
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: seasons }, (_, i) => i + 1).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSeason(s)}
                        className={`num-btn${s === selectedSeason ? " active" : ""}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-text-dim)] mb-2 font-body">
                    Episode
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-[112px] overflow-y-auto no-scrollbar">
                    {Array.from({ length: Math.min(episodeCount, 30) }, (_, i) => i + 1).map((e) => (
                      <button
                        key={e}
                        onClick={() => setEpisode(e)}
                        className={`num-btn${e === selectedEpisode ? " active" : ""}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: "var(--color-brand)", boxShadow: "0 6px 20px rgba(249,115,22,0.3)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-brand-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-brand)"}
              >
                <Play className="w-4 h-4 fill-white" />
                {tv ? `Play S${selectedSeason} E${selectedEpisode}` : "Play"}
              </button>
              <button
                onClick={handleTrailer}
                className="glass-light flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white/70 hover:text-white transition-all duration-200 hover:bg-white/8 hover:scale-105 active:scale-95"
              >
                <Youtube className="w-4 h-4" />
                Trailer
              </button>
              <button
                onClick={() => toggleFavourite(item)}
                className={`glass-light flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${isFav ? 'text-pink-500 bg-pink-500/10 border border-pink-500/30' : 'text-white/70 hover:text-white hover:bg-white/8 border border-transparent'}`}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-current text-pink-500' : ''}`} />
                {isFav ? 'Favourited' : 'Favourite'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
