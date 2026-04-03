'use client';
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, Maximize2, VolumeX, Heart, Mic2, Minimize2, Globe, Music, Radio, Sparkles } from "lucide-react";
import useStore from "@/store/useStore";
import { useRouter } from "next/navigation";

export default function SpotifyPlayerBar() {
    const { activeRadioStation, favourites, toggleFavourite } = useStore();
    const router = useRouter();
    const audioRef = useRef(null);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const containerRef = useRef(null);
    
    // Audio Context Refs to prevent "MediaElement already connected" errors
    const audioCtxRef = useRef(null);
    const analyzerRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const prevStationIdRef = useRef(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [isFav, setIsFav] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Initial load & Fav check
    useEffect(() => {
        if (!activeRadioStation) {
            setIsPlaying(false);
            prevStationIdRef.current = null;
            return;
        }

        setIsFav(favourites.some(f => f.id === activeRadioStation.id));
        
        // Only update source if the station actually changed
        if (prevStationIdRef.current === activeRadioStation.id) return;
        
        const audio = audioRef.current;
        if (audio) {
            audio.src = activeRadioStation.url;
            audio.crossOrigin = "anonymous";
            audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            prevStationIdRef.current = activeRadioStation.id;
        }
    }, [activeRadioStation, favourites]);

    // Track mouse position for interactive effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isExpanded) {
                setMousePos({ x: e.clientX, y: e.clientY });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isExpanded]);

    // Enhanced Visualizer Logic - Fixes "AudioContext already connected" error
    useEffect(() => {
        if (isExpanded && isPlaying && audioRef.current) {
            // Lazy-init Audio Context and Source Node
            if (!audioCtxRef.current) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtxRef.current = new AudioContext();
                analyzerRef.current = audioCtxRef.current.createAnalyser();
                analyzerRef.current.fftSize = 512;
                
                sourceNodeRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
                sourceNodeRef.current.connect(analyzerRef.current);
                analyzerRef.current.connect(audioCtxRef.current.destination);
            }

            // Ensure Context is running
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }

            const analyzer = analyzerRef.current;
            const bufferLength = analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const draw = () => {
                const W = canvas.width = window.innerWidth;
                const H = canvas.height = window.innerHeight;
                
                animationRef.current = requestAnimationFrame(draw);
                analyzer.getByteFrequencyData(dataArray);
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.fillRect(0, 0, W, H);
                
                const centerX = W / 2;
                const centerY = H / 2;
                const radius = Math.min(W, H) / 5;
                
                for (let ring = 0; ring < 3; ring++) {
                    const ringRadius = radius + ring * 40;
                    for (let i = 0; i < bufferLength; i += 2) {
                        const barHeight = (dataArray[i] / 255) * radius * (0.7 - ring * 0.15);
                        const angle = (i * 2 * Math.PI) / bufferLength;
                        const x1 = centerX + Math.cos(angle) * ringRadius;
                        const y1 = centerY + Math.sin(angle) * ringRadius;
                        const x2 = centerX + Math.cos(angle) * (ringRadius + barHeight);
                        const y2 = centerY + Math.sin(angle) * (ringRadius + barHeight);
                        
                        const hue = 30 + (i / bufferLength) * 60 + ring * 15;
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.strokeStyle = `hsla(${hue}, 85%, 55%, ${0.5 - ring * 0.1})`;
                        ctx.lineWidth = 2.5 + ring * 0.5;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.stroke();
                    }
                }

                // Interactive center glow
                const avgFrequency = dataArray.reduce((num, total) => num + total) / bufferLength;
                const glowSize = 20 + (avgFrequency / 255) * 80;
                const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize);
                glowGradient.addColorStop(0, 'rgba(255, 165, 0, 0.4)');
                glowGradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
                ctx.fillStyle = glowGradient;
                ctx.fillRect(centerX - glowSize, centerY - glowSize, glowSize * 2, glowSize * 2);
            };
            draw();
            
            return () => {
                cancelAnimationFrame(animationRef.current);
            };
        }
    }, [isExpanded, isPlaying]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        if (newVolume > 0) setIsMuted(false);
    };

    const handleMute = () => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? volume : 0;
        }
        setIsMuted(!isMuted);
    };

    if (!activeRadioStation) return null;

    return (
        <>
            {/* FULLSCREEN EXPANDED VIEW */}
            <div className={`fixed inset-0 z-[300] bg-gradient-to-br from-slate-950 via-slate-900 to-black transition-all duration-700 ease-out overflow-hidden ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <canvas ref={canvasRef} className="absolute inset-0 opacity-50 mix-blend-screen" />
                
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-8 right-8 z-[310] p-3 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-110 active:scale-95 group"
                >
                    <Minimize2 className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div ref={containerRef} className="relative z-[305] h-full flex flex-col items-center justify-center p-8 text-center max-w-5xl mx-auto">
                    
                    <div className="relative mb-16 group perspective">
                        <div className="absolute -inset-8 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl overflow-hidden flex items-center justify-center p-12 backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                            {activeRadioStation.favicon ? (
                                <img src={activeRadioStation.favicon} alt="" className="w-full h-full object-contain drop-shadow-2xl animate-float relative z-10" />
                            ) : (
                                <Music className="w-40 h-40 text-orange-400/30 relative z-10" />
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-6 mb-12">
                        <div className="flex items-center justify-center gap-2">
                           <Globe className="w-5 h-5 text-orange-500 animate-bounce" style={{ animationDelay: '0s' }} />
                           <p className="text-orange-500 font-bold uppercase tracking-widest text-xs">{activeRadioStation.country || 'Global Signal'}</p>
                           <Sparkles className="w-4 h-4 text-orange-500/60" />
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none pr-4 drop-shadow-lg">
                            {activeRadioStation.name}
                        </h1>
                        <p className="text-white/50 text-lg md:text-xl font-medium tracking-tight">
                            Broadcasting via <span className="text-orange-400/80 font-semibold">{activeRadioStation.codec}</span> • <span className="text-orange-400/80 font-semibold">{activeRadioStation.bitrate}kbps</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-8 mt-16">
                        <button 
                           onClick={togglePlay}
                           className="group relative w-28 h-28 rounded-full bg-gradient-to-br from-white to-orange-50 text-black flex items-center justify-center hover:shadow-2xl active:scale-95 transition-all duration-200 shadow-xl hover:scale-110"
                        >
                           <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/0 via-orange-400/30 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                           {isPlaying ? (
                               <Pause className="w-12 h-12 fill-current relative z-10" />
                           ) : (
                               <Play className="w-12 h-12 fill-current ml-1 relative z-10" />
                           )}
                        </button>
                    </div>
                </div>
            </div>

            {/* PERSISTENT BOTTOM BAR */}
            <div className={`fixed bottom-0 left-0 md:left-[80px] right-0 z-[200] h-24 md:h-20 bg-gradient-to-t from-black via-black/90 to-black/70 backdrop-blur-2xl border-t border-white/10 px-4 md:px-8 flex items-center justify-between transition-all duration-500 ease-out shadow-2xl ${isExpanded ? 'translate-y-full' : 'translate-y-0'}`}>
                
                <audio 
                    ref={audioRef} 
                    onPlay={() => setIsPlaying(true)} 
                    onPause={() => setIsPlaying(false)}
                />

                <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group" onClick={() => setIsExpanded(true)}>
                    <div className="relative w-14 h-14 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex-shrink-0 overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/20">
                        {activeRadioStation.favicon ? (
                            <img src={activeRadioStation.favicon} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                            <Music className="w-6 h-6 text-white/20 m-auto" />
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                            <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-bold truncate group-hover:text-orange-400 transition-colors">
                            {activeRadioStation.name}
                        </div>
                        <div className="text-white/50 text-xs font-medium truncate uppercase tracking-widest">
                            {activeRadioStation.country || 'Live'} • {activeRadioStation.codec}
                        </div>
                    </div>

                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavourite(activeRadioStation);
                        }}
                        className={`ml-3 p-2 rounded-lg transition-all duration-300 ${isFav ? 'bg-orange-500/20 text-orange-400' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Heart className={`w-5 h-5 transition-all ${isFav ? 'fill-current scale-110' : ''}`} />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center flex-1">
                    <button 
                        onClick={togglePlay}
                        className="group relative w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-120 active:scale-90 transition-all duration-200 shadow-lg hover:shadow-2xl hover:shadow-white/30"
                    >
                        <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 -z-10" />
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                </div>

                <div className="flex items-center justify-end gap-6 flex-1 min-w-0">
                    <div className="flex items-center gap-3 group/vol w-40 md:w-48">
                        <button 
                            onClick={handleMute}
                            className="text-white/40 hover:text-white transition-all duration-300 flex-shrink-0 p-2 hover:bg-white/5 rounded-lg"
                        >
                            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer group-hover/vol:h-2 transition-all duration-300">
                            <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-100"
                                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                            />
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="text-white/40 hover:text-white transition-all duration-300 p-2 hover:bg-white/5 rounded-lg"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .animate-bounce { animation: bounce 2s infinite; }
                .perspective { perspective: 1000px; }
                input[type="range"]::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, #ff9500, #fbbf24); cursor: pointer; box-shadow: 0 0 8px rgba(255, 149, 0, 0.5); transition: all 0.2s; }
                input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.3); box-shadow: 0 0 16px rgba(255, 149, 0, 0.8); }
                input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, #ff9500, #fbbf24); cursor: pointer; border: none; box-shadow: 0 0 8px rgba(255, 149, 0, 0.5); transition: all 0.2s; }
                input[type="range"]::-moz-range-thumb:hover { transform: scale(1.3); box-shadow: 0 0 16px rgba(255, 149, 0, 0.8); }
            `}</style>
        </>
    );
}