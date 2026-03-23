import React from "react";
import { ChevronRight } from "lucide-react";

interface SelectionItem {
  id: string | number | null;
  name: string;
}

interface SelectionGridProps {
  title: string;
  items: SelectionItem[];
  onSelect: (id: string | number | null) => void;
  activeId?: string | number | null;
}

export default function SelectionGrid({ title, items, onSelect, activeId }: SelectionGridProps) {
  return (
    <div className="pt-24 pb-16 px-4 md:px-8 min-h-screen max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10 flex items-center gap-3">
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">{title}</h1>
        <div
          className="h-0.5 flex-1 rounded-full"
          style={{ background: "linear-gradient(to right, var(--color-brand), transparent)" }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.filter(item => item.id !== null).map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={String(item.id)}
              onClick={() => onSelect(item.id)}
              className={[
                "group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1",
                isActive ? "shadow-lg shadow-brand/20 ring-1 ring-brand" : "hover:shadow-xl hover:shadow-black/40"
              ].join(" ")}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)"
                  : "var(--color-surface-2)",
                border: isActive ? "1px solid var(--color-brand)" : "1px solid var(--color-border)"
              }}
            >
              {/* Background Glow on Hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at top right, rgba(249,115,22,0.15), transparent 70%)"
                }}
              />

              <div className="relative flex items-center justify-between">
                <span className={[
                  "font-body text-lg font-semibold tracking-wide transition-colors",
                  isActive ? "text-brand" : "text-white group-hover:text-brand"
                ].join(" ")}>
                  {item.name}
                </span>

                <div className={[
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                  isActive ? "bg-brand text-white" : "bg-white/5 text-white/40 group-hover:bg-brand/20 group-hover:text-brand"
                ].join(" ")}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
