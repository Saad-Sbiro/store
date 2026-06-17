import * as TabsPrimitive from '@radix-ui/react-tabs';
import clsx from 'clsx';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ children, className = '', ...props }) {
  return (
    <TabsPrimitive.List
      className={clsx('tabs-list inline-flex rounded-full border border-surface-200 bg-surface-50 p-1', className)}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ children, className = '', ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={clsx(
        'tabs-trigger rounded-full px-4 py-2 text-[13px] font-bold text-ink-500 transition-colors data-[state=active]:bg-ink-900 data-[state=active]:text-white',
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ children, className = '', ...props }) {
  return (
    <TabsPrimitive.Content className={clsx('tabs-content outline-none', className)} {...props}>
      {children}
    </TabsPrimitive.Content>
  );
}
