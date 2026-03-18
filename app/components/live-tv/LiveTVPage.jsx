'use client';

import { useState, useEffect, useMemo, forwardRef } from "react";
import { Search, Play, Tv, Info, AlertCircle, ChevronRight, LayoutGrid, List as ListIcon, Server } from "lucide-react";
import { VirtuosoGrid } from "react-virtuoso";
import useStore from "@/store/useStore";
import { useIPTV, useIPTVFiltered, useIPTVGroups } from "@/hooks/useIPTV";
import { getGroupIcon, IPTV_PROVIDERS } from "@/lib/iptv";
import LivePlayer from "./LivePlayer";

/**
 * ─── COMPONENTS ─────────────────────────────────────────────────────────────
 */

// Grid Item (Compact)
const ChannelCard = ({ channel, onSelect }) => (
  <div className="p-2">
    <button
      onClick={() => onSelect(channel)}
      className="group relative w-full aspect-video rounded-xl bg-white/5 border border-white/5 overflow-hidden transition-all hover:border-[var(--color-brand)]/50 hover:bg-white/10 active:scale-95 duration-200"
    >
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {channel.logo ? (
          <img 
            src={channel.logo} 
            alt=""
            className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        ) : (
          <Tv className="w-8 h-8 text-white/5" />
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <p className="text-[11px] font-body text-white font-medium truncate">{channel.name}</p>
      </div>

      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg">
        <Play className="w-3 h-3 fill-current ml-0.5" />
      </div>
    </button>
    <p className="mt-2 px-1 text-[11px] text-white/40 truncate font-body group-hover:text-white/60 transition-colors">
      {channel.name}
    </p>
  </div>
);

// List Item
const ChannelRow = ({ channel, onSelect }) => (
  <div className="px-4 py-1">
    <button
      onClick={() => onSelect(channel)}
      className="flex items-center gap-4 w-full p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[var(--color-brand)]/30 transition-all group active:scale-[0.99]"
    >
      <div className="w-12 h-9 rounded-lg bg-black/40 flex items-center justify-center p-1.5 flex-shrink-0">
        {channel.logo ? (
          <img src={channel.logo} alt="" className="w-full h-full object-contain" />
        ) : (
          <Tv className="w-4 h-4 text-white/10" />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <h4 className="text-sm font-medium text-white group-hover:text-[var(--color-brand)] transition-colors truncate font-body">
          {channel.name}
        </h4>
        <p className="text-[11px] text-white/20 truncate font-body">
          {channel.group.split(';')[0]}
        </p>
      </div>
      <Play className="w-4 h-4 text-white/10 group-hover:text-[var(--color-brand)] group-hover:scale-110 transition-all" />
    </button>
  </div>
);

/**
 * ─── VIRTUOSO WRAPPERS ──────────────────────────────────────────────────────
 */

const GridContainer = forwardRef(({ children, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-1 p-2 md:p-4"
  >
    {children}
  </div>
));
GridContainer.displayName = "GridContainer";

const ListContainer = forwardRef(({ children, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className="flex flex-col w-full max-w-5xl mx-auto py-4"
  >
    {children}
  </div>
));
ListContainer.displayName = "ListContainer";

const ItemWrapper = forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
ItemWrapper.displayName = "ItemWrapper";

/**
 * ─── MAIN PAGE ──────────────────────────────────────────────────────────────
 */

export default function LiveTVPage() {
  const { channels, loading, error } = useIPTV();
  const groups = useIPTVGroups(channels);
  const { setTab, iptvProviderId, setIPTVProvider } = useStore();
  
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const filteredChannels = useIPTVFiltered(channels, selectedGroup, searchQuery);

  useEffect(() => { setTab("live-tv"); }, [setTab]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--color-bg)]">
        <AlertCircle className="w-16 h-16 text-red-500/50 mb-4" />
        <h2 className="text-2xl font-display text-white">Oops! Connection Failed</h2>
        <p className="text-white/40 mt-2 font-body font-light">Unable to fetch the playlist.</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-[var(--color-brand)] text-white rounded-full font-display tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-[var(--color-brand)]/20">
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] fixed bottom-0 left-0 right-0 bg-[var(--color-bg)] text-white overflow-hidden font-body">
      
      {/* ─── HEADER ─── */}
      <header className="h-20 shrink-0 border-b border-white/5 flex items-center justify-between px-6 md:px-10 bg-[var(--color-bg)]/80 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-display tracking-wide flex items-center gap-3">
              LIVE <span className="text-[var(--color-brand)]">CHANNELS</span>
            </h1>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-[.3em]">IPTV Discovery Engine</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-medium text-white/60">{loading ? "SYNCING..." : `${filteredChannels.length} ONLINE`}</span>
          </div>

          {/* Provider Selector (Left) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-2xl border border-white/5 ml-2">
            <Server className="w-3.5 h-3.5 text-white/30" />
            <select
              value={iptvProviderId}
              onChange={(e) => setIPTVProvider(e.target.value)}
              className="bg-transparent text-[11px] font-medium text-white/60 outline-none appearance-none cursor-pointer hover:text-white transition-colors"
            >
              {IPTV_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#111] text-white text-xs">
                  {p.name.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-12 pr-6 w-64 text-sm focus:outline-none focus:border-[var(--color-brand)]/50 focus:bg-white/10 transition-all placeholder:text-white/10"
            />
          </div>

          <div className="flex items-center bg-black/40 rounded-2xl p-1 border border-white/5">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-[var(--color-brand)] text-white" : "text-white/30 hover:text-white"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-[var(--color-brand)] text-white" : "text-white/30 hover:text-white"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── BODY ─── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-white/5 bg-black/20">
          <div className="p-6">
            <h3 className="text-[11px] font-mono text-white/20 tracking-[.4em] uppercase font-black">Categories</h3>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-10">
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse mb-2 mx-3" />
              ))
            ) : (
              <div className="flex flex-col gap-1">
                {groups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[13px] transition-all group ${
                      selectedGroup === group 
                        ? "bg-[var(--color-brand)] text-white shadow-lg shadow-[var(--color-brand)]/10" 
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-lg ${selectedGroup === group ? "" : "opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0"}`}>
                      {getGroupIcon(group)}
                    </span>
                    <span className="truncate flex-1 text-left font-medium">{group}</span>
                    {selectedGroup === group && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* MAIN LIST */}
        <main className="flex-1 relative bg-black/10">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 p-10">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-video rounded-2xl bg-white/5 animate-pulse" />
                  <div className="h-3 w-2/3 bg-white/5 animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 opacity-20">
              <Tv className="w-20 h-20 mb-6" />
              <p className="font-display tracking-widest">NO CHANNELS FOUND</p>
            </div>
          ) : (
            <VirtuosoGrid
              data={filteredChannels}
              useWindowScroll={false}
              overscan={400}
              components={{
                List: viewMode === "grid" ? GridContainer : ListContainer,
                Item: ItemWrapper
              }}
              style={{ height: '100%' }}
              itemContent={(index, channel) => (
                viewMode === "grid" ? (
                  <ChannelCard 
                    key={channel.url} 
                    channel={channel} 
                    onSelect={setSelectedChannel} 
                  />
                ) : (
                  <ChannelRow 
                    key={channel.url} 
                    channel={channel} 
                    onSelect={setSelectedChannel} 
                  />
                )
              )}
            />
          )}
        </main>
      </div>

      {/* ─── PLAYER ─── */}
      {selectedChannel && (
        <LivePlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}
    </div>
  );
}
