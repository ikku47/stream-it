// components/ui/MediaRow.jsx
import { useMemo, useRef, type WheelEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import MediaCard from "../cards/MediaCard";
import SkeletonCard from "../cards/SkeletonCard";

export default function MediaRow({ title, icon, items = [], loading = false }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const trackRef = useRef<HTMLDivElement>(null);
  const Icon = (Icons as any)[icon || "Plus"];
  const seeAllHref = useMemo(() => {
    const normalized = String(title || "").toLowerCase();

    if (normalized.includes("trending")) return "/trending";
    if (normalized.includes("tv") || normalized.includes("airing") || normalized.includes("watch")) return "/tv";
    return "/movies";
  }, [title]);

  const scroll = (dir: number) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({
      left: dir * trackRef.current.clientWidth * 0.78,
      behavior: "smooth",
    });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      window.scrollBy({
        top: event.deltaY,
        behavior: "auto",
      });
    }
  };

  const handleSeeAll = () => {
    if (pathname === seeAllHref) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push(seeAllHref);
  };

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 mb-3.5">
        <h2 className="font-body text-lg md:text-xl font-semibold text-[var(--color-text)] flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-[var(--color-brand)]" />}
          {title}
        </h2>
        <button
          onClick={handleSeeAll}
          className="text-xs text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors font-semibold tracking-wider uppercase"
        >
          See all ›
        </button>
      </div>

      {/* Slider wrapper */}
      <div className="relative group/row">
        {/* Left scroll */}
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="absolute left-2 top-1/3 -translate-y-1/2 z-20 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-200 hover:bg-white/10 shadow-xl"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <div
          ref={trackRef}
          onWheel={handleWheel}
          className="flex gap-3 overflow-x-auto overflow-y-hidden no-scrollbar px-4 md:px-8 pb-2"
        >
          {loading
            ? Array.from({ length: 9 }, (_, i) => <SkeletonCard key={i} />)
            : items.map((item: any) => (
              <MediaCard key={`${item.id}-${item.media_type}`} item={item} />
            ))}
        </div>

        {/* Right scroll */}
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="absolute right-2 top-1/3 -translate-y-1/2 z-20 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-200 hover:bg-white/10 shadow-xl"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </section>
  );
}
