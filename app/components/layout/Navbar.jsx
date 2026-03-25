'use client';
// components/layout/Navbar.jsx
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, X, Film, Clapperboard, Menu, Heart,
  Home, Tv, Radio, TrendingUp, LayoutGrid, Languages, Calendar, Music2
} from "lucide-react";
import useStore from "@/store/useStore";
import { useGenreMap } from "@/hooks/useTMDB";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "TV Shows", href: "/tv", icon: Tv },
  { label: "Live TV", href: "/live-tv", icon: Radio },
  { label: "Music", href: "/music", icon: Music2 },
  { label: "Categories", href: "/categories", icon: LayoutGrid },
  { label: "Languages", href: "/languages", icon: Languages },
  { label: "Years", href: "/years", icon: Calendar },
  { label: "Favourites", href: "/favourites", icon: Heart },
];

export default function Navbar() {
  useGenreMap(); // preload genre map globally
  const router = useRouter();
  const pathname = usePathname();
  const { searchOpen, setSearchOpen, setSearchQuery, searchQuery } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleSearch = () => {
    const next = !searchOpen;
    setSearchOpen(next);
    if (next) setTimeout(() => inputRef.current?.focus(), 80);
    else { setSearchQuery(""); router.pathname !== "/search" && null; }
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length >= 2 && router.pathname !== "/search") {
      router.push("/search");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") toggleSearch();
  };

  if (pathname === "/live-tv/watch") return null;

  return (
    <>
      {/* Sidebar (Desktop) */}
      <aside
        className={[
          "fixed top-0 left-0 bottom-0 z-50 hidden md:flex flex-col items-center py-8 w-[80px] bg-black/40 backdrop-blur-xl border-right border-white/5",
          "transition-all duration-300 shadow-2xl shadow-black",
        ].join(" ")}
      >
        {/* Logo Icon Only */}
        <button
          onClick={() => router.push("/")}
          className="w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg shadow-brand/20 mb-12"
          style={{ background: "var(--color-brand)" }}
          aria-label="Home"
        >
          <Clapperboard className="w-6 h-6 text-white" />
        </button>

        {/* Links */}
        <ul className="flex flex-col items-center gap-6 w-full px-2">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <li key={l.href} className="w-full flex justify-center cursor-pointer">
                <button
                  onClick={() => router.push(l.href)}
                  title={l.label}
                  className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 relative group",
                    active
                      ? "text-white bg-white/10"
                      : "text-white/30 hover:text-white hover:bg-white/5",
                  ].join(" ")}
                >
                  <Icon className="w-5 h-5" />
                  {/* Tooltip on hover */}
                  <span className="absolute left-full ml-4 px-2 py-1 rounded bg-white/10 backdrop-blur-md text-white text-[11px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                    {l.label}
                  </span>
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--color-brand)] rounded-r-full shadow-glow" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col items-center gap-4">
          <button
            onClick={toggleSearch}
            aria-label="Toggle search"
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Floating Search Bar (Desktop) When Active */}
      {searchOpen && (
        <div className="fixed top-8 left-[100px] right-8 z-[60] animate-fade-in hidden md:block">
          <div className="glass max-w-2xl mx-auto rounded-2xl flex items-center gap-4 px-6 py-4 shadow-2xl shadow-black/80">
            <Search className="w-5 h-5 text-white/20" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onKeyDown={handleKeyDown}
              onChange={handleSearch}
              autoFocus
              placeholder="Search for movies, actors, channels..."
              className="bg-transparent flex-1 text-lg text-white font-medium outline-none placeholder-white/10"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Top Navbar (Stays as bar on mobile) */}
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 md:hidden transition-all duration-300",
          scrolled ? "glass bg-[#090810]/70" : "bg-gradient-to-b from-black/80 to-transparent",
        ].join(" ")}
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 font-display text-2xl text-white tracking-wider"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-brand)" }}
          >
            <Clapperboard className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl">Joy<span className="text-[var(--color-brand)]">Flix</span></span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSearch}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar (Menu Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col p-8 md:hidden">
          <div className="flex items-center justify-between mb-12">
            <span className="font-display text-3xl text-white">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-12 h-12 flex items-center justify-center text-white/50 bg-white/5 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-4">
            {NAV_LINKS.map((l, i) => {
              const active = pathname === l.href;
              const Icon = l.icon;
              return (
                <button
                  key={l.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(l.href);
                  }}
                  className={[
                    "flex items-center gap-5 text-left transition-all duration-300 py-2",
                    active ? "text-[var(--color-brand)]" : "text-white/70"
                  ].join(" ")}
                >
                  <div className={["w-10 h-10 rounded-xl flex items-center justify-center", active ? "bg-[var(--color-brand)] text-white" : "bg-white/5 text-white/40"].join(" ")}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-display tracking-wide">{l.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
