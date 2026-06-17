import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import clsx from 'clsx';

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;

const sideClasses = {
  right: 'right-0 top-0 h-full w-full max-w-md border-l',
  left: 'left-0 top-0 h-full w-full max-w-md border-r',
  bottom: 'bottom-0 left-0 right-0 max-h-[86vh] rounded-t-[20px] border-t',
  top: 'left-0 right-0 top-0 max-h-[86vh] rounded-b-[20px] border-b',
};

export function SheetContent({
  children,
  side = 'right',
  className = '',
  showClose = true,
  closeLabel = 'Close',
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="sheet-overlay fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-sm" />
      <Dialog.Content
        className={clsx(
          'sheet-content fixed z-[70] flex flex-col border-surface-200 bg-white shadow-xl outline-none',
          sideClasses[side],
          className
        )}
        data-side={side}
      >
        {showClose && (
          <Dialog.Close
            aria-label={closeLabel}
            className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-btn text-ink-400 transition-colors hover:bg-surface-100 hover:text-ink-900"
          >
            <X size={18} />
          </Dialog.Close>
        )}
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
