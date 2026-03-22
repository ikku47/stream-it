'use client';

import { useEffect, useRef, useState } from "react";
import { X, Maximize, Volume2, VolumeX, Pause, Play, AlertCircle, Info, ExternalLink, Tv, Server } from "lucide-react";

export default function LivePlayer({ channel, onClose }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hlsSupported, setHlsSupported] = useState(false);
  const hlsRef = useRef(null);
  
  const timerRef = useRef(null);

  const loadStream = () => {
    const video = videoRef.current;
    if (!video || !channel.url) return;

    // 1. Reset all states for the new channel
    setLoading(true);
    setError(false);
    setErrorDetails("");
    setIsPlaying(true);

    // 2. Cleanup previous playback session
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    video.pause();
    video.src = "";
    video.load();

    // 3. Initiate new playback
    // Native HLS support (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url;
      setHlsSupported(true);
      video.play().catch((e) => {
        setIsPlaying(false);
        if (video.src) {
          setError(true);
          setErrorDetails("Playback failed. This stream might be incompatible with your browser.");
        }
      });
    } 
    // Chrome/Firefox/Others need Hls.js
    else {
      const initHls = () => {
        if (!window.Hls) {
          setError(true);
          setErrorDetails("Streaming engine is currently unavailable.");
          return;
        }

        if (window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60,
            maxBufferLength: 30,
            manifestLoadingMaxRetry: 3,
          });
          hlsRef.current = hls;
          hls.loadSource(channel.url);
          hls.attachMedia(video);
          
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => setIsPlaying(false));
            setLoading(false);
          });

          hls.on(window.Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              setLoading(false);
              setError(true);
              switch (data.type) {
                case window.Hls.ErrorTypes.NETWORK_ERROR:
                  setErrorDetails("Network link interrupted. The stream may be offline.");
                  break;
                case window.Hls.ErrorTypes.MEDIA_ERROR:
                  setErrorDetails("Compatibility error: Failed to decode stream.");
                  hls.recoverMediaError();
                  break;
                default:
                  setErrorDetails("An unexpected player error occurred.");
                  hls.destroy();
                  break;
              }
            }
          });
          setHlsSupported(true);
        } else {
          setError(true);
          setErrorDetails("Your browser doesn't support live HLS streaming.");
          setLoading(false);
        }
      };

      if (window.Hls) {
        initHls();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = initHls;
        script.onerror = () => {
          setError(true);
          setErrorDetails("Critical: Streaming engine failed to load.");
          setLoading(false);
        };
        document.body.appendChild(script);
      }
    }
  };

  useEffect(() => {
    loadStream();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.url]);

  useEffect(() => {
    const handleActivity = () => {
      setShowControls(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowControls(false), 3000);
    };
    
    window.addEventListener('mousemove', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-fade-in overflow-hidden items-center justify-center cursor-none group/player" 
         style={{ cursor: showControls ? 'default' : 'none' }}>
      
      {/* Main Container */}
      <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
        
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          onPlaying={() => {
            setLoading(false);
            setError(false);
          }}
          onWaiting={() => setLoading(true)}
          onError={() => {
            if (channel.url && !error) {
              setLoading(false);
              setError(true);
              setErrorDetails("Native video playback error.");
            }
          }}
          autoPlay
          muted={isMuted}
          playsInline
        />

        {/* Cinematic Vignette Overlay */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${showControls ? 'opacity-100' : 'opacity-0'}`} 
             style={{ background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 100%), linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%), linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 30%)' }} />

        {/* Top Bar - Clock & Close */}
        <div className={`absolute top-0 left-0 right-0 p-8 flex items-start justify-between z-50 transition-all duration-500 transform ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex flex-col gap-1 items-start">
             <div className="text-white/40 text-[10px] font-mono uppercase tracking-[0.3em] bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-white/5">
                Streaming Protocol: {hlsSupported ? 'HLS.js' : 'Native'}
             </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Digital Clock */}
             <div className="hidden md:flex flex-col items-end mr-4">
                <div className="text-white font-mono text-2xl font-light tracking-tighter">
                   {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
                <div className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
                   {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
             </div>
             
             <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full glass-light hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-90 border border-white/10 shadow-2xl"
              >
                <X className="w-6 h-6" />
              </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                 <div className="w-20 h-20 border-2 border-[var(--color-brand)]/10 rounded-full animate-ping" />
                 <div className="absolute inset-0 w-20 h-20 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                 <p className="text-white text-lg font-display tracking-widest mb-1">CONNECTING</p>
                 <p className="text-white/40 text-xs font-mono uppercase tracking-widest">{channel.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-[60]">
            <div className="flex flex-col items-center gap-8 text-center max-w-md px-10 animate-fade-up">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h4 className="text-white text-3xl font-display mb-3 tracking-wide">SIGNAL LOST</h4>
                <p className="text-white/50 text-sm leading-relaxed font-body">
                  {errorDetails || "This channel is currently unavailable. The broadcast signal may have been interrupted."}
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={loadStream}
                  className="flex-1 px-8 py-4 bg-[var(--color-brand)] text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-brand/20 active:scale-95"
                >
                  RECONNECT
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 px-8 py-4 bg-white/5 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-all border border-white/10 active:scale-95"
                >
                  DISMISS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Left - Channel Info (Live TV Style) */}
        <div className={`absolute bottom-0 left-0 p-10 md:p-14 z-50 flex items-end gap-6 transition-all duration-700 transform ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
           <div className="relative group">
              <div className="absolute -inset-4 bg-[var(--color-brand)] rounded-3xl opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center p-6 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform">
                {channel.logo ? (
                  <img src={channel.logo} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                ) : (
                  <Tv className="w-12 h-12 text-white/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
              </div>
           </div>

           <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-red-600 rounded-md shadow-lg shadow-red-600/30 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">LIVE</span>
                 </div>
                 <span className="text-white/40 text-[10px] font-mono tracking-[0.2em] font-bold uppercase">{channel.group?.split(';')[0] || 'Unknown Group'}</span>
              </div>
              <h2 className="text-white text-4xl md:text-6xl font-display leading-none tracking-wide drop-shadow-2xl">
                 {channel.name}
              </h2>
              <div className="flex items-center gap-4 text-white/40 text-xs font-mono">
                 <span className="flex items-center gap-1.5"><Server className="w-3 h-3 text-[var(--color-brand)]" /> M3U8 STREAM</span>
                 <span className="w-1 h-1 rounded-full bg-white/20" />
                 <span>HD BROADCAST</span>
              </div>
           </div>
        </div>

        {/* Bottom Right - Playback Controls */}
        <div className={`absolute bottom-0 right-0 p-10 md:p-14 z-50 flex items-center gap-4 transition-all duration-700 transform ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
              <button 
                onClick={togglePlay}
                className="w-12 h-12 rounded-xl text-white hover:text-[var(--color-brand)] transition-all hover:bg-white/5 flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-1" />

              <div className="flex items-center gap-2 px-2 group/volume">
                <button 
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-xl text-white/70 hover:text-white transition-all flex items-center justify-center"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className="w-0 group-hover/volume:w-20 transition-all duration-500 overflow-hidden h-1 bg-white/10 rounded-full relative">
                  <div className={`absolute inset-0 bg-[var(--color-brand)] rounded-full ${isMuted ? 'w-0' : 'w-full'}`} />
                </div>
              </div>

              <div className="w-px h-6 bg-white/10 mx-1" />

              <button 
                onClick={toggleFullscreen}
                className="w-12 h-12 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
              >
                <Maximize className="w-5 h-5" />
              </button>
           </div>
        </div>

      </div>

      {/* Persistent Channel Badge (Visible even when controls are hidden) */}
      <div className={`fixed top-8 left-8 transition-opacity duration-1000 ${!showControls ? 'opacity-30' : 'opacity-0'} pointer-events-none`}>
         <div className="text-white/20 text-[10px] font-mono tracking-[0.5em] font-black uppercase">
            {channel.name}
         </div>
      </div>

    </div>
  );
}
