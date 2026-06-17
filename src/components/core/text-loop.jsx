import { Children, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

const defaultVariants = {
  initial: { y: 14, opacity: 0, filter: 'blur(4px)' },
  animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
  exit: { y: -14, opacity: 0, filter: 'blur(4px)' },
};

const defaultTransition = {
  type: 'spring',
  stiffness: 150,
  damping: 20,
  mass: 1,
};

export function TextLoop({
  children,
  className,
  interval = 2.5,
  transition = defaultTransition,
  variants = defaultVariants,
  onIndexChange,
}) {
  const items = useMemo(() => Children.toArray(children).filter(Boolean), [children]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, interval * 1000);

    return () => window.clearInterval(timer);
  }, [interval, items.length, onIndexChange]);

  if (items.length === 0) return null;

  return (
    <span className={clsx('inline-grid overflow-hidden align-baseline', className)} aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          className="col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
        >
          {items[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
