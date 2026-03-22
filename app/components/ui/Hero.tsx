// components/ui/Hero.jsx
import { Play, Info, Tv, Film, Heart } from "lucide-react";
import { img, scoreColor, getTitle, getYear, isTV } from "../../lib/tmdb";
import useStore from "../../store/useStore";

function HeroSkeleton() {
  return (
    <div className="relative w-full" style={{ height: "78vh" }}>
      <div className="absolute inset-0 skeleton" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
    </div>
  );
}

export default function Hero({ item }: { item: MediaItem | null }) {
  const { openModal, openPlayer, favourites, toggleFavourite } = useStore();
  if (!item) return <HeroSkeleton />;

  const tv      = isTV(item);
  const title   = getTitle(item);
  const score   = (item.vote_average || 0).toFixed(1);
  const year    = getYear(item);
  const bg      = img(item.backdrop_path, "original");
  const scoreC  = scoreColor(parseFloat(score));
  const norm    = { ...item, media_type: tv ? "tv" : "movie" };
  const isFav   = favourites.some((f: any) => f.id === norm.id);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "78vh", minHeight: "520px" }}>
      {/* Backdrop */}
      {bg && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-fade-in"
          style={{ backgroundImage: `url(${bg})` }}
        />
      )}

      {/* Gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-black/20" />

      {/* Subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Content */}
      <div className="relative h-full flex items-end pb-14 md:pb-20 px-6 md:px-12 lg:px-16">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full mb-5 opacity-0-init animate-fade-up"
            style={{
              background: "var(--color-brand-dim)",
              border: "1px solid rgba(249,115,22,0.3)",
              color: "var(--color-brand-hover)",
              animationDelay: "0ms",
            }}
          >
            {tv ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
            {tv ? "TV Series" : "Feature Film"}
          </div>

          {/* Title */}
          <h1
            className="font-display text-[clamp(3rem,8vw,7rem)] text-white leading-none mb-4 opacity-0-init animate-fade-up drop-shadow-2xl tracking-wide"
            style={{ animationDelay: "80ms" }}
          >
            {title}
          </h1>

          {/* Meta */}
          <div
            className="flex items-center gap-4 mb-5 text-sm opacity-0-init animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            <span className="font-bold font-mono tabular-nums" style={{ color: scoreC }}>
              ★ {score}
            </span>
            {year && <span className="text-white/55 font-body">{year}</span>}
            <span
              className="px-2.5 py-0.5 rounded-md text-xs font-semibold font-body"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
            >
              {item.adult ? "18+" : tv ? "TV-14" : "PG-13"}
            </span>
          </div>

          {/* Overview */}
          <p
            className="text-white/60 text-sm md:text-[15px] leading-relaxed line-clamp-3 mb-7 font-body opacity-0-init animate-fade-up"
            style={{ animationDelay: "240ms", maxWidth: "520px" }}
          >
            {item.overview || "No description available."}
          </p>

          {/* Actions */}
          <div
            className="flex items-center gap-3 opacity-0-init animate-fade-up"
            style={{ animationDelay: "320ms" }}
          >
            <button
              onClick={() => openPlayer(norm)}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              style={{ background: "var(--color-brand)", boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-brand-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-brand)"}
            >
              <Play className="w-4 h-4 fill-white" />
              Play Now
            </button>
            <button
              onClick={() => openModal(norm)}
              className="glass flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              <Info className="w-4 h-4" />
              More Info
            </button>
            <button
              onClick={() => toggleFavourite(norm)}
              className={`glass flex items-center justify-center w-[44px] h-[44px] rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${isFav ? 'bg-pink-500/20 text-pink-500 border border-pink-500/30' : 'text-white hover:bg-white/10'}`}
              aria-label={isFav ? "Remove from Favourites" : "Add to Favourites"}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
