import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import clsx from 'clsx';

export function RadioGroup(props) {
  return <RadioGroupPrimitive.Root {...props} />;
}

export function RadioGroupItem({ children, className = '', ...props }) {
  return (
    <RadioGroupPrimitive.Item
      className={clsx(
        'radio-group-item min-h-11 rounded-lg border-2 border-solid border-surface-400 bg-surface-50 px-4 py-2.5 text-btn font-extrabold text-ink-800 shadow-sm transition-all hover:border-ink-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 data-[state=checked]:border-ink-900 data-[state=checked]:bg-ink-900 data-[state=checked]:text-white data-[state=checked]:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
}
