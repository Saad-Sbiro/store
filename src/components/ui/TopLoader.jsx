import { AnimatePresence, motion } from 'framer-motion';

export default function TopLoader({ isLoading, color = '#09090b' }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed left-0 top-0 z-[140] h-[3px] origin-left"
          style={{ backgroundColor: color }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.82, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </AnimatePresence>
  );
}
