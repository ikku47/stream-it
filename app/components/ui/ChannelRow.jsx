'use client';
import { useIPTV } from "@/hooks/useIPTV";
import ChannelCard from "../cards/ChannelCard";
import { ChevronLeft, ChevronRight, Tv } from "lucide-react";
import { useRef } from "react";

export default function ChannelRow({ title = "Live TV Channels", emoji = "📡" }) {
  const { channels, loading } = useIPTV();
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * trackRef.current.clientWidth * 0.78, behavior: "smooth" });
  };

  if (!loading && channels.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between px-4 md:px-8 mb-5">
        <h2 className="font-body text-lg md:text-xl font-semibold text-white flex items-center gap-3">
          <span className="text-xl">{emoji}</span>
          {title}
        </h2>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-red-500/80 uppercase">Broadcasting now</span>
        </div>
      </div>

      <div className="relative group/row">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all border border-white/5 hover:bg-white/10 shadow-2xl shadow-black"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div ref={trackRef} className="flex gap-4 overflow-x-auto no-scrollbar px-4 md:px-8 pb-4">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-60 aspect-video rounded-3xl bg-white/5 animate-pulse skeleton" />
            ))
            : channels.slice(0, 30).map((c) => (
              <ChannelCard key={c.url} channel={c} />
            ))
          }
        </div>

        <button
          onClick={() => scroll(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all border border-white/5 hover:bg-white/10 shadow-2xl shadow-black"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </section>
  );
}
