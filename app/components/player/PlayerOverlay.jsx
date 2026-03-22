'use client';
// components/player/PlayerOverlay.jsx
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Server, Loader2 } from "lucide-react";
import { getTitle, isTV } from "../../lib/tmdb";
import { getProvider } from "../../lib/providers";
import useStore from "../../store/useStore";

function loadHlsScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Hls) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.7/dist/hls.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Hls.js load failed"));
    document.body.appendChild(s);
  });
}

export default function PlayerOverlay() {
  const {
    playerItem,
    closePlayer,
    selectedSeason,
    selectedEpisode,
    provider: providerId,
    playbackLang,
    addToContinueWatching
  } = useStore();
  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playError, setPlayError] = useState(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

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
      setPlayError(null);

      try {
        const result = await provider.getUrl(playerItem, selectedSeason, selectedEpisode, {
          lang: playbackLang
        });
        const list = result?.servers || [];
        const mapped = list.map((s) => ({
          name: s.name,
          source: s.video.source,
          type: s.video.type,
          headers: s.video.headers || {},
          subtitles: s.video.subtitles || []
        }));
        setServers(mapped);
        if (mapped.length > 0) setActiveServer(mapped[0]);
      } catch (err) {
        console.error("Failed to load servers", err);
        setPlayError(err.message || "Could not load stream");
      } finally {
        setLoading(false);
      }
    };

    loadServers();
  }, [playerItem, providerId, selectedSeason, selectedEpisode, playbackLang]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeServer?.source) return;

    setPlayError(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    video.removeAttribute("src");
    video.load();

    const { source, type, headers } = activeServer;
    const isHls =
      type === "application/vnd.apple.mpegurl" ||
      /\.m3u8(\?|$)/i.test(source);

    let cancelled = false;

    const run = async () => {
      try {
        if (isHls) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            await video.play().catch(() => {});
            return;
          }
          await loadHlsScript();
          if (cancelled || !window.Hls?.isSupported?.()) {
            setPlayError("HLS is not supported in this browser.");
            return;
          }
          const hls = new window.Hls({
            enableWorker: true,
            xhrSetup: (xhr) => {
              if (headers?.Referer) xhr.setRequestHeader("Referer", headers.Referer);
              if (headers?.Origin) xhr.setRequestHeader("Origin", headers.Origin);
              if (headers?.["User-Agent"]) xhr.setRequestHeader("User-Agent", headers["User-Agent"]);
            }
          });
          hlsRef.current = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          hls.on(window.Hls.Events.ERROR, (_, data) => {
            if (data.fatal) setPlayError("Stream playback failed.");
          });
        } else {
          video.src = source;
          await video.play().catch(() => {});
        }
      } catch (e) {
        console.error(e);
        setPlayError(e.message || "Playback error");
      }
    };

    run();

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeServer?.source, activeServer?.type]);

  if (!playerItem) return null;

  const tv = isTV(playerItem);
  const title = getTitle(playerItem);
  const displayTitle = tv
    ? `${title} — S${selectedSeason} E${selectedEpisode}`
    : title;

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-black animate-fade-in">
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

        {servers.length > 1 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 max-w-[200px] md:max-w-[300px]">
            <Server className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            <select
              className="bg-transparent text-white/80 text-[12px] font-medium outline-none cursor-pointer w-full"
              value={activeServer ? Math.max(0, servers.indexOf(activeServer)) : 0}
              onChange={(e) => {
                const idx = Number(e.target.value);
                const s = servers[idx];
                if (s) setActiveServer(s);
              }}
            >
              {servers.map((s, idx) => (
                <option key={idx} value={idx} className="bg-[#111] text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 relative bg-[#050505] flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-white/40 text-xs font-medium tracking-widest uppercase">Resolving stream…</p>
          </div>
        )}

        <video
          ref={videoRef}
          className={`w-full h-full max-h-full object-contain bg-black ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          controls
          playsInline
          autoPlay
        />

        {!loading && playError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/50 text-sm max-w-md text-center px-6">{playError}</p>
          </div>
        )}

        {!loading && !activeServer && !playError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/40 text-sm">No stream available for this title.</p>
          </div>
        )}
      </div>
    </div>
  );
}
