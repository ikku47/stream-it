"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Play,
  Tv,
  Info,
  AlertCircle,
  ChevronRight,
  Maximize,
  Volume2,
  VolumeX,
  Pause,
  X,
  Server,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import useStore from "@/store/useStore";
import { useIPTV, useIPTVFiltered, useIPTVGroups } from "@/hooks/useIPTV";
import { getGroupIcon, IPTV_PROVIDERS, encodeChannelRouteKey } from "@/lib/iptv";

/**
 * ─── MINI PLAYER PREVIEW ─────────────────────────────────────────────────────
 */

const MiniChannelPreview = ({ channel, onPlay }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const hlsRef = useRef(null);

  const loadStream = () => {
    const video = videoRef.current;
    if (!video || !channel?.url) return;

    setLoading(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    video.pause();
    video.src = "";
    video.load();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = channel.url;
      video.muted = true;
      video.play().catch(() => setLoading(false));
    } else {
      const initHls = () => {
        if (!window.Hls || !window.Hls.isSupported()) {
          setLoading(false);
          return;
        }

        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          maxBufferLength: 30,
        });
        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          video.muted = true;
          video.play().catch(() => setLoading(false));
          setLoading(false);
        });

        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setLoading(false);
            hls.destroy();
          }
        });
      };

      if (window.Hls) {
        initHls();
      } else {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.async = true;
        script.onload = initHls;
        script.onerror = () => setLoading(false);
        document.body.appendChild(script);
      }
    }
  };

  useEffect(() => {
    loadStream();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel?.url]);

  return (
    <div className="flex  flex-col h-full bg-gradient-to-b from-black/60 via-black/40 to-black/80  overflow-hidden shadow-2xl">
      {/* Video Preview */}
      <div className="relative flex-1 bg-black overflow-hidden group aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onClick={() => onPlay(channel)}
          muted={isMuted}
          playsInline
        />

        {/* Play Overlay on Hover */}
        <button
          onClick={() => onPlay(channel)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--color-brand)] flex items-center justify-center shadow-2xl shadow-[var(--color-brand)]/50">
            <Play className="w-6 h-6 fill-white text-white ml-1" />
          </div>
        </button>

        {/* Loading spinner */}
        {/* {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="w-8 h-8 border-2 border-[var(--color-brand)]/30 border-t-[var(--color-brand)] rounded-full animate-spin" />
                    </div>
                )} */}
      </div>

      {/* Channel Info */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-0.5 bg-red-600/90 rounded text-[9px] font-black text-white uppercase tracking-tight flex items-center gap-1 flex-shrink-0">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              <span className="text-[10px] text-white/40 font-mono truncate">
                {channel.group?.split(";")[0] || "Unknown"}
              </span>
            </div>
            <h3 className="text-white text-sm font-display font-bold leading-tight truncate">
              {channel.name}
            </h3>
          </div>
        </div>

        <button
          onClick={() => onPlay(channel)}
          className="w-full py-2 px-3 bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Play className="w-3 h-3 fill-current" />
          WATCH NOW
        </button>
      </div>
    </div>
  );
};

/**
 * ─── CHANNEL LIST ITEM ─────────────────────────────────────────────────────
 */

