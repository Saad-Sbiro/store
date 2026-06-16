// ─────────────────────────────────────────────
// FILE: src/components/ui/Badge.jsx
// ─────────────────────────────────────────────

import clsx from 'clsx';

const badgeStyles = {
  'Best Seller': 'bg-brand-500 text-white',
  'New':         'bg-feedback-success text-white',
  'Sale':        'bg-feedback-danger text-white',
  'Low Stock':   'bg-feedback-warning text-white',
  default:       'bg-ink-900 text-white',
};

export default function Badge({ label, className }) {
  if (!label) return null;

  const style = badgeStyles[label] ?? badgeStyles.default;

  return (
    <span
      className={clsx(
        'inline-flex items-center',
        'px-2.5 py-1',
        'rounded-tag',
        'text-[11px] font-semibold uppercase tracking-wider',
        'leading-none',
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
