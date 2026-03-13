'use client';
// components/player/PlayerOverlay.jsx
import { useEffect } from "react";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { getTitle, isTV } from "../../lib/tmdb";
import { getProviderUrl } from "../../lib/providers";
import useStore from "../../store/useStore";

export default function PlayerOverlay() {
  const { playerItem, closePlayer, selectedSeason, selectedEpisode, provider } = useStore();

  useEffect(() => {
    document.body.style.overflow = playerItem ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [!!playerItem]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") closePlayer(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (!playerItem) return null;

  const tv = isTV(playerItem);
  const title = getTitle(playerItem);

  const src = getProviderUrl(provider, playerItem, selectedSeason, selectedEpisode);

  const displayTitle = tv
    ? `${title} — S${selectedSeason} E${selectedEpisode}`
    : title;

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-black animate-fade-in">
      {/* Top bar */}
      <div
        className="flex items-center gap-4 px-4 h-14 flex-shrink-0 z-10"
        style={{ background: "rgba(0,0,0,0.9)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={closePlayer}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium font-body group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
        <span
          className="flex-1 text-sm font-medium text-white/80 truncate font-body"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "16px" }}
        >
          {displayTitle}
        </span>
      </div>

      {/* iframe */}
      <div className="flex-1 relative">
        <iframe
          id="player-iframe"
          src={src}
          allowFullScreen
          // sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="autoplay; fullscreen; picture-in-picture"
          title={displayTitle}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
