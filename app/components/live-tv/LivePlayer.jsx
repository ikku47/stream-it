'use client';

import { useEffect, useRef, useState } from "react";
import { X, Maximize, Volume2, VolumeX, Pause, Play, AlertCircle, Info, ExternalLink, Tv } from "lucide-react";

export default function LivePlayer({ channel, onClose }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hlsSupported, setHlsSupported] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel.url) return;

    setLoading(true);
    setError(false);

    // Native HLS support (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url;
      setHlsSupported(true);
      video.play().catch(() => setIsPlaying(false));
    } 
    // Chrome/Firefox need Hls.js
    else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = () => {
        if (window.Hls.isSupported()) {
          const hls = new window.Hls();
          hls.loadSource(channel.url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => setIsPlaying(false));
            setLoading(false);
          });
          hls.on(window.Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              setError(true);
              setLoading(false);
            }
          });
          setHlsSupported(true);
        } else {
          setError(true);
          setLoading(false);
        }
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) document.body.removeChild(script);
      };
    }
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
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in p-4 md:p-12 overflow-hidden items-center justify-center">
      {/* Container */}
      <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 flex flex-col">
        
        {/* Top Header */}
        <div className={`absolute top-0 left-0 right-0 p-6 z-10 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center p-2">
                {channel.logo ? (
                  <img src={channel.logo} alt="" className="w-full h-full object-contain" />
                ) : (
                  <Tv className="w-5 h-5 text-white/40" />
                )}
              </div>
              <div>
                <h3 className="text-white font-medium font-body truncate max-w-[200px] md:max-w-md">{channel.name}</h3>
                <p className="text-white/40 text-xs font-mono uppercase tracking-wider">{channel.group.split(';')[0]}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onPlaying={() => setLoading(false)}
          onWaiting={() => setLoading(true)}
          autoPlay
          muted={isMuted}
        />

        {/* Loading Overlay */}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--color-brand)]/20 border-t-[var(--color-brand)] rounded-full animate-spin" />
              <p className="text-white/50 text-sm font-body animate-pulse">Buffering live stream...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h4 className="text-white text-xl font-display mb-2">Stream Unavailable</h4>
                <p className="text-white/40 text-sm font-body">This channel's broadcast is currently offline or the stream link has expired.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-white text-black rounded-full font-body text-sm font-bold hover:bg-white/80 transition-all"
                >
                  Reload App
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-2 bg-white/10 text-white rounded-full font-body text-sm hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 p-8 z-10 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={togglePlay}
                className="text-white hover:text-[var(--color-brand)] transition-colors transform active:scale-90"
              >
                {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
              </button>
              
              <div className="flex items-center gap-3 group">
                <button 
                  onClick={toggleMute}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <div className="w-0 group-hover:w-24 transition-all duration-500 overflow-hidden h-1.5 bg-white/10 rounded-full relative">
                  <div className={`absolute inset-0 bg-white/40 rounded-full ${isMuted ? 'w-0' : 'w-full'}`} />
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-red-600 rounded-lg animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Info */}
      <div className="mt-8 text-center text-white/20 text-xs font-body max-w-sm mx-auto">
        <p>IPTV streams are provided by open-source communities. Playback stability depends on your connection and the broadcaster's server.</p>
        <div className="flex items-center justify-center gap-2 mt-2 hover:text-white/40 transition-colors cursor-help group">
          <Info className="w-3 h-3" />
          <span>Stream ID: {channel.id || 'N/A'}</span>
          <a href={channel.url} target="_blank" rel="noreferrer" className="ml-2 flex items-center gap-1">
             Source <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
