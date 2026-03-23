'use client';
// components/player/PlayerOverlay.jsx
import { useEffect, useState } from "react";
import { ArrowLeft, Server, Loader2 } from "lucide-react";
import { getTitle, isTV } from "../../lib/tmdb";
import { getProvider, PROVIDERS } from "../../lib/providers";
import useStore from "../../store/useStore";

export default function PlayerOverlay() {
  const { playerItem, closePlayer, selectedSeason, selectedEpisode, provider: providerId, setProvider, addToContinueWatching } = useStore();
  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (playerItem) {
      addToContinueWatching(playerItem, {
        season: selectedSeason,
        episode: selectedEpisode,
        timestamp: Date.now()
      });
    }
  }, [playerItem, selectedSeason, selectedEpisode, addToContinueWatching]);

  useEffect(() => {
    document.body.style.overflow = playerItem ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [!!playerItem]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") closePlayer(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (!playerItem) return;

    const loadServers = async () => {
      const provider = getProvider(providerId);
      setLoading(true);
      setServers([]);
      setActiveServer(null);

      try {
        const result = await provider.getUrl(playerItem, selectedSeason, selectedEpisode);
        
        if (Array.isArray(result)) {
          setServers(result);
          if (result.length > 0) setActiveServer(result[0]);
        } else {
          setServers([{ name: provider.name, url: result }]);
          setActiveServer({ name: provider.name, url: result });
        }
      } catch (err) {
        console.error("Failed to load servers", err);
      } finally {
        setLoading(false);
      }
    };

    loadServers();
  }, [playerItem, providerId, selectedSeason, selectedEpisode]);

  if (!playerItem) return null;

  const tv = isTV(playerItem);
  const title = getTitle(playerItem);
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

        {/* Source selector (Provider) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 max-w-[200px] md:max-w-[300px]">
          <Server className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
          <select
            className="bg-transparent text-white/80 text-[12px] font-medium outline-none cursor-pointer w-full"
            value={providerId}
            onChange={(e) => setProvider(e.target.value)}
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#111] text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Server Selector (Mirror within provider) */}
        {servers.length > 1 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 max-w-[150px] md:max-w-[200px]">
            <select
              className="bg-transparent text-white/80 text-[12px] font-medium outline-none cursor-pointer w-full"
              value={activeServer?.id || activeServer?.url}
              onChange={(e) => {
                const s = servers.find(sv => (sv.id || sv.url) === e.target.value);
                if (s) setActiveServer(s);
              }}
            >
              {servers.map((s, idx) => (
                <option key={s.id || s.url || idx} value={s.id || s.url} className="bg-[#111] text-white">
                  Server {idx + 1}: {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* iframe container */}
      <div className="flex-1 relative bg-[#050505]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-0">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-white/40 text-xs font-medium tracking-widest uppercase">Fetching Servers...</p>
          </div>
        )}
        
        {activeServer?.url && (
          <iframe
            key={activeServer.url}
            id="player-iframe"
            src={activeServer.url}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            title={displayTitle}
            className={`w-full h-full border-0 transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
          />
        )}

        {!loading && !activeServer && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/40 text-sm">No servers found for this content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
