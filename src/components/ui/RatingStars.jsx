// ─────────────────────────────────────────────
// FILE: src/components/ui/RatingStars.jsx
// ─────────────────────────────────────────────

import { Star } from 'lucide-react';
import clsx from 'clsx';

export default function RatingStars({ rating, reviewCount, size = 'sm', showCount = true }) {
  const starSize = size === 'sm' ? 12 : 16;
  const fullStars = Math.floor(rating);
  const hasHalf   = rating - fullStars >= 0.5;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < fullStars;
          const half   = !filled && hasHalf && i === fullStars;
          return (
            <span key={i} className="relative inline-flex">
              <Star
                size={starSize}
                className="text-surface-200"
                fill="currentColor"
              />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? '50%' : '100%' }}
                >
                  <Star
                    size={starSize}
                    className="text-brand-500"
                    fill="currentColor"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>

      {showCount && reviewCount != null && (
        <span className={clsx('text-ink-400 leading-none', size === 'sm' ? 'text-[12px]' : 'text-sm')}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
