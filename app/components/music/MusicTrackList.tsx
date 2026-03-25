"use client";

import { Play } from "lucide-react";
import type { MusicCardItem } from "@/lib/music";

export default function MusicTrackList({
  items,
  onPlay,
}: {
  items: MusicCardItem[];
  onPlay: (item: MusicCardItem) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <button
          key={`${item.id}-${index}`}
          type="button"
          onClick={() => onPlay(item)}
          className="group flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-left transition-all hover:border-white/20 hover:bg-white/8"
        >
          <span className="w-8 text-xs font-semibold text-white/40">{String(index + 1).padStart(2, "0")}</span>
          <div className="h-12 w-12 overflow-hidden rounded-xl bg-[var(--color-surface-3)]">
            {item.image ? (
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-white/40">No art</div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="text-xs text-white/50">{item.subtitle}</p>
          </div>
          <span className="text-xs text-white/40">{item.meta}</span>
          <span className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/90 text-white shadow-lg shadow-orange-500/25 transition-transform group-hover:scale-105">
            <Play className="h-4 w-4 fill-white" />
          </span>
        </button>
      ))}
    </div>
  );
}
