// ─────────────────────────────────────────────
// FILE: src/components/ui/Toast.jsx
// ─────────────────────────────────────────────
// Animated toast notification stack — renders in a portal at
// bottom-right (desktop) / bottom-center (mobile).

import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';
import { useToastStore } from '../../store/useToastStore';

// ─── Variant config ───────────────────────────
const VARIANTS = {
  default: {
    icon:      Info,
    iconClass: 'text-brand-500',
    bar:       'bg-brand-500',
  },
  success: {
    icon:      CheckCircle,
    iconClass: 'text-feedback-success',
    bar:       'bg-feedback-success',
  },
  error: {
    icon:      AlertCircle,
    iconClass: 'text-feedback-danger',
    bar:       'bg-feedback-danger',
  },
  warning: {
    icon:      AlertTriangle,
    iconClass: 'text-feedback-warning',
    bar:       'bg-feedback-warning',
  },
};

// ─── Individual toast card ────────────────────
function ToastCard({ id, title, description, variant = 'default' }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const { icon: Icon, iconClass, bar } = VARIANTS[variant] ?? VARIANTS.default;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        'relative w-full max-w-sm overflow-hidden',
        'bg-white rounded-panel shadow-xl border border-surface-200',
        'flex items-start gap-3 px-4 py-4'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Accent bar — left edge */}
      <span className={clsx('absolute left-0 top-0 bottom-0 w-[3px] rounded-l-panel', bar)} />

      {/* Icon */}
      <Icon size={18} className={clsx('shrink-0 mt-0.5', iconClass)} />

      {/* Text */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-[14px] font-semibold text-ink-900 leading-snug">{title}</p>
        )}
        {description && (
          <p className="text-[13px] text-ink-600 mt-0.5 leading-snug">{description}</p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => dismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-ink-400 hover:text-ink-900 hover:bg-surface-100 transition-all duration-150 -mt-0.5"
      >
        <X size={13} />
      </button>
    </motion.div>
  );
}

// ─── Toast container (renders all active toasts) ──
export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-label="Notifications"
      className={clsx(
        'fixed z-[200]',
        'bottom-4 right-4 sm:bottom-6 sm:right-6',
        'flex flex-col-reverse gap-2',
        'w-[calc(100vw-2rem)] sm:w-auto sm:max-w-sm'
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard key={t.id} {...t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
