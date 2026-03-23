'use client';
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Cake, MapPin, Star } from "lucide-react";
import { img, normalizeItem } from "../lib/tmdb";
import { usePersonDetails } from "../hooks/useTMDB";
import MediaCard from "./cards/MediaCard";

export default function PersonDetailScreen({ id }) {
  const router = useRouter();
  const { person, credits, loading } = usePersonDetails(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-8 pt-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/50 text-sm font-semibold tracking-widest uppercase">Fetching Artist info...</p>
        </div>
      </div>
    );
  }

  if (!person) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-white w-full pb-20 pt-20 lg:pt-24 px-6 lg:px-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold text-sm">Back</span>
      </button>

      <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start mb-16 animate-fade-up">
        {/* Profile Image */}
        <div className="w-full md:w-[300px] lg:w-[360px] flex-shrink-0">
          <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/5 relative bg-[var(--color-surface-3)]">
            {person.profile_path ? (
              <img
                src={img(person.profile_path, "h632")}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5">
                <User className="w-20 h-20 text-white/10" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl mb-6 tracking-wide drop-shadow-2xl">{person.name}</h1>

          <div className="flex flex-wrap gap-6 mb-8 text-sm font-medium text-white/50">
            {person.birthday && (
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4" />
                <span> Born {new Date(person.birthday).toLocaleDateString()} ({new Date().getFullYear() - new Date(person.birthday).getFullYear()} yrs)</span>
              </div>
            )}
            {person.place_of_birth && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span> {person.place_of_birth}</span>
              </div>
            )}
            {person.known_for_department && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span> {person.known_for_department}</span>
              </div>
            )}
          </div>

          <h3 className="text-xl font-display font-bold mb-4 tracking-wide">Biography</h3>
          <p className="text-white/60 text-base lg:text-lg leading-relaxed font-body max-w-4xl line-clamp-[10]">
            {person.biography || "No biography available for this artist."}
          </p>
        </div>
      </div>

      {/* Credits Section */}
      <div className="animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
        <h2 className="text-2xl lg:text-4xl font-display font-bold mb-8 tracking-wide flex items-center gap-3">
          Known For
          <span className="text-white/30 text-sm font-mono pt-1">({credits.length} works)</span>
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
          {credits.map(c => (
            <MediaCard key={`${c.media_type}_${c.id}`} item={normalizeItem(c)} inGrid />
          ))}
        </div>
      </div>
    </div>
  );
}
