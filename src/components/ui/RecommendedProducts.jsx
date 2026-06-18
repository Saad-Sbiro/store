import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import ProductCard from './ProductCard';

export default function RecommendedProducts({ products = [] }) {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const totalScroll = scrollWidth - clientWidth;

    if (totalScroll <= 0) {
      setScrollProgress(0);
      setCanScrollLeft(false);
      setCanScrollRight(false);
    } else {
      setScrollProgress((scrollLeft / totalScroll) * 100);
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < totalScroll - 10);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Run initial scroll check
    handleScroll();

    // Set up resize observer to update bounds on window resize
    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });
    resizeObserver.observe(container);

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [products]);

  const handleScrollClick = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.75;
    const target = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: target,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="w-full">
      {/* ── Header with Inline Scroll Buttons ── */}
      <div className="flex items-end justify-between mb-8 md:mb-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-2">
            Vous aimerez aussi
          </p>
          <h2 className="font-display font-semibold text-section-sm text-ink-900">
            Produits similaires
          </h2>
        </div>

        {/* Custom Navigation Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScrollClick('left')}
            disabled={!canScrollLeft}
            aria-label="Produits précédents"
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-full border border-surface-200 bg-white text-ink-700 shadow-sm transition-all duration-300",
              canScrollLeft
                ? "hover:bg-brand-50 hover:text-brand-500 hover:border-brand-200 hover:scale-105 active:scale-95"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => handleScrollClick('right')}
            disabled={!canScrollRight}
            aria-label="Produits suivants"
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-full border border-surface-200 bg-white text-ink-700 shadow-sm transition-all duration-300",
              canScrollRight
                ? "hover:bg-brand-50 hover:text-brand-500 hover:border-brand-200 hover:scale-105 active:scale-95"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* ── Carousel Slider Container ── */}
      <div className="relative">
        {/* Soft horizontal gradients to indicate more content */}
        <div className="pointer-events-none absolute bottom-6 left-0 top-0 z-10 w-8 bg-gradient-to-r from-surface-0 to-transparent opacity-0 md:opacity-100 transition-opacity" />
        <div className="pointer-events-none absolute bottom-6 right-0 top-0 z-10 w-8 bg-gradient-to-l from-surface-0 to-transparent opacity-0 md:opacity-100 transition-opacity" />

        <div
          ref={containerRef}
          className="scrollbar-none flex w-full gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory select-none"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[280px] xs:w-[300px] sm:w-[320px] shrink-0 snap-start snap-always pointer-events-auto"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Minimalist Scroll Progress Indicator ── */}
      {products.length > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="relative h-[2px] w-32 rounded-full bg-surface-200 overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-brand-500 transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
