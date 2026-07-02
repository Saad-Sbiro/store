// ─────────────────────────────────────────────
// FILE: src/components/sections/FeaturedProducts.jsx
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import ProductCard from '../ui/ProductCard';
import { api } from '../../services/api';
import { products as fallbackProducts } from '../../data/products';

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const featuredResponse = await api.getProducts({ featured: true, per_page: 8 });
        let products = Array.isArray(featuredResponse?.data)
          ? featuredResponse.data
          : featuredResponse;

        if (!Array.isArray(products) || products.length === 0) {
          const activeResponse = await api.getProducts({ per_page: 8 });
          products = Array.isArray(activeResponse?.data) ? activeResponse.data : activeResponse;
        }

        if (!cancelled) {
          setFeaturedProducts(Array.isArray(products) ? products.slice(0, 8) : []);
        }
      } catch (error) {
        console.warn('Using the local product catalog because the API is unavailable:', error.message);
        if (!cancelled) {
          setFeaturedProducts(fallbackProducts.slice(0, 8));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="featured-products"
      aria-label="المنتجات المميزة"
      className="relative z-10 bg-surface-0 py-16 md:py-24"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <div className="flex items-end justify-between mb-10 md:mb-12">
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-2">
              اخترنا لكم
            </p>
            <h2 className="font-zain font-black text-section-sm md:text-section text-ink-900">
              المنتجات المميزة
            </h2>
          </div>

          <div>
            <Link
              to="/shop"
              id="featured-view-all"
              className="hidden sm:inline-flex items-center gap-1.5 text-btn font-medium text-ink-600 hover:text-brand-500 transition-colors duration-200 group"
            >
              عرض الكل
              <ArrowRight size={14} className="group-hover:-translate-x-1 transition-transform duration-200 rotate-180" />
            </Link>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[240px] items-center justify-center rounded-panel border border-surface-200 bg-surface-50 px-6 text-center">
            <div>
              <p className="font-display text-[24px] text-ink-900">لا توجد منتجات مميزة بعد</p>
              <p className="mt-2 max-w-sm text-caption text-ink-600">
                المنتجات المحددة كمميزة في لوحة التحكم ستظهر هنا تلقائياً.
              </p>
            </div>
          </div>
        )}

        {/* Mobile View All */}
        <div className="flex justify-center mt-10 sm:hidden">
          <Link
            to="/shop"
            id="featured-view-all-mobile"
            className="inline-flex items-center gap-2 text-btn font-medium text-brand-500 border border-brand-500 px-6 py-3 rounded-btn hover:bg-brand-50 transition-colors duration-200"
          >
            عرض جميع المنتجات
            <ArrowRight size={14} className="rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
