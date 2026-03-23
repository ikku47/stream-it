'use client';
import { useRouter } from "next/navigation";

export default function CategoryRow({ title, items, type, emoji }) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/${type}`);
  };

  return (
    <section className="mb-10 px-4 md:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-body text-lg md:text-xl font-semibold text-white flex items-center gap-2">
          {emoji && <span className="text-xl">{emoji}</span>}
          {title}
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={handleNavigate}
            className="flex-shrink-0 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand/10 hover:border-brand/40 transition-all group min-w-[140px] text-center shadow-xl shadow-black relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm font-bold text-white/50 group-hover:text-white group-hover:scale-105 transition-all relative z-10 uppercase tracking-widest">
              {item.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
