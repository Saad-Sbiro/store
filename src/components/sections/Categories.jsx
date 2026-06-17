import { lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const MagicRings = lazy(() => import('../ui/MagicRings'));

const CATEGORY_CARDS = [
  {
    title: 'Desk Accessories',
    label: 'Setup',
    href: '/shop?category=Desk+Accessories',
    className: 'md:col-span-4',
    gradient: 'from-sky-300 to-indigo-400',
    detail: 'Stands organizers cable calm',
  },
  {
    title: 'Peripherals',
    label: 'Input',
    href: '/shop?category=Peripherals',
    className: 'md:col-span-8',
    gradient: 'from-emerald-300 to-cyan-500',
    detail: 'Keys mice daily control',
  },
  {
    title: 'Audio Gear',
    label: 'Sound',
    href: '/shop?category=Audio',
    className: 'md:col-span-8',
    gradient: 'from-amber-300 to-rose-400',
    detail: 'Headphones speakers focus',
  },
  {
    title: 'Lighting',
    label: 'Glow',
    href: '/shop?category=Lighting',
    className: 'md:col-span-4',
    gradient: 'from-violet-300 to-fuchsia-500',
    detail: 'Light bars lamps mood',
  },
];

function BounceCard({ category }) {
  return (
    <motion.div
      whileHover={{ scale: 0.975, rotate: '-0.8deg' }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative col-span-12 min-h-[300px] overflow-hidden rounded-card border border-surface-200 bg-[#dbe9ff] p-7 text-slate-900 shadow-sm ${category.className}`}
    >
      <Link
        to={category.href}
        className="absolute inset-0 z-20"
        aria-label={`Shop ${category.title}`}
      />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            {category.label}
          </p>
          <h3 className="max-w-[12ch] text-3xl font-black leading-none tracking-[-0.02em] md:text-4xl">
            {category.title}
          </h3>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-white shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight size={17} />
        </span>
      </div>
      <div className={`absolute bottom-0 left-4 right-4 top-32 translate-y-8 rounded-t-card bg-gradient-to-br ${category.gradient} p-5 shadow-[0_-18px_60px_rgba(15,23,42,0.16)] transition-transform duration-[420ms] ease-expo group-hover:translate-y-4 group-hover:rotate-[1.5deg]`}>
        <span className="block text-center text-[13px] font-black uppercase tracking-[0.16em] text-white/90">
          {category.detail}
        </span>
      </div>
    </motion.div>
  );
}

function CategoryGridPlaceholder() {
  return (
    <div className="grid grid-cols-12 gap-4">
      {CATEGORY_CARDS.map((card) => (
        <div
          key={card.title}
          className={`col-span-12 min-h-[300px] animate-pulse rounded-card border border-surface-200 bg-[#dbe9ff] ${card.className}`}
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
      className="relative isolate overflow-x-clip overflow-y-visible bg-transparent py-16 md:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-72 -bottom-[720px] z-0 overflow-visible sm:-bottom-[860px]" aria-hidden="true">
        <div className="absolute left-1/2 top-[42%] h-full min-h-[1400px] w-[165vw] -translate-x-1/2 -translate-y-1/2 scale-x-[1.12] opacity-70 mix-blend-multiply sm:w-[150vw] lg:w-[135vw]">
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-brand-500">
              Browse
            </p>
            <h2 className="max-w-lg font-display text-section-sm font-semibold leading-tight text-ink-900 md:text-section">
              Shop by Category
            </h2>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ delay: 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {isNearView ? (
            <div className="grid grid-cols-12 gap-4">
              {CATEGORY_CARDS.map((category) => (
                <BounceCard key={category.title} category={category} />
              ))}
            </div>
          ) : (
            <CategoryGridPlaceholder />
          )}
        </motion.div>
      </div>
    </section>
  );
}
