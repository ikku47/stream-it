"use client";

import Head from "next/head";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import MusicPlayerDock from "@/components/music/MusicPlayerDock";
import MusicTrackList from "@/components/music/MusicTrackList";
import { useMusicDetail } from "@/hooks/useMusic";
import useMusicStore from "@/store/useMusicStore";
import type { MusicAlbumDetail } from "@/lib/music";

export default function AlbumDetailPage({ params }: { params: { id: string } }) {
  const { data: detail, loading, error } = useMusicDetail<MusicAlbumDetail>("album", params.id);
  const nowPlaying = useMusicStore((state) => state.nowPlaying);
  const setNowPlaying = useMusicStore((state) => state.setNowPlaying);

  return (
    <>
      <Head>
        <title>{detail?.header.title || "Album"} – JoyFlix</title>
      </Head>

      <div className="min-h-screen px-4 pb-24 pt-24 md:px-8">
        {loading && (
          <div className="flex items-center gap-3 text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading album...
          </div>
        )}

        {error && <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{error}</div>}

        {detail && (
          <div className="mx-auto max-w-5xl space-y-10">
            <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5 p-6 md:flex-row md:items-center">
              <div className="h-40 w-40 overflow-hidden rounded-[24px] bg-[var(--color-surface-3)]">
                {detail.header.image ? (
                  <img src={detail.header.image} alt={detail.header.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-white/50">No art</div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-brand)]">Album</p>
                <h1 className="font-display text-4xl text-white md:text-5xl">{detail.header.title}</h1>
                <p className="mt-2 text-sm text-white/60">{detail.header.subtitle}</p>
                {detail.header.description && (
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-mute)]">{detail.header.description}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl text-white">Tracks</h2>
              <MusicTrackList items={detail.tracks} onPlay={setNowPlaying} />
            </div>
          </div>
        )}
      </div>

      <MusicPlayerDock item={nowPlaying} onClose={() => setNowPlaying(null)} />
    </>
  );
}
