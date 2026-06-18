// ─────────────────────────────────────────────
// FILE: src/pages/AboutPage.jsx
// Brand story, mission, values
// ─────────────────────────────────────────────

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Leaf, Truck, ArrowRight, Star } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: (i = 0) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.6, delay: i * 0.1, ease },
  }),
};

const VALUES = [
  { icon: Zap, title: 'Precision Crafted', desc: 'Every product is rigorously tested and selected for build quality, durability, and design excellence.' },
  { icon: Shield, title: 'Trusted Quality', desc: 'We partner only with brands that meet our strict quality standards. No compromises, no shortcuts.' },
  { icon: Leaf, title: 'Sustainable Choices', desc: "From packaging to sourcing, we're committed to making environmentally conscious decisions." },
  { icon: Truck, title: 'Fast Delivery', desc: 'Reliable shipping across Morocco with real-time tracking. Most orders arrive within 2-5 business days.' },
];

const STATS = [
  { value: '40K+', label: 'Happy Customers' },
  { value: '2,400+', label: 'Five-Star Reviews' },
  { value: '200+', label: 'Premium Products' },
  { value: '48h', label: 'Avg. Delivery Time' },
];

export default function AboutPage() {
  const valuesRef = useRef(null);
  const valuesInView = useInView(valuesRef, { once: true, margin: '-60px' });

  return (
    <div className="min-h-screen bg-surface-0">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-ink-900 pb-20 pt-[132px] text-white sm:pb-28 sm:pt-[148px]">
        <div className="absolute inset-0 opacity-10">
          <div className="hero-grain" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease }}
            className="text-[11px] font-semibold uppercase tracking-widest text-brand-400 mb-4"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
            className="font-hero text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            Built for people who care about{' '}
            <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
              their workspace
            </span>
          </motion.h1>
          <motion.p
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.25 }}
            className="text-[16px] sm:text-[18px] text-white/55 mt-6 max-w-2xl mx-auto leading-relaxed"
          >
            VOIDSTORE was born from a simple belief: your workspace should inspire your best work. We curate premium desk goods, tech accessories, and workspace essentials — shipping across Morocco.
          </motion.p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-16 sm:py-24 bg-surface-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-3">Our Mission</p>
              <h2 className="font-hero text-section-sm md:text-section font-bold text-ink-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
                Elevating everyday setups
              </h2>
              <p className="text-body text-ink-600 leading-relaxed mb-4">
                We believe a great workspace isn't about having the most expensive gear — it's about having the right tools that work beautifully together. Every product in our catalog is hand-picked for its quality, design, and real-world utility.
              </p>
              <p className="text-body text-ink-600 leading-relaxed">
                From Casablanca to Agadir, from home offices to co-working spaces, we're here to help Moroccan professionals and creators build workspaces they're proud of.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="relative aspect-[4/3] rounded-panel overflow-hidden bg-surface-200"
            >
              <img
                src="https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&q=80"
                alt="Premium workspace setup"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/30 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section ref={valuesRef} className="py-16 sm:py-24 bg-surface-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={valuesInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-12"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-2">Our Values</p>
            <h2 className="font-hero text-section-sm md:text-section font-bold text-ink-900" style={{ letterSpacing: '-0.02em' }}>
              What drives us
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                initial="hidden"
                animate={valuesInView ? 'visible' : 'hidden'}
                custom={i}
                className="p-6 rounded-panel border border-surface-200 bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-card bg-brand-500/10 flex items-center justify-center text-brand-500 mb-4">
                  <v.icon size={22} />
                </div>
                <h3 className="font-hero text-card-title font-bold text-ink-900 mb-2">{v.title}</h3>
                <p className="text-caption text-ink-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 sm:py-20 bg-ink-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ y: 16, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
                className="text-center"
              >
                <p className="font-hero text-[clamp(1.5rem,4vw,2.5rem)] font-bold" style={{ letterSpacing: '-0.02em' }}>{s.value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 bg-surface-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="w-14 h-14 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
              <Star size={24} className="text-brand-500" />
            </div>
            <h2 className="font-hero text-section-sm font-bold text-ink-900 mb-3" style={{ letterSpacing: '-0.02em' }}>
              Ready to upgrade your setup?
            </h2>
            <p className="text-body text-ink-400 mb-8">
              Browse our curated collection of workspace essentials, all available with fast delivery across Morocco.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-ink-900 text-white px-8 py-3.5 rounded-btn font-hero text-btn font-bold uppercase tracking-wide hover:bg-ink-600 transition-colors"
            >
              Shop Now <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
