"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import type { MusicCardItem } from "@/lib/music";

export default function MusicPlayerDock({
  item,
  onClose,
}: {
  item: MusicCardItem | null;
  onClose: () => void;
}) {
  const playerSrc = useMemo(() => {
    if (!item) return "";
    return `/api/music/stream?id=${encodeURIComponent(item.id)}`;
  }, [item]);

  if (!item) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#0a0911]/95 px-4 py-3 shadow-[0_-20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-[var(--color-surface-3)]">
            {item.image ? (
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-white/50">No art</div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="text-xs text-white/60">{item.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-3 md:justify-end">
          <div className="flex h-20 w-full max-w-[520px] items-center rounded-2xl border border-white/10 bg-black/40 px-3">
            <audio src={playerSrc} controls autoPlay className="h-10 w-full" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
