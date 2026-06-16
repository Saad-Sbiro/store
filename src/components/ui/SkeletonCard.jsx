// ─────────────────────────────────────────────
// FILE: src/components/ui/SkeletonCard.jsx
// ─────────────────────────────────────────────

export default function SkeletonCard() {
  return (
    <div className="rounded-card overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-product bg-surface-100" />

      {/* Content */}
      <div className="pt-3 space-y-2">
        <div className="h-3 w-16 rounded-pill bg-surface-200" />
        <div className="h-4 w-3/4 rounded bg-surface-200" />
        <div className="h-3 w-24 rounded bg-surface-200" />
        <div className="h-5 w-20 rounded bg-surface-200 mt-1" />
      </div>
    </div>
  );
}
