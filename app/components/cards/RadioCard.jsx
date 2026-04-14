'use client';
import { Play, Mic } from "lucide-react";
import useStore from "@/store/useStore";
import { useRouter } from "next/navigation";

export default function RadioCard({ station, inGrid = false, compact = false, spotify = false }) {
  const { setActiveRadioStation } = useStore();
  const router = useRouter();

  const handleSelect = () => {
    setActiveRadioStation(station);
    router.push(`/radio/${encodeURIComponent(station.id)}`);
  };

  if (spotify) {
    return (
        <div 
          onClick={handleSelect}
          className="group p-4 rounded-lg bg-[#1a1a1a] hover:bg-[#282828] transition-all duration-300 relative flex flex-col gap-4 shadow-xl"
        >
            <div className="relative aspect-square rounded-md overflow-hidden bg-[#242424] shadow-2xl flex items-center justify-center ">
                {station.favicon ? (
                    <img 
                      src={station.favicon} 
                      alt="" 
                      className="w-full h-full object-contain drop-shadow-2xl" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
                    />
                ) : null}
                <Mic className="w-12 h-12 text-white/5 hidden" />
                
                {/* Play Button Overlay */}
                <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95">
                    <Play className="w-6 h-6 fill-current ml-1" />
                </div>
            </div>
            <div className="flex flex-col min-w-0">
                <h4 className="text-white text-[15px] font-bold truncate tracking-tight">{station.name}</h4>
                <p className="text-[#b3b3b3] text-[13px] font-medium truncate mt-1">{station.country || 'Global'}</p>
            </div>
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/40 text-[8px] font-black text-white/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                {station.codec}
            </div>
        </div>
    );
  }

  const sizeClass = compact ? "w-24 sm:w-28 md:w-32 lg:w-36" : "w-36 sm:w-44 md:w-48";
  const paddingClass = compact ? "p-3" : "p-6";

  return (
    <div className={inGrid ? "w-full" : `flex-shrink-0 ${sizeClass}`}>
      <button
        onClick={handleSelect}
        className={`group relative w-full aspect-square rounded-xl md:rounded-2xl bg-white/5 border border-white/5 overflow-hidden transition-all hover:border-orange-500/50 hover:bg-white/10 active:scale-95 duration-300 shadow-lg`}
      >
        <div className={`absolute inset-0 flex items-center justify-center ${paddingClass}`}>
          {station.favicon ? (
            <img 
              src={station.favicon} 
              alt={station.name}
              className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
              onError={(e) => { 
                const target = e.currentTarget;
                target.src = ""; 
                const parent = target.parentElement;
                if (parent) parent.innerHTML = '<div class="text-white/5"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic-2 opacity-20"><path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="18" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div>'; 
              }}
              loading="lazy"
            />
          ) : (
            <Mic className={`${compact ? 'w-6 h-6' : 'w-10 h-10'} text-white/5`} />
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 md:p-3">
          <p className="text-[8px] font-mono text-orange-500 font-bold uppercase tracking-wider mb-0.5 md:mb-1">{station.codec}</p>
          <p className="text-[10px] md:text-xs font-body text-white font-bold truncate tracking-tight">{station.name}</p>
        </div>

        <div className={`absolute top-2 right-2 ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-orange-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 shadow-glow`}>
          <Play className={`${compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} fill-current ml-0.5`} />
        </div>
      </button>
      
      <div className="mt-2 px-1">
        <p className={`${compact ? 'text-[9px] md:text-[10px]' : 'text-[11px] md:text-[12px]'} text-white/40 font-body font-medium truncate group-hover:text-white transition-colors`}>
          {station.name}
        </p>
      </div>
    </div>
  );
}
