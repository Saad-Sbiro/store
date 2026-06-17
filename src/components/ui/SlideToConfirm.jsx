import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

export default function SlideToConfirm({
  text = 'Slide to confirm',
  successText = 'Confirmed',
  onConfirm,
  disabled = false,
  height = 54,
  className = '',
}) {
  const [state, setState] = useState('idle');
  const [width, setWidth] = useState(320);
  const containerRef = useRef(null);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const thumbInsetX = 5;
  const thumbInsetY = 4;
  const fillInsetX = thumbInsetX - 1;
  const fillInsetY = thumbInsetY - 1;
  const thumbSize = height - 10;
  const fillSize = thumbSize + 2;
  const trackWidth = Math.max(0, width - thumbSize - thumbInsetX * 2);
  const textOpacity = useTransform(x, [0, trackWidth * 0.55 || 1], [1, 0]);
  const fillWidth = useTransform(x, [0, trackWidth || 1], [fillSize, width - fillInsetX * 2]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.getBoundingClientRect().width);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const reset = () => {
    setState('idle');
    x.set(0);
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 420, damping: 34 } });
  };

  const handleDragEnd = async () => {
    if (state !== 'idle' || disabled) return;

    if (x.get() < trackWidth * 0.88) {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 420, damping: 34 } });
      return;
    }

    await controls.start({ x: trackWidth, transition: { type: 'spring', stiffness: 420, damping: 34 } });
    setState('loading');

    try {
      await onConfirm?.();
      setState('success');
    } catch {
      reset();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none overflow-hidden rounded-full border border-ink-900/10 bg-white text-ink-900 shadow-sm ${disabled ? 'opacity-50' : ''} ${className}`}
      style={{ height }}
    >
      <motion.div
        className="absolute rounded-full bg-ink-900"
        style={{
          left: fillInsetX,
          top: fillInsetY,
          width: fillWidth,
          height: fillSize,
        }}
      />

      <motion.div
        className="absolute inset-0 grid place-items-center px-14 text-center font-hero text-btn font-bold uppercase tracking-wide text-ink-500"
        style={{ opacity: textOpacity }}
      >
        {text}
      </motion.div>

      <motion.div
        className="absolute inset-0 grid place-items-center text-sm font-bold text-white"
        initial={false}
        animate={{ opacity: state === 'success' ? 1 : 0 }}
      >
        {successText}
      </motion.div>

      <motion.button
        type="button"
        aria-label={text}
        drag={disabled || state !== 'idle' ? false : 'x'}
        dragConstraints={{ left: 0, right: trackWidth }}
        dragElastic={0.02}
        animate={controls}
        style={{
          x,
          left: thumbInsetX,
          top: thumbInsetY,
          width: thumbSize,
          height: thumbSize,
        }}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (state === 'success') reset();
        }}
        className="absolute grid cursor-grab place-items-center rounded-full border border-ink-900/10 bg-white text-ink-900 shadow-[0_10px_24px_rgba(9,9,11,0.16)] active:cursor-grabbing"
      >
        {state === 'loading' ? (
          <Loader2 size={18} className="animate-spin" />
        ) : state === 'success' ? (
          <Check size={18} />
        ) : (
          <ArrowRight size={18} />
        )}
      </motion.button>
    </div>
  );
}