const ChannelListItem = ({ channel, isSelected, onSelect, onPreview }) => (
  <div className="px-3 py-1.5">
    <button
      onClick={() => {
        onSelect(channel);
        onPreview(channel);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
        isSelected
          ? "bg-[var(--color-brand)] text-white shadow-lg shadow-[var(--color-brand)]/20"
          : "bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:border-[var(--color-brand)]/30"
      }`}
    >
      <div
        className={`w-10 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${isSelected ? "bg-white/20" : "bg-black/40"}`}
      >
        {channel.logo ? (
          <img
            src={channel.logo}
            alt=""
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <Tv
            className={`w-4 h-4 ${isSelected ? "text-white" : "text-white/20"}`}
          />
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <h4 className="text-sm font-medium truncate font-body">
          {channel.name}
        </h4>
        <p
          className={`text-[11px] truncate ${isSelected ? "text-white/60" : "text-white/30"}`}
        >
          {channel.group.split(";")[0]}
        </p>
      </div>

      <ChevronRight
        className={`w-4 h-4 flex-shrink-0 transition-transform ${isSelected ? "text-white" : "text-white/10 group-hover:text-white/30"}`}
      />
    </button>
  </div>
);

/**
 * ─── CATEGORY SIDEBAR ─────────────────────────────────────────────────────
 */

const CategorySidebar = ({
  groups,
  selectedGroup,
  onSelectGroup,
  loading,
  onClose,
  isOpen,
}) => (
  <aside
    className={`fixed top-16 md:top-0 lg:relative inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden transition-transform lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
  >
    {/* Header */}
    <div className="p-5 border-b border-white/5 flex items-center justify-between">
      <div>
        <h2 className="text-[11px] font-mono text-white/40 tracking-[.4em] uppercase font-black mb-1">
          Categories
        </h2>
        <div className="text-[10px] text-white/20">Browse by type</div>
      </div>
      <button
        onClick={onClose}
        className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-white/60" />
      </button>
    </div>

    {/* Category List */}
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="p-3 space-y-1">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-xl bg-white/5 animate-pulse"
              />
            ))
          : groups.map((group) => (
              <button
                key={group}
                onClick={() => {
                  onSelectGroup(group);
                  onClose?.();
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[13px] transition-all group ${
                  selectedGroup === group
                    ? "bg-[var(--color-brand)]/20 border border-[var(--color-brand)]/50 text-[var(--color-brand)]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <span
                  className={`text-lg ${selectedGroup === group ? "" : "opacity-50 group-hover:opacity-100"}`}
                >
                  {getGroupIcon(group)}
                </span>
                <span className="truncate font-medium flex-1 text-left">
                  {group}
                </span>
                {selectedGroup === group && (
                  <div className="w-2 h-2 rounded-full bg-[var(--color-brand)] shadow-[0_0_8px_var(--color-brand)]" />
                )}
              </button>
            ))}
      </div>
    </div>
  </aside>
);

/**
 * ─── MAIN PAGE ──────────────────────────────────────────────────────────────
 */

export default function LiveTVPage3Column() {
  const { channels, loading, error } = useIPTV();
  const groups = useIPTVGroups(channels);
  const { setTab, iptvProviderId, setIPTVProvider, setActiveLiveChannel } =
    useStore();
  const router = useRouter();

  const [selectedGroup, setSelectedGroup] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [previewChannel, setPreviewChannel] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredChannels = useIPTVFiltered(
    channels,
    selectedGroup,
    searchQuery,
  );

  useEffect(() => {
    setTab("live-tv");
  }, [setTab]);

    const activePreviewChannel = useMemo(() => {
        if (previewChannel && filteredChannels.some((channel) => channel.url === previewChannel.url)) {
            return previewChannel;
        }
        return filteredChannels[0] || null;
    }, [filteredChannels, previewChannel]);

    const handlePlayChannel = (channel) => {
        setActiveLiveChannel(channel);
        router.push(`/live-tv/${encodeChannelRouteKey(channel)}`);
    };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--color-bg)]">
        <AlertCircle className="w-16 h-16 text-red-500/50 mb-4" />
        <h2 className="text-2xl font-display text-white">
          Oops! Connection Failed
        </h2>
        <p className="text-white/40 mt-2 font-body font-light">
          Unable to fetch the playlist.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-8 py-3 bg-[var(--color-brand)] text-white rounded-full font-display tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-[var(--color-brand)]/20"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen fixed top-16 md:top-0 left-0 md:left-[80px] right-0 bg-[var(--color-bg)] text-white overflow-hidden font-body">
      {/* ─── HEADER ─── */}
      <header className="h-16 md:h-20 shrink-0 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/40 backdrop-blur-2xl z-30">
        <div className="flex items-center gap-3 md:gap-6 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-white/60" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-xl md:text-2xl font-display tracking-wide flex items-center gap-2 md:gap-3">
              <span className="hidden sm:inline">LIVE</span>{" "}
              <div>
 <span className="text-[var(--color-brand)]">CH</span>
              <span className="hidden sm:inline text-[var(--color-brand)]">
                ANNELS
              </span>
              </div>
            </h1>
            <span className="text-[8px] md:text-[10px] font-mono text-white/30 uppercase tracking-[.3em]">
              Discovery
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 ml-auto md:ml-4">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] md:text-[11px] font-medium text-white/60">
              {loading ? "..." : `${filteredChannels.length}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-4">
          {/* Mobile Search */}
          <div className="relative block md:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-lg py-2 pl-10 pr-3 text-xs focus:outline-none focus:border-[var(--color-brand)]/50 focus:bg-white/10 transition-all placeholder:text-white/10 w-32"
            />
          </div>

          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-xl py-2.5 pl-12 pr-6 w-56 text-sm focus:outline-none focus:border-[var(--color-brand)]/50 focus:bg-white/10 transition-all placeholder:text-white/10"
            />
          </div>

          {/* Provider Selector - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/5">
            <Server className="w-3.5 h-3.5 text-white/30" />
            <select
              value={iptvProviderId}
              onChange={(e) => setIPTVProvider(e.target.value)}
              className="bg-transparent text-[11px] font-medium text-white/60 outline-none appearance-none cursor-pointer hover:text-white transition-colors"
            >
              {IPTV_PROVIDERS.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  className="bg-[#111] text-white text-xs"
                >
                  {p.name.split(" (")[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ─── MOBILE OVERLAY ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── BODY: RESPONSIVE LAYOUT ─── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* LEFT: CATEGORIES */}
        <CategorySidebar
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
          loading={loading}
          onClose={() => setSidebarOpen(false)}
          isOpen={sidebarOpen}
        />

        {/* MOBILE: TOP PLAYER + BOTTOM LIST */}
        <div className="flex md:hidden flex-1 flex-col w-full overflow-hidden">
          {/* TOP: 16:9 VIDEO PLAYER */}
          <div className="w-full aspect-video bg-black border-b border-white/5 shrink-0">
                        {activePreviewChannel ? (
                            <MiniChannelPreview
                                channel={activePreviewChannel}
                                onPlay={handlePlayChannel}
                            />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tv className="w-12 h-12 text-white/10" />
              </div>
            )}
          </div>

          {/* BOTTOM: CHANNEL LIST */}
          <div className="flex-1 flex flex-col bg-black/20 border-t border-white/5 overflow-hidden">
            {/* Subheader */}
            <div className="px-4 py-3 border-b border-white/5 bg-black/40 backdrop-blur-lg">
              <h2 className="text-[12px] font-mono text-white/40 uppercase tracking-[.2em] font-bold truncate">
                {selectedGroup === "All" ? "All Channels" : selectedGroup}
              </h2>
              <p className="text-[10px] text-white/20 mt-1">
                {loading
                  ? "Loading..."
                  : `${filteredChannels.length} available`}
              </p>
            </div>

            {/* Channel List */}
            {loading ? (
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <Tv className="w-12 h-12 mb-4" />
                <p className="font-display tracking-widest text-xs">
                  NO CHANNELS
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <Virtuoso
                  data={filteredChannels}
                  useWindowScroll={false}
                  overscan={5}
                  style={{ height: "100%" }}
                  itemContent={(index, channel) => (
                    <ChannelListItem
                      key={channel.url}
                      channel={channel}
                      isSelected={selectedChannel?.url === channel.url}
                      onSelect={setSelectedChannel}
                      onPreview={setPreviewChannel}
                    />
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {/* TABLET+: 3-COLUMN LAYOUT */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* MIDDLE: CHANNEL LIST */}
          <div className="md:w-1/3 lg:w-1/4 flex flex-col bg-black/20 border-r border-white/5 overflow-hidden">
            {/* Subheader */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-black/40 backdrop-blur-lg">
              <h2 className="text-[12px] md:text-[13px] font-mono text-white/40 uppercase tracking-[.2em] font-bold truncate">
                {selectedGroup === "All" ? "All Channels" : selectedGroup}
              </h2>
              <p className="text-[10px] md:text-[11px] text-white/20 mt-1">
                {loading
                  ? "Loading..."
                  : `${filteredChannels.length} available`}
              </p>
            </div>

            {/* Channel List */}
            {loading ? (
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <Tv className="w-12 h-12 md:w-16 md:h-16 mb-4" />
                <p className="font-display tracking-widest text-xs md:text-sm">
                  NO CHANNELS
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <Virtuoso
                  data={filteredChannels}
                  useWindowScroll={false}
                  overscan={10}
                  style={{ height: "100%" }}
                  itemContent={(index, channel) => (
                    <ChannelListItem
                      key={channel.url}
                      channel={channel}
                      isSelected={selectedChannel?.url === channel.url}
                      onSelect={setSelectedChannel}
                      onPreview={setPreviewChannel}
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* RIGHT: LIVE PREVIEW PLAYER */}
          <div className="flex-1 shrink-0 bg-gradient-to-br from-black/60 via-black/40 to-black/80 border-l border-white/5 flex flex-col overflow-hidden">
            {/* Preview Header */}
            <div className="px-4 md:px-5 py-3 md:py-4 border-b border-white/5 bg-black/60 backdrop-blur-xl">
              <h2 className="text-[11px] font-mono text-white/40 uppercase tracking-[.3em] font-black">
                Preview
              </h2>
              <p className="text-[10px] text-white/20 mt-1">
                Select a channel to preview
              </p>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-3 md:p-5 overflow-hidden flex flex-col">
                            {activePreviewChannel ? (
                                <MiniChannelPreview
                                    channel={activePreviewChannel}
                                    onPlay={handlePlayChannel}
                                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                  <Tv className="w-12 h-12 md:w-12 md:h-12 mb-3" />
                  <p className="text-xs text-white/60 text-center">
                    No preview
                  </p>
                </div>
              )}
            </div>

            {/* Info Footer */}
            <div className="px-4 md:px-5 py-3 md:py-4 border-t border-white/5 bg-black/60 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-white/40 font-mono">
                <div className="w-2 h-2 rounded-full bg-[var(--color-brand)]/50" />
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
