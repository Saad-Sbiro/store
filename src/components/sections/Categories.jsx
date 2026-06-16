import { lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { slideLeft } from '../../utils/motionVariants';

const MagicBento = lazy(() => import('../ui/MagicBento'));
const MagicRings = lazy(() => import('../ui/MagicRings'));

function CategoryGridPlaceholder() {
  return (
    <div className="mx-auto grid w-[90%] max-w-[54em] grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:grid-cols-4 lg:[&>*:nth-child(3)]:col-span-2 lg:[&>*:nth-child(3)]:row-span-2 lg:[&>*:nth-child(4)]:col-span-2 lg:[&>*:nth-child(4)]:row-span-2 lg:[&>*:nth-child(6)]:col-start-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[180px] rounded-[20px] border border-surface-200 bg-surface-100/80 lg:min-h-[200px]"
        />
      ))}
    </div>
  );
}

export default function Categories() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const isNearView = useInView(sectionRef, { once: true, margin: '0px 0px 420px 0px' });
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="categories"
      aria-label="Shop by Category"
      ref={sectionRef}
      className="relative isolate overflow-x-clip overflow-y-visible bg-transparent pt-16 pb-28 md:pt-24 md:pb-36"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-72 -bottom-[780px] z-0 overflow-visible sm:-bottom-[900px] lg:-bottom-[1040px]" aria-hidden="true">
        <div className="absolute left-1/2 top-[42%] h-full min-h-[1500px] w-[165vw] -translate-x-1/2 -translate-y-1/2 scale-x-[1.12] opacity-80 mix-blend-multiply sm:w-[150vw] lg:w-[135vw]">
          {isNearView && !reduceMotion && (
            <Suspense fallback={null}>
              <MagicRings
                color="#0F172A"
                colorTwo="#7C3AED"
                ringCount={7}
                speed={0.34}
                attenuation={8.6}
                lineThickness={2}
                baseRadius={0.18}
                radiusStep={0.104}
                scaleRate={0.11}
                opacity={0.9}
                blur={0}
                noiseAmount={0.01}
                rotation={-14}
                ringGap={1.36}
                fadeIn={0.82}
                fadeOut={0.55}
                followMouse
                mouseInfluence={0.07}
                hoverScale={1.04}
                parallax={0.025}
                clickBurst
              />
            </Suspense>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 mb-10">
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-2">
              Browse
            </p>
            <h2 className="font-display font-semibold text-section-sm md:text-section text-ink-900">
              Shop by Category
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/"
              id="categories-view-all"
              className="hidden sm:inline-flex items-center gap-1.5 text-btn font-medium text-ink-600 hover:text-brand-500 transition-colors duration-200 group"
            >
              All Categories
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {isNearView ? (
            <Suspense fallback={<CategoryGridPlaceholder />}>
              <MagicBento
                textAutoHide={false}
                enableStars
                enableSpotlight
                enableBorderGlow
                enableTilt={false}
                clickEffect
                enableMagnetism
                glowColor="99, 102, 241"
              />
            </Suspense>
          ) : (
            <CategoryGridPlaceholder />
          )}
        </motion.div>
      </div>
    </section>
  );
}
