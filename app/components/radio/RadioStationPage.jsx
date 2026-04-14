'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Radio, Globe, Sparkles } from "lucide-react";
import useStore from "@/store/useStore";

export default function RadioStationPage({ station }) {
  const router = useRouter();
  const { activeRadioStation, setActiveRadioStation } = useStore();
  const currentStation = station || activeRadioStation;

  useEffect(() => {
    if (station) {
      setActiveRadioStation(station);
    }
  }, [station, setActiveRadioStation]);

  useEffect(() => {
    if (!currentStation) {
      router.replace("/radio");
    }
  }, [currentStation, router]);

  if (!currentStation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-white pt-24 pb-24 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8 text-white/40 text-[10px] uppercase tracking-[0.35em] font-mono">
          <Radio className="w-4 h-4 text-[var(--color-brand)]" />
          <span>Radio Station</span>
        </div>

        <div className="grid lg:grid-cols-[320px,1fr] gap-8 lg:gap-12 items-start">
          <div className="relative">
            <div className="aspect-square rounded-[2rem] glass overflow-hidden border border-white/10 shadow-2xl shadow-black/40 flex items-center justify-center bg-white/5">
              {currentStation.favicon ? (
                <img
                  src={currentStation.favicon}
                  alt={currentStation.name}
                  className="w-full h-full object-contain p-10"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/20">
                  <Sparkles className="w-20 h-20" />
                  <span className="text-xs uppercase tracking-[0.4em]">No Logo</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-[0.25em] text-white/60 font-semibold">
              <Globe className="w-3 h-3 text-[var(--color-brand)]" />
              {currentStation.country || "Global"}
            </div>

            <div>
              <h1 className="font-display text-[clamp(2.8rem,7vw,6.2rem)] leading-[0.95] tracking-wide text-white">
                {currentStation.name}
              </h1>
              <p className="mt-4 max-w-2xl text-white/60 text-base md:text-lg leading-relaxed">
                {currentStation.tags
                  ? `A ${currentStation.tags.split(",").slice(0, 3).join(", ")} station${currentStation.language ? ` broadcasting in ${currentStation.language}` : ""}.`
                  : `Listen live and browse related stations while the player runs in the persistent bar below.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                {currentStation.codec || "Audio"}
              </span>
              {currentStation.bitrate ? (
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                  {currentStation.bitrate} kbps
                </span>
              ) : null}
              {currentStation.language ? (
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                  {currentStation.language}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 pt-3">
              <button
                onClick={() => setActiveRadioStation(currentStation)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-brand)] text-white font-semibold shadow-lg shadow-[var(--color-brand)]/30 hover:scale-105 active:scale-95 transition-transform"
              >
                <Play className="w-4 h-4 fill-current" />
                Play in Bar
              </button>

              <button
                onClick={() => router.push("/radio")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 font-semibold hover:bg-white/10 transition-colors"
              >
                Back to Radio
              </button>
            </div>

            <div className="pt-8 grid sm:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-4 border border-white/10">
                <div className="text-white/30 text-[11px] uppercase tracking-[0.3em] mb-2">Country</div>
                <div className="text-white text-base font-medium">{currentStation.country || "Worldwide"}</div>
              </div>
              <div className="glass rounded-2xl p-4 border border-white/10">
                <div className="text-white/30 text-[11px] uppercase tracking-[0.3em] mb-2">Language</div>
                <div className="text-white text-base font-medium">{currentStation.language || "Multilingual"}</div>
              </div>
              <div className="glass rounded-2xl p-4 border border-white/10">
                <div className="text-white/30 text-[11px] uppercase tracking-[0.3em] mb-2">Stream</div>
                <div className="text-white text-base font-medium">{currentStation.codec || "Live audio"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
