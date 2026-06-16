// ─────────────────────────────────────────────
// FILE: src/components/ui/AlertDialog.jsx
// ─────────────────────────────────────────────
// Animated Radix AlertDialog — drop-in replacement for window.confirm.
// Supports slide-in from 'bottom' | 'top' | 'center' (default).

import * as RadixAlertDialog from '@radix-ui/react-alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// ─── Motion variants by entry direction ───────
const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

function getContentVariants(from = 'center') {
  const origins = {
    bottom: { hidden: { opacity: 0, y: '60%',  scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: '30%', scale: 0.97 } },
    top:    { hidden: { opacity: 0, y: '-60%', scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: '-30%', scale: 0.97 } },
    center: { hidden: { opacity: 0, scale: 0.95, y: 8 },      visible: { opacity: 1, scale: 1, y: 0  }, exit: { opacity: 0, scale: 0.96, y: 4 } },
  };
  return origins[from] ?? origins.center;
}

const TRANSITION = { duration: 0.35, ease: [0.22, 1, 0.36, 1] };

// ─── Compound component exports ───────────────

export const AlertDialog = RadixAlertDialog.Root;
export const AlertDialogTrigger = RadixAlertDialog.Trigger;
export const AlertDialogCancel = RadixAlertDialog.Cancel;
export const AlertDialogAction = RadixAlertDialog.Action;

export function AlertDialogHeader({ children, className }) {
  return <div className={clsx('mb-5', className)}>{children}</div>;
}

export function AlertDialogFooter({ children, className }) {
  return (
    <div className={clsx('flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6', className)}>
      {children}
    </div>
  );
}

export function AlertDialogTitle({ children, className }) {
  return (
    <RadixAlertDialog.Title
      className={clsx('text-[18px] font-semibold text-ink-900 leading-snug', className)}
    >
      {children}
    </RadixAlertDialog.Title>
  );
}

export function AlertDialogDescription({ children, className }) {
  return (
    <RadixAlertDialog.Description
      className={clsx('mt-1.5 text-[14px] text-ink-600 leading-relaxed', className)}
    >
      {children}
    </RadixAlertDialog.Description>
  );
}

/**
 * AlertDialogContent
 * @prop {('bottom'|'top'|'center')} from - entry direction
 * @prop {'danger'|'default'} intent       - colours the action button
 */
export function AlertDialogContent({
  children,
  className,
  from = 'bottom',
  intent = 'default',
  open,          // for AnimatePresence controlled mode
}) {
  const contentVars = getContentVariants(from);

  return (
    <RadixAlertDialog.Portal>
      <AnimatePresence>
        {/* Overlay */}
        <RadixAlertDialog.Overlay asChild forceMount>
          <motion.div
            key="alert-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[150] bg-ink-900/50 backdrop-blur-[3px]"
          />
        </RadixAlertDialog.Overlay>

        {/* Content panel */}
        <RadixAlertDialog.Content asChild forceMount>
          <motion.div
            key="alert-content"
            variants={contentVars}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={TRANSITION}
            className={clsx(
              // Position
              'fixed z-[160]',
              from === 'bottom'
                ? 'bottom-0 left-0 right-0 sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2'
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              // Size
              'w-full sm:max-w-[420px]',
              // Style
              'bg-white shadow-xl outline-none',
              from === 'bottom'
                ? 'rounded-t-[20px] sm:rounded-modal px-6 pt-6 pb-8 sm:pb-6'
                : 'rounded-modal px-6 py-6',
              className
            )}
            // Swipe-down handle on mobile bottom sheet
          >
            {/* Drag handle — only for bottom sheet on mobile */}
            {from === 'bottom' && (
              <div className="w-10 h-1 bg-surface-200 rounded-pill mx-auto mb-6 sm:hidden" />
            )}
            {children}
          </motion.div>
        </RadixAlertDialog.Content>
      </AnimatePresence>
    </RadixAlertDialog.Portal>
  );
}

// ─── Styled action/cancel wrappers ────────────

export function AlertDialogConfirmAction({
  children,
  intent = 'danger',
  className,
  ...props
}) {
  return (
    <RadixAlertDialog.Action
      className={clsx(
        'inline-flex items-center justify-center h-11 px-5 rounded-btn',
        'text-[13px] font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        intent === 'danger'
          ? 'bg-feedback-danger text-white hover:brightness-90 focus-visible:ring-feedback-danger'
          : 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500',
        className
      )}
      {...props}
    >
      {children}
    </RadixAlertDialog.Action>
  );
}

export function AlertDialogCancelButton({ children, className, ...props }) {
  return (
    <RadixAlertDialog.Cancel
      className={clsx(
        'inline-flex items-center justify-center h-11 px-5 rounded-btn',
        'text-[13px] font-medium text-ink-600',
        'border border-surface-200 hover:bg-surface-100 hover:border-surface-300',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500',
        className
      )}
      {...props}
    >
      {children}
    </RadixAlertDialog.Cancel>
  );
}
