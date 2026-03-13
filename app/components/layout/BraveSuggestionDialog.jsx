'use client';

import { useEffect, useState } from "react";
import { X, ShieldAlert, Smartphone } from "lucide-react";
import useStore from "@/store/useStore";

export default function BraveSuggestionDialog() {
  const { braveSuggestionDismissed, dismissBraveSuggestion } = useStore();
  const [shouldShow, setShouldShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let timeoutId;
    let mounted = true;

    // Check if we should show the dialog
    const checkBrowser = async () => {
      if (braveSuggestionDismissed) return;

      // Basic mobile check
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (mounted) setIsMobile(mobile);

      // Check if Brave
      let isBrave = false;
      if (navigator.brave && await navigator.brave.isBrave()) {
        isBrave = true;
      }

      if (!mounted) return;

      // If not Brave and not dismissed, show it
      if (!isBrave && !useStore.getState().braveSuggestionDismissed) {
        // slight delay so it doesn't pop instantly
        timeoutId = setTimeout(() => {
          if (mounted) setShouldShow(true);
        }, 2500);
      }
    };

    // Wait for hydration before running the logic if possible, or just run it and let the cleanup handle it.
    checkBrowser();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [braveSuggestionDismissed]);

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] md:w-96 w-[calc(100vw-32px)] bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-5 animate-fade-in">
      <button 
        onClick={() => {
          setShouldShow(false);
          dismissBraveSuggestion();
        }}
        className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-white font-medium text-[15px] mb-1">Ad-Free Experience</h3>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            We highly recommend using <strong>Brave Browser</strong> to block all video provider ads and popups for the best viewing experience on JoyFlix.
          </p>
          
          <div className="flex flex-col gap-2">
            <a 
              href="https://brave.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => {
                setShouldShow(false);
                dismissBraveSuggestion();
              }}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg text-center hover:bg-white/90 transition-colors"
            >
              Download Brave
            </a>
          </div>
          
          {isMobile && (
            <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
              <Smartphone className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
              <p className="text-white/50 text-xs">
                Once in Brave, tap the menu and select <strong>"Add to Home screen"</strong> to use JoyFlix like a native app!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
