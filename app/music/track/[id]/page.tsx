"use client";

import Head from "next/head";
import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import MusicPlayerDock from "@/components/music/MusicPlayerDock";
import { useMusicDetail } from "@/hooks/useMusic";
import useMusicStore from "@/store/useMusicStore";
import type { MusicTrackDetail } from "@/lib/music";

export default function TrackDetailPage({ params }: { params: { id: string } }) {
  const { data: detail, loading, error } = useMusicDetail<MusicTrackDetail>("track", params.id);
  const nowPlaying = useMusicStore((state) => state.nowPlaying);
  const setNowPlaying = useMusicStore((state) => state.setNowPlaying);

  return (
    <>
      <Head>
        <title>{detail?.header.title || "Track"} – JoyFlix</title>
      </Head>

      <div className="min-h-screen px-4 pb-24 pt-24 md:px-8">
        {loading && (
          <div className="flex items-center gap-3 text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading track...
          </div>
        )}

        {error && <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{error}</div>}

        {detail && (
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5 p-6 md:flex-row md:items-center">
              <div className="h-40 w-40 overflow-hidden rounded-[24px] bg-[var(--color-surface-3)]">
                {detail.header.image ? (
                  <img src={detail.header.image} alt={detail.header.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-white/50">No art</div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-brand)]">Track</p>
                <h1 className="font-display text-4xl text-white md:text-5xl">{detail.header.title}</h1>
                <p className="mt-2 text-sm text-white/60">{detail.header.subtitle}</p>
                {detail.header.description && (
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-mute)] line-clamp-3">
                    {detail.header.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setNowPlaying(detail.item)}
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30"
              >
                <Play className="h-4 w-4 fill-white" />
                Play
              </button>
            </div>
          </div>
        )}
      </div>

      <MusicPlayerDock item={nowPlaying} onClose={() => setNowPlaying(null)} />
    </>
  );
}
