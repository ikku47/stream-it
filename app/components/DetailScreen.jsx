'use client';
// components/DetailScreen.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Youtube, Star, Tv, Film, Heart, ArrowLeft } from "lucide-react";
import { img, imgFallback, scoreColor, getTitle, getYear, isTV, normalizeItem } from "../lib/tmdb";
import { useItemDetails, fetchTrailer } from "../hooks/useTMDB";
import useStore from "../store/useStore";

export default function DetailScreen({ id, type }) {
  const router = useRouter();
  const {
    selectedMedia, selectMedia,
    openPlayer, showToast,
    selectedSeason, selectedEpisode,
    setSeason, setEpisode,
    genreMap,
    favourites, toggleFavourite,
  } = useStore();

  const [episodes, setEpisodes] = useState([]);

  // Use selectedMedia if available, else null
  const instantItem = (selectedMedia && id && selectedMedia.id?.toString() === id.toString()) ? selectedMedia : null;
  // If we don't have instantItem, we rely on details fetched from hook
  const { details, fetchSeasonEpisodes } = useItemDetails(id, type);
  const item = instantItem || details;

  const tv = type === 'tv';

  useEffect(() => {
    // Only fetch episodes if it's TV and we actually have data showing it's a TV show
    if (!tv) return;
    fetchSeasonEpisodes(selectedSeason).then(setEpisodes);
  }, [selectedSeason, id, tv, fetchSeasonEpisodes]);

  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-8 pt-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/50 text-sm font-semibold tracking-widest uppercase">Loading Metadata...</p>
        </div>
      </div>
    );
  }

  const title = getTitle(item);
  const score = ((item.vote_average || details?.vote_average) || 0).toFixed(1);
  const year = getYear(item) || getYear(details);
  const scoreC = scoreColor(parseFloat(score));
  const backdrop = img(item.backdrop_path || details?.backdrop_path, "original") || imgFallback(item.poster_path || details?.poster_path);
  const seasons = details?.number_of_seasons || item.number_of_seasons || 1;
  const isFav = favourites.some(f => f.id === item.id);

  const handleTrailer = async () => {
    try {
      const url = await fetchTrailer(item.id, type);
      if (url) window.open(url, "_blank");
      else showToast("No trailer available");
    } catch {
      showToast("Could not load trailer");
    }
  };

  const handlePlay = (epNum = null) => {
    openPlayer({ ...item, media_type: type }, selectedSeason, epNum || selectedEpisode);
  };

  const genres = (details?.genres || item.genre_ids?.map((gid) => ({ id: gid, name: genreMap?.[gid] })) || [])
    .slice(0, 5)
    .filter(g => g?.name);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] w-full text-white pb-20 overflow-x-hidden pt-16 lg:pt-0">

      {/* Top Background Area */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "60vh", maxHeight: "80vh" }}>

        <img
          src={backdrop}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          style={{ objectPosition: "center 20%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/60 to-black/20" />

      </div>

      {/* Main Content Body */}
      <div className="relative z-10 mx-auto px-6 lg:px-12 -mt-32 sm:-mt-48">

        {/* Header Block */}
        <div className="mb-10 animate-fade-up">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full mb-5"
            style={{
              background: "var(--color-brand-dim)",
              border: "1px solid rgba(249,115,22,0.3)",
              color: "var(--color-brand-hover)",
            }}
          >
            {tv ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
            {tv ? "TV Series" : "Feature Film"}
          </div>

          <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] text-white leading-[1.1] mb-4 tracking-wide drop-shadow-2xl">
            {title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-5 text-sm">
            <span className="font-bold font-mono tabular-nums flex items-center gap-1" style={{ color: scoreC }}>
              ★ {score}
            </span>
            {year && <span className="text-white/55 font-body">{year}</span>}
            <span
              className="px-2.5 py-0.5 rounded-md text-xs font-semibold font-body"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
            >
              {item.adult ? "18+" : tv ? "TV-14" : "PG-13"}
            </span>
            {details?.runtime > 0 && !tv && (
              <span className="text-white/55 text-[13px] font-body bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {details.runtime} min
              </span>
            )}
            {details?.episode_run_time?.[0] > 0 && tv && (
              <span className="text-white/55 text-[13px] font-body bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {details.episode_run_time[0]}m / ep
              </span>
            )}
            {details?.number_of_episodes > 0 && tv && (
              <span className="text-white/55 text-[13px] font-body bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {details.number_of_episodes} episodes
              </span>
            )}
          </div>

          {/* Genre chips */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {genres.map((g) => (
                <span
                  key={g.id || g.name}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <p className="text-white/60 text-sm md:text-[15px] leading-relaxed mb-7 font-body max-w-2xl line-clamp-4">
            {details?.overview || item.overview || "No description available."}
          </p>

          {/* Actions Array */}
          <div className="flex flex-wrap items-center gap-3 mb-16">
            <button
              onClick={() => handlePlay()}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              style={{ background: "var(--color-brand)", boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}
            >
              <Play className="w-4 h-4 fill-white" />
              {tv ? `Play S${selectedSeason} E${selectedEpisode}` : "Play Now"}
            </button>
            <button
              onClick={handleTrailer}
              className="glass flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              <Youtube className="w-4 h-4" />
              Trailer
            </button>
            <button
              onClick={() => toggleFavourite(item)}
              className={`glass flex items-center justify-center w-[44px] h-[44px] rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${isFav ? 'bg-pink-500/20 text-pink-500 border border-pink-500/30' : 'text-white hover:bg-white/10'}`}
              aria-label={isFav ? "Remove from Favourites" : "Add to Favourites"}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Cast Section */}
        {details?.credits?.cast?.length > 0 && (
          <div className="mb-16 animate-fade-in" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
            <h3 className="text-white text-2xl lg:text-3xl font-display font-bold mb-6 tracking-wide">Cast</h3>
            <div className="flex gap-4 lg:gap-6 overflow-x-auto custom-scrollbar pb-6 -mx-6 px-6 lg:-mx-12 lg:px-12">
              {details.credits.cast.slice(0, 15).map((c) => (
                <div key={c.id} className="flex-shrink-0 w-[100px] lg:w-[120px] text-center group cursor-default">
                  <div className="w-[100px] h-[100px] lg:w-[120px] lg:h-[120px] mx-auto mb-4 rounded-full overflow-hidden bg-[var(--color-surface-3)] border-[3px] border-[var(--color-surface-2)] transition-transform group-hover:scale-105 group-hover:border-[var(--color-brand)]">
                    {c.profile_path ? (
                      <img src={imgFallback(c.profile_path, "w185")} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/30 font-medium">N/A</div>
                    )}
                  </div>
                  <p className="text-sm lg:text-[15px] text-white font-bold leading-tight mb-1.5 line-clamp-2">{c.name}</p>
                  <p className="text-[11px] lg:text-[13px] text-white/50 leading-tight line-clamp-2">{c.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TV season/episode controls (ONLY TV) */}
        {tv && (
          <div className="mb-16 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
              <h3 className="text-white text-2xl lg:text-3xl font-display font-bold tracking-wide">Episodes</h3>

              {/* Season Selector */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 max-w-full md:max-w-[60%]">
                {Array.from({ length: seasons }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeason(s)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${s === selectedSeason ? 'bg-[var(--color-brand)] text-white shadow-lg shadow-brand/20' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                  >
                    Season {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Episodes List */}
            {episodes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {episodes.map((ep) => {
                  const isActive = selectedEpisode === ep.episode_number;
                  return (
                    <div key={ep.id}
                      onClick={() => handlePlay(ep.episode_number)}
                      className={`flex flex-col sm:flex-row gap-4 p-2 rounded-2xl cursor-pointer transition-all border ${isActive ? 'bg-white/5 border-[var(--color-brand)] shadow-lg' : 'bg-white/[0.02] border-transparent hover:bg-white/5 hover:border-white/10'}`}>

                      <div className="w-full sm:w-[200px] aspect-video flex-shrink-0 rounded-xl overflow-hidden bg-black/50 relative group">
                        {ep.still_path ? (
                          <img src={img(ep.still_path, "w500")} alt={ep.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-white/30 font-medium">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[var(--color-brand)] flex items-center justify-center shadow-2xl">
                            <Play className="w-6 h-6 fill-white pb-[2px] pr-[2px]" />
                          </div>
                        </div>
                        {isActive && (
                          <div className="absolute top-3 left-3 px-3 py-1 rounded text-[11px] font-bold tracking-widest uppercase bg-[var(--color-brand)] text-white shadow-xl">
                            Playing
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1.5 gap-2">
                          <h4 className={`text-base lg:text-lg font-bold truncate ${isActive ? 'text-[var(--color-brand)]' : 'text-white'}`}>
                            {ep.episode_number}. {ep.name}
                          </h4>
                          {ep.air_date && <span className="text-xs text-white/40 whitespace-nowrap pt-1 font-mono">{new Date(ep.air_date).getFullYear()}</span>}
                        </div>
                        <p className="text-xs lg:text-sm text-white/50 line-clamp-3 leading-relaxed mb-3">{ep.overview || "No description available."}</p>
                        {ep.runtime > 0 && (
                          <div className="text-[11px] lg:text-xs text-white/30 font-bold tracking-widest uppercase">
                            {ep.runtime} MIN
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center bg-white/[0.02] rounded-2xl border border-white/5">
                <p className="text-white/40 text-base font-medium">Episodes loading or unavailable.</p>
              </div>
            )}
          </div>
        )}

        {/* Similar Movies/Shows */}
        {details?.similar?.results?.filter(r => r.poster_path).length > 0 && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
            <h3 className="text-white text-2xl lg:text-3xl font-display font-bold mb-6 tracking-wide">More Like This</h3>
            <div className="flex gap-4 lg:gap-6 overflow-x-auto custom-scrollbar pb-6 -mx-6 px-6 lg:-mx-12 lg:px-12">
              {details.similar.results.filter(r => r.poster_path).slice(0, 15).map((s) => (
                <div key={s.id} onClick={() => {
                  selectMedia(normalizeItem(s));
                  router.push(`/${type}/${s.id}`);
                }} className="flex-shrink-0 w-[140px] lg:w-[160px] cursor-pointer group">
                  <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden mb-3 relative shadow-lg">
                    <img src={img(s.poster_path, "w342")} alt={getTitle(s)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  </div>
                  <p className="text-sm lg:text-[15px] text-white font-bold leading-tight line-clamp-2 group-hover:text-[var(--color-brand)] transition-colors">{getTitle(s)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
