'use client';
import { useEffect, useState, useRef } from "react";
import { getTopRadioStations } from "@/lib/radio";
import RadioCard from "../cards/RadioCard";
import { ChevronLeft, ChevronRight, Mic2, Sparkles } from "lucide-react";

export default function RadioRow({ title = "Live Radio Broadcasts", icon = "Mic2" }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTopRadioStations(100);
        setStations(data);
      } catch (err) {
        console.error("Radio loading error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * trackRef.current.clientWidth * 0.78, behavior: "smooth" });
  };

  if (!loading && stations.length === 0) return null;

  return (
    <section className="mb-20 overflow-hidden relative group/row-section">
      {/* Dynamic background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[300px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none opacity-0 group-hover/row-section:opacity-100 transition-opacity duration-1000" />
      
      <div className="flex items-center justify-between px-4 md:px-10 mb-8">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-white flex items-center gap-4 tracking-tight">
            <div className="w-12 h-12 rounded-2xl bg-orange-600/10 flex items-center justify-center border border-orange-600/20 shadow-xl shadow-orange-950/20">
              <Mic2 className="w-6 h-6 text-orange-500" />
            </div>
            {title}
          </h2>
          <div className="flex items-center gap-3 ml-[64px]">
             <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
             <p className="text-white/30 text-[11px] font-mono tracking-[0.2em] uppercase font-bold">Live Global Broadcasts • {stations.length} Available</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 group/premium cursor-default">
             <Sparkles className="w-3.5 h-3.5 text-orange-400 group-hover/premium:rotate-12 transition-transform" />
             <span className="text-[11px] font-bold text-white/40 tracking-tight uppercase">Lossless Discovery</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-60 hover:opacity-100 transition-all border border-white/5 hover:bg-white/10 hover:scale-105 active:scale-95 shadow-2xl"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-60 hover:opacity-100 transition-all border border-white/5 hover:bg-white/10 hover:scale-105 active:scale-95 shadow-2xl"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div ref={trackRef} className="flex gap-6 overflow-x-auto no-scrollbar px-4 md:px-10 pb-8 scroll-smooth">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 sm:w-44 md:w-52 aspect-square rounded-3xl bg-white/5 animate-pulse skeleton" />
            ))
            : stations.map((s) => (
              <RadioCard key={s.id} station={s} />
            ))
          }
          {/* View More Card */}
          {!loading && stations.length > 0 && (
            <button 
              onClick={() => window.location.href = '/radio'}
              className="flex-shrink-0 w-36 sm:w-44 md:w-52 aspect-square rounded-3xl bg-white/[0.02] border border-white/5 border-dashed flex flex-col items-center justify-center gap-3 group hover:bg-white/5 hover:border-white/20 transition-all"
            >
               <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChevronRight className="w-6 h-6 text-white/40" />
               </div>
               <span className="text-[11px] font-mono font-black text-white/30 uppercase tracking-widest">Explore All</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
