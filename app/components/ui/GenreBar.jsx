// components/ui/GenreBar.jsx
import { HOME_GENRES } from "../../lib/tmdb";
import useStore from "../../store/useStore";

export default function GenreBar() {
  const { currentGenreId, setGenreId } = useStore();

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 md:px-8 py-4">
      {HOME_GENRES.map((g) => {
        const active = g.id === currentGenreId;
        return (
          <button
            key={g.id ?? "all"}
            onClick={() => setGenreId(g.id)}
            className={[
              "flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 font-body",
              active
                ? "text-white shadow-lg"
                : "text-[var(--color-text-mute)] hover:text-[var(--color-text)] hover:border-white/20",
            ].join(" ")}
            style={
              active
                ? { background: "var(--color-brand)", boxShadow: "0 4px 14px rgba(249,115,22,0.3)" }
                : { background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }
            }
          >
            {g.name}
          </button>
        );
      })}
    </div>
  );
}
