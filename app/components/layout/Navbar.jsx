'use client';
// components/layout/Navbar.jsx
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Film, Clapperboard, Menu, Server } from "lucide-react";
import useStore from "@/store/useStore";
import { useGenreMap } from "@/hooks/useTMDB";
import { PROVIDERS } from "@/lib/providers";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/tv" },
  { label: "Trending", href: "/trending" },
  { label: "Categories", href: "/categories" },
  { label: "Languages", href: "/languages" },
  { label: "Years", href: "/years" },
];

export default function Navbar() {
  useGenreMap(); // preload genre map globally
  const router = useRouter();
  const { searchOpen, setSearchOpen, setSearchQuery, searchQuery, provider, setProvider } = useStore();
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

  return (
    <nav
      className={[
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-[64px] transition-all duration-300",
        scrolled ? "glass  bg-gradient-to-b from-black/80 to-transparent" : "bg-gradient-to-b from-black/80 to-transparent",
      ].join(" ")}
    >
      {/* Logo */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 font-display text-2xl text-white tracking-wider hover:opacity-80 transition-opacity flex-shrink-0"
        aria-label="JoyFlix Home"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--color-brand)" }}
        >
          <Clapperboard className="w-4 h-4 text-white" />
        </div>
        Joy<span style={{ color: "var(--color-brand)" }}>Flix</span>
      </button>

      {/* Nav links — hidden on mobile */}
      <ul className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map((l) => {
          const active = router.pathname === l.href;
          return (
            <li key={l.href}>
              <button
                onClick={() => router.push(l.href)}
                className={[
                  "px-4 py-2 rounded-lg text-[14px] font-medium font-body transition-all duration-200",
                  active
                    ? "text-white bg-white/10"
                    : "text-white/55 hover:text-white hover:bg-white/6",
                ].join(" ")}
              >
                {l.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Right: search + provider */}
      <div className="flex items-center gap-3">
        {/* Provider switch (Desktop) */}
        <div className="hidden md:flex items-center gap-2 mr-2">
          <Server className="w-4 h-4 text-white/40" />
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-transparent text-sm text-white/70 font-body outline-none appearance-none cursor-pointer hover:text-white transition-colors"
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#111] text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div
            className={[
              "flex items-center gap-2 overflow-hidden transition-all duration-300 rounded-xl",
              searchOpen
                ? "w-[220px] md:w-[280px] px-3 py-2"
                : "w-0 px-0",
            ].join(" ")}
            style={searchOpen ? { background: "var(--color-surface-3)", border: "1px solid var(--color-border)" } : {}}
          >
            <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              placeholder="Search movies, shows…"
              className="bg-transparent text-sm text-[var(--color-text)] placeholder-white/30 outline-none w-full font-body"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
              </button>
            )}
          </div>
          <button
            onClick={toggleSearch}
            aria-label="Toggle search"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/8 transition-all"
          >
            {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden w-9 h-9 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Full Screen Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col pt-24 px-8 animate-fade-in md:hidden">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col gap-8 mt-10">
            {NAV_LINKS.map((l, i) => {
              const active = router.pathname === l.href;
              return (
                <button
                  key={l.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(l.href);
                  }}
                  className={[
                    "text-4xl font-display tracking-wide text-left transition-all duration-300 transform",
                    active ? "text-[var(--color-brand)] translate-x-4" : "text-white/70 hover:text-white hover:translate-x-2"
                  ].join(" ")}
                  style={{ animationFillMode: "both", animationDelay: `${i * 50}ms` }}
                >
                  {l.label}
                </button>
              );
            })}
            
            <div
              className="mt-8 flex items-center gap-3 text-white/70 animate-fade-in"
              style={{ animationFillMode: "both", animationDelay: `${NAV_LINKS.length * 50}ms` }}
            >
              <Server className="w-6 h-6" />
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="bg-transparent text-2xl font-display outline-none appearance-none cursor-pointer hover:text-white transition-colors flex-1"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#111] text-white text-base font-body">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
