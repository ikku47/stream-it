'use client';
import { useSearchParams } from "next/navigation";
import DetailScreen from "@/components/DetailScreen";
import PersonDetailScreen from "@/components/PersonDetailScreen";
import { Suspense } from "react";

function DetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "movie";

  if (!id) return null;

  if (type === 'person') {
    return <PersonDetailScreen id={id} />;
  }

  return <DetailScreen id={id} type={type} />;
}

export default function DetailsPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-8 pt-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/50 text-sm font-semibold tracking-widest uppercase">Loading Details...</p>
        </div>
      </div>
    }>
      <DetailsContent />
    </Suspense>
  );
}
