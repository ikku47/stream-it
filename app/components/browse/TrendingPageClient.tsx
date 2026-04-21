'use client';
import { useEffect } from "react";
import Hero from "@/components/ui/Hero";
import MediaRow from "@/components/ui/MediaRow";
import { useRows } from "@/hooks/useTMDB";
import useStore from "@/store/useStore";

export default function TrendingPageClient() {
  const { heroItem, setTab } = useStore();
  const { rows, loading } = useRows("trending", null);

  useEffect(() => {
    setTab("trending");
  }, [setTab]);

  return (
    <>
      <Hero item={heroItem} />

      <div className="px-4 md:px-8 pt-6 pb-1 flex items-center gap-3">
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">Trending</h1>
        <div
          className="h-0.5 flex-1 rounded-full"
          style={{ background: "linear-gradient(to right, var(--color-brand), transparent)" }}
        />
      </div>

      <div className="px-4 md:px-8 py-4 mb-2">
        <div
          className="rounded-2xl p-5 flex items-center gap-4 flex-wrap"
          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
        >
          {[
            { label: "Today's Hot", icon: "📈", desc: "What people are watching right now" },
            { label: "This Week", icon: "📅", desc: "The week's most-watched titles" },
            { label: "Trending Movies", icon: "🎥", desc: "Top films across all platforms" },
            { label: "Trending TV", icon: "📺", desc: "Binge-worthy series this week" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 flex-1 min-w-[180px]">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-white text-sm font-semibold font-body">{s.label}</p>
                <p className="text-[var(--color-text-dim)] text-[11px] font-body">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-12">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <MediaRow key={i} title="" emoji="" items={[] as MediaItem[]} loading={true} />
            ))
          : rows.map((row: MediaRowType) => (
              <MediaRow
                key={row.title}
                title={row.title}
                emoji={row.emoji || ""}
                items={row.items}
                loading={false}
              />
            ))}
      </div>
    </>
  );
}
