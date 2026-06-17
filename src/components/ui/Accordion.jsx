import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ children, className = '', ...props }) {
  return (
    <AccordionPrimitive.Item className={clsx('border-b border-surface-200 last:border-0', className)} {...props}>
      {children}
    </AccordionPrimitive.Item>
  );
}

export function AccordionTrigger({ children, className = '', ...props }) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={clsx(
          'group flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-bold text-ink-900 outline-none transition-colors hover:text-ink-600',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown size={16} className="shrink-0 text-ink-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ children, className = '', ...props }) {
  return (
    <AccordionPrimitive.Content className="accordion-content overflow-hidden" {...props}>
      <div className={clsx('pb-4 text-body text-ink-600', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
