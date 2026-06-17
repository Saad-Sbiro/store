import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import clsx from 'clsx';

export function TooltipProvider({ children, delayDuration = 180 }) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function Tooltip({ children, ...props }) {
  return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
}

export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ children, className = '', sideOffset = 8, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={clsx(
          'tooltip-content z-[160] rounded-md border border-white/10 bg-ink-900 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xl',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-ink-900" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
