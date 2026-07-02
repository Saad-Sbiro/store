import * as PopoverPrimitive from '@radix-ui/react-popover';
import clsx from 'clsx';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

export function PopoverContent({ children, className = '', sideOffset = 10, align = 'center', ...props }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={clsx(
          'popover-content z-[150] rounded-[14px] border border-white/12 bg-[#09090b] p-2 text-white shadow-2xl',
          className
        )}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
