'use client';
import { Play, Tv } from "lucide-react";
import useStore from "@/store/useStore";
import { useRouter } from "next/navigation";

export default function ChannelCard({ channel, inGrid = false }) {
  const { setActiveLiveChannel } = useStore();
  const router = useRouter();

  const handleSelect = () => {
    setActiveLiveChannel(channel);
    router.push("/live-tv/watch");
  };

  return (
    <div className={inGrid ? "p-2" : "flex-shrink-0 w-44 sm:w-52 md:w-60"}>
      <button
        onClick={handleSelect}
        className="group relative w-full aspect-video rounded-xl bg-white/5 border border-white/5 overflow-hidden transition-all hover:border-[var(--color-brand)]/50 hover:bg-white/10 active:scale-95 duration-200"
      >
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {channel.logo ? (
            <img 
              src={channel.logo} 
              alt={channel.name}
              className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
              loading="lazy"
            />
          ) : (
            <Tv className="w-8 h-8 text-white/5" />
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          <p className="text-[11px] font-body text-white font-medium truncate">{channel.name}</p>
        </div>

        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg">
          <Play className="w-3 h-3 fill-current ml-0.5" />
        </div>
      </button>
      {!inGrid && (
        <p className="mt-2 px-1 text-[11px] text-white/40 truncate font-body group-hover:text-white/60 transition-colors">
          {channel.name}
        </p>
      )}
    </div>
  );
}
