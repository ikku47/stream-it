import { useRouter } from "next/navigation";
import { Play, Star, Tv, Film } from "lucide-react";
import { imgFallback, scoreColor, getTitle, getYear, isTV } from "../../lib/tmdb";
import useStore from "../../store/useStore";
import { getDetailUrl } from "../../lib/navigation";

export default function MediaCard({ item, inGrid = false }) {
  const router = useRouter();
  const { selectMedia, openPlayer } = useStore();
  const tv    = isTV(item);
  const type  = tv ? "tv" : "movie";
  const title = getTitle(item);
  const year  = getYear(item);
  const score = (item.vote_average || 0).toFixed(1);
  const color = scoreColor(parseFloat(score));
  const norm  = { ...item, media_type: type };

  const handleNavigate = () => {
    selectMedia(norm);
    router.push(getDetailUrl(type, item.id));
  };

  return (
    <div
      onClick={handleNavigate}
      className={[
        "group relative flex-shrink-0 cursor-pointer rounded-[12px] overflow-hidden",
        "bg-[var(--color-surface-2)] transition-all duration-300",
        "hover:scale-[1.06] hover:z-10 hover:shadow-2xl hover:shadow-black/70",
        inGrid ? "w-full" : "w-36 sm:w-40 md:w-44",
      ].join(" ")}
    >
      {/* Poster */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "2/3" }}>
        <img
          src={imgFallback(item.poster_path, "w342")}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-3 gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); openPlayer(norm); }}
            aria-label={`Play ${title}`}
            className="w-11 h-11 rounded-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] flex items-center justify-center shadow-lg shadow-[var(--color-brand-dim)] transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </button>
          <p className="text-white text-[11px] font-medium text-center line-clamp-2 leading-tight px-1">
            {title}
          </p>
          {year && <span className="text-white/40 text-[10px]">{year}</span>}
        </div>

        {/* Score badge */}
        <div
          className="absolute top-1.5 right-1.5 flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{ color, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
        >
          <Star className="w-2.5 h-2.5 fill-current" />
          {score}
        </div>

        {/* Type badge */}
        <div
          className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md text-white/50"
          style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
        >
          {tv ? <Tv className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
        </div>
      </div>

      {/* Title strip */}
      <div className="px-2.5 py-2">
        <p className="text-[var(--color-text)] text-[12px] font-medium line-clamp-2 leading-tight">
          {title}
        </p>
        {year && (
          <p className="text-[var(--color-text-mute)] text-[11px] mt-0.5">{year}</p>
        )}
      </div>
    </div>
  );
}
