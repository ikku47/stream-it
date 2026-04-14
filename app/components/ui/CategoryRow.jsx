'use client';
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { getCategorySlug, getLanguageSlug } from "@/lib/tmdb";

export default function CategoryRow({ title, items, type, icon }) {
  const router = useRouter();
  const Icon = Icons[icon || "LayoutGrid"];

  const handleNavigate = (item) => {
    if (type === "categories") {
      router.push(`/categories/${getCategorySlug(item)}`);
      return;
    }
    if (type === "languages") {
      router.push(`/languages/${getLanguageSlug(item)}`);
      return;
    }
    if (type === "years") {
      router.push(`/years/${item.id}`);
      return;
    }
    router.push(`/${type}`);
  };

  return (
    <section className="mb-14 px-4 md:px-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-body text-lg md:text-xl font-semibold text-white flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-brand)]" />}
          {title}
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item)}
            className="flex-shrink-0 cursor-pointer relative w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-black/40 border border-white/10 flex flex-col items-center justify-center hover:bg-white/5 hover:border-brand/40 transition-all shadow-xl group  active:scale-95 text-center px-2"
          >
            {/* The main content: Large text for numbers/short codes, smaller for long names */}
            <span className={`font-display text-white mb-0.5 group-hover:scale-110 transition-transform tracking-wider leading-none truncate w-full ${item.name.length > 4 ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'}`}>
              {item.name}
            </span>


            {/* Subtle glow on hover */}
            <div className="absolute inset-x-4 bottom-2 h-px bg-brand/0  transition-all shadow-[0_0_15px_var(--color-brand)]" />
          </button>
        ))}
      </div>
    </section>
  );
}
