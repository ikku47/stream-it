// components/cards/SkeletonCard.jsx
export default function SkeletonCard({ inGrid = false }) {
  return (
    <div
      className={[
        "flex-shrink-0 rounded-[12px] overflow-hidden bg-[var(--color-surface-2)]",
        inGrid ? "w-full" : "w-36 sm:w-40 md:w-44",
      ].join(" ")}
    >
      <div className="skeleton" style={{ aspectRatio: "2/3" }} />
      <div className="px-2.5 py-2 space-y-1.5">
        <div className="skeleton h-3 w-4/5 rounded-md" />
        <div className="skeleton h-2.5 w-1/3 rounded-md" />
      </div>
    </div>
  );
}
