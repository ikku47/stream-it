"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MusicCard from "@/components/music/MusicCard";
import type { MusicCardItem } from "@/lib/music";

function SkeletonCard() {
  return (
    <div className="skeleton h-[250px] w-40 flex-shrink-0 rounded-[20px] sm:w-44 md:w-48" />
  );
}

export default function MusicRow({
  title,
  kicker,
  items,
  loading = false,
  onPlay,
}: {
  title: string;
  kicker: string;
  items: MusicCardItem[];
  loading?: boolean;
  onPlay?: (item: MusicCardItem) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: number) => {
    if (!trackRef.current) return;

    trackRef.current.scrollBy({
      left: direction * trackRef.current.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-end justify-between px-4 md:px-8">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[var(--color-brand)]">{kicker}</p>
          <h2 className="font-display text-3xl leading-none tracking-[0.04em] text-white md:text-4xl">{title}</h2>
        </div>

        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2 md:px-8">
        {loading
          ? Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)
          : items.map((item) => (
            <MusicCard key={`${item.kind}-${item.id}`} item={item} onPlay={onPlay} />
          ))}
      </div>
    </section>
  );
}
