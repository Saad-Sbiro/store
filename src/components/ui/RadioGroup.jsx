import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import clsx from 'clsx';

export const RadioGroup = RadioGroupPrimitive.Root;

export function RadioGroupItem({ children, className = '', ...props }) {
  return (
    <RadioGroupPrimitive.Item
      className={clsx(
        'radio-group-item rounded-btn border-[1.5px] border-surface-300 bg-white px-4 py-2.5 text-btn font-bold text-ink-700 shadow-sm transition-all data-[state=checked]:border-ink-900 data-[state=checked]:bg-ink-900 data-[state=checked]:text-white',
        className
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
}
