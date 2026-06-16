// ─────────────────────────────────────────────
// FILE: src/components/sections/Testimonials.jsx
// ─────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Quote, Check } from 'lucide-react';
import RatingStars from '../ui/RatingStars';
import { slideLeft } from '../../utils/motionVariants';

const testimonials = [
  {
    id: 1,
    quote: 'l stand dyal screen n9a liya bureau bzzaf daba kolchi mrteb w l hub kaykhdem mzyan',
    author: 'Youssef El Idrissi',
    city: 'Casa',
    rating: 5,
  },
  {
    id: 2,
    quote: 'clavier kayban premium w sout dyalo hani khfif f lkhdma w kaytconnecta bsr3a',
    author: 'Fatim-Zahra Alami',
    city: 'Rbat',
    rating: 5,
  },
  {
    id: 3,
    quote: 'casque 3awenni f bureau mli kaykon dda9a kay7bes sda3 w kayb9a mrta7',
    author: 'Amine Mansouri',
    city: 'Marrakech',
    rating: 5,
  },
  {
    id: 4,
    quote: 'tawsil ja bsr3a w packaging n9i l dock khdem m3a joj screens mn nhar lowel',
    author: 'Khadija Bennani',
    city: 'Tanger',
    rating: 5,
  },
  {
    id: 5,
    quote: 'lampe sahl tbadal dow dyalha daba nkhdem b lil bla ma t3ya 3iniya',
    author: 'Anass El Moudene',
    city: 'Tetouan',
    rating: 5,
  },
  {
    id: 6,
    quote: 'fan hani f lbit ma kaydirch sda3 w kaydwer l hawa mzyan',
    author: 'Chaimae Boutaleb',
    city: 'Agadir',
    rating: 4,
  },
];

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
              className="flex w-[min(82vw,320px)] shrink-0 flex-col gap-5 rounded-panel border border-surface-200 bg-surface-50 p-6 shadow-sm transition-all duration-300 ease-expo hover:-translate-y-1 hover:shadow-md sm:w-[400px] sm:p-7"
            >
              {/* Quote icon */}
              <Quote size={28} className="text-brand-400 shrink-0" />

              {/* Rating */}
              <RatingStars rating={t.rating} showCount={false} size="md" />

              {/* Quote text */}
              <blockquote className="text-body text-ink-600 leading-relaxed flex-1">
                {t.quote}
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-surface-200">
                <div className="w-10 h-10 rounded-pill bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                  {t.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-ink-900 leading-none">
                    {t.author}
                  </p>
                  <p className="text-caption text-ink-400 mt-0.5">{t.city}</p>
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
