"use client";

import Link from "next/link";
import { Mic2, Music2, Disc3, Radio, Sparkles, Play } from "lucide-react";
import type { MusicCardItem } from "@/lib/music";

const ICONS = {
  song: Music2,
  video: Radio,
  album: Disc3,
  artist: Mic2,
  playlist: Sparkles,
} as const;

export default function MusicCard({
  item,
  onPlay,
}: {
  item: MusicCardItem;
  onPlay?: (item: MusicCardItem) => void;
}) {
  const Icon = ICONS[item.kind];
  const canPlay = item.kind === "song" || item.kind === "video";
  const href =
    item.kind === "song" || item.kind === "video"
      ? `/music/track/${item.id}`
      : `/music/${item.kind}/${item.id}`;

  return (
    <Link
      href={href}
      className="group relative flex-shrink-0 w-40 sm:w-44 md:w-48 rounded-[20px] overflow-hidden border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(11,10,17,0.98))] hover:-translate-y-1 hover:border-orange-400/40 hover:shadow-[0_26px_60px_rgba(0,0,0,0.45)] transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-surface-3)]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#3a2716,transparent_60%),linear-gradient(180deg,#201910,#0f0d15)]">
            <Icon className="h-10 w-10 text-orange-300/80" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#090810] via-[#090810]/55 to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/8 bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/75 backdrop-blur-md">
          <Icon className="h-3 w-3" />
          {item.kind}
        </div>

        {item.rank && (
          <div className="absolute right-3 top-3 rounded-full bg-[var(--color-brand)] px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-white">
            #{item.rank}
          </div>
        )}

        {canPlay && onPlay && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onPlay(item);
            }}
            className="absolute bottom-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/90 text-white shadow-lg shadow-orange-500/30 transition-transform duration-200 hover:scale-105"
            aria-label={`Play ${item.title}`}
          >
            <Play className="h-4 w-4 fill-white" />
          </button>
        )}
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="line-clamp-2 text-sm font-semibold leading-tight text-[var(--color-text)]">{item.title}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-mute)]">{item.subtitle || "Play now"}</p>
          </div>
        </div>

        <div className="flex min-h-6 flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
          {item.badge && <span className="rounded-full bg-white/6 px-2 py-1">{item.badge}</span>}
          {item.meta && <span className="rounded-full bg-white/6 px-2 py-1">{item.meta}</span>}
        </div>
      </div>
    </Link>
  );
}
