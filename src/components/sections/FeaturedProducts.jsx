// ─────────────────────────────────────────────
// FILE: src/components/sections/FeaturedProducts.jsx
// ─────────────────────────────────────────────

import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import ProductCard from '../ui/ProductCard';
import { api } from '../../services/api';
import { fadeUp, stagger, slideLeft } from '../../utils/motionVariants';

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts({ featured: true })
      .then((data) => {
        // Laravel paginate returns data inside 'data' field
        const products = Array.isArray(data?.data) ? data.data : data;
        setFeaturedProducts(Array.isArray(products) ? products : []);
      })
      .catch((err) => {
        console.error('Failed to load featured products:', err);
        setFeaturedProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      id="featured-products"
      aria-label="Featured Products"
      ref={sectionRef}
      className="py-16 md:py-24 bg-surface-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <div className="flex items-end justify-between mb-10 md:mb-12">
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-2">
              Top Picks
            </p>
            <h2 className="font-display font-semibold text-section-sm md:text-section text-ink-900">
              Featured Products
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Link
              to="/"
              id="featured-view-all"
              className="hidden sm:inline-flex items-center gap-1.5 text-btn font-medium text-ink-600 hover:text-brand-500 transition-colors duration-200 group"
            >
              View all
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        {/* ── Products Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="bg-surface-200 h-64 w-full rounded-md"></div>
                <div className="bg-surface-200 h-4 w-3/4 rounded"></div>
                <div className="bg-surface-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="flex min-h-[240px] items-center justify-center rounded-panel border border-surface-200 bg-surface-50 px-6 text-center"
          >
            <div>
              <p className="font-display text-[24px] text-ink-900">No featured products yet</p>
              <p className="mt-2 max-w-sm text-caption text-ink-600">
                Products marked as featured in the dashboard will appear here automatically.
              </p>
            </div>
          </motion.div>
        )}

        {/* Mobile View All */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex justify-center mt-10 sm:hidden"
        >
          <Link
            to="/"
            id="featured-view-all-mobile"
            className="inline-flex items-center gap-2 text-btn font-medium text-brand-500 border border-brand-500 px-6 py-3 rounded-btn hover:bg-brand-50 transition-colors duration-200"
          >
            View All Products
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
