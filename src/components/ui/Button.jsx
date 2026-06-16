// ─────────────────────────────────────────────
// FILE: src/components/ui/Button.jsx
// ─────────────────────────────────────────────

import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Button variants:
 *  - primary   → brand-500 fill
 *  - secondary → outlined brand-500
 *  - ghost     → text only, subtle hover
 *  - danger    → feedback-danger fill
 */
const variants = {
  primary: [
    'bg-brand-500 text-white',
    'hover:bg-brand-600 active:bg-brand-700',
    'shadow-sm hover:shadow-md',
    'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
  ],
  secondary: [
    'bg-transparent text-brand-500 border border-brand-500',
    'hover:bg-brand-50 active:bg-brand-100',
    'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
  ],
  ghost: [
    'bg-transparent text-ink-600',
    'hover:bg-surface-100 hover:text-ink-900 active:bg-surface-200',
    'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
  ],
  danger: [
    'bg-feedback-danger text-white',
    'hover:brightness-90 active:brightness-75',
    'focus-visible:ring-2 focus-visible:ring-feedback-danger focus-visible:ring-offset-2',
  ],
};

const sizes = {
  sm:  'h-9  px-4  text-caption gap-1.5',
  md:  'h-11 px-5  text-btn    gap-2',
  lg:  'h-12 px-6  text-btn    gap-2',
  xl:  'h-[52px] px-8 text-btn gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  onClick,
  type = 'button',
  id,
  ...rest
}) {
  return (
    <motion.button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.15 }}
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center',
        'font-medium rounded-btn',
        'transition-all duration-200 ease-out',
        'select-none whitespace-nowrap',
        // Variant
        variants[variant],
        // Size
        sizes[size],
        // Modifiers
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      {...rest}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}
