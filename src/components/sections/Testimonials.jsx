// ─────────────────────────────────────────────
// FILE: src/components/sections/Testimonials.jsx
// ─────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Quote, Check } from 'lucide-react';
import RatingStars from '../ui/RatingStars';
import { slideLeft } from '../../utils/motionVariants';
import { customerReviews } from '../../data/reviews';

const testimonials = customerReviews;

export default function Testimonials() {
  const sectionRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeSpeedRef = useRef(42);
  const marqueeTargetSpeedRef = useRef(42);
  const marqueeOffsetRef = useRef(0);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const reduceMotion = useReducedMotion();

  // Triple the list to ensure there are enough items to scroll horizontally across wide viewports
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];
  const marqueeSpeed = 42;

  useEffect(() => {
    const track = marqueeRef.current;
    if (!track || !isInView || reduceMotion) {
      return undefined;
    }

    let frame;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const targetSpeed = marqueeTargetSpeedRef.current;
      const ease = 1 - Math.exp(-delta * 3.2);
      const nextSpeed = marqueeSpeedRef.current + (targetSpeed - marqueeSpeedRef.current) * ease;
      marqueeSpeedRef.current = targetSpeed === 0 && Math.abs(nextSpeed) < 0.05 ? 0 : nextSpeed;

      const loopWidth = track.scrollWidth / 3;
      if (loopWidth > 0) {
        marqueeOffsetRef.current = (marqueeOffsetRef.current + marqueeSpeedRef.current * delta) % loopWidth;
        track.style.transform = `translate3d(${-marqueeOffsetRef.current}px, 0, 0)`;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [isInView, reduceMotion]);

  return (
    <section
      id="testimonials"
      aria-label="Ara dyal clients"
      ref={sectionRef}
      className="relative z-10 bg-transparent py-14 md:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 md:mb-4">
        {/* ── Header ── */}
        <motion.div
          variants={slideLeft}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-2">
            Ara dyal nass
          </p>
          <h2 className="font-display font-semibold text-section-sm md:text-section text-ink-900">
            Ach kaygolo clients dyalna
          </h2>
          <p className="text-body text-ink-600 mt-3 max-w-md mx-auto">
            Hadchi men nass li khdaw products w st3mlohom f setup dyalhom
          </p>
        </motion.div>
      </div>

      {/* ── Infinite Horizontal Scroll Cards ── */}
      <div
        className="relative w-full overflow-x-clip overflow-y-visible py-3"
        style={{
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
        }}
        onPointerEnter={() => { marqueeTargetSpeedRef.current = 0; }}
        onPointerLeave={() => { marqueeTargetSpeedRef.current = marqueeSpeed; }}
      >
        <div ref={marqueeRef} className="flex w-max gap-4 will-change-transform sm:gap-6">
          {duplicatedTestimonials.map((t, index) => (
            <div
              key={`${t.id}-${index}`}
              className="flex w-[min(78vw,260px)] shrink-0 flex-col gap-3 rounded-card border border-surface-200 bg-surface-50 p-4 shadow-sm transition-all duration-300 ease-expo hover:-translate-y-1 hover:shadow-md sm:w-[380px] sm:gap-5 sm:rounded-panel sm:p-6"
            >
              {/* Quote icon */}
              <Quote size={22} className="shrink-0 text-brand-400 sm:h-7 sm:w-7" />

              {/* Rating */}
              <RatingStars rating={t.rating} showCount={false} size="sm" />

              {/* Quote text */}
              <blockquote className="flex-1 text-[13px] leading-relaxed text-ink-600 sm:text-body">
                {t.quote}
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-2.5 border-t border-surface-200 pt-3 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-brand-500/10 text-[10px] font-bold uppercase text-brand-500 sm:h-10 sm:w-10 sm:text-xs">
                  {t.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-[12px] font-semibold leading-none text-ink-900 sm:text-[14px]">
                    {t.author}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-400 sm:text-caption">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-9 md:mt-11">
        {/* ── Aggregate stat ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center"
        >
          <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs">
            <Check size={13} /> Verified Purchases
          </div>
          <p className="text-caption text-ink-600">
            <span className="font-semibold text-ink-900">4.9/5</span> average from verified reviews
          </p>
        </motion.div>
      </div>
    </section>
  );
}
