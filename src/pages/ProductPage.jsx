// ─────────────────────────────────────────────
// FILE: src/pages/ProductPage.jsx
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Heart, ShoppingBag, ChevronRight, Minus, Plus,
  Truck, RotateCcw, Shield
} from 'lucide-react';
import clsx from 'clsx';

import { api } from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { formatPrice, calcSavings } from '../utils/formatPrice';
import { fadeUp, stagger } from '../utils/motionVariants';
import {
  getProductColors,
  getProductImages,
  getProductOriginalPrice,
  getProductPrice,
  getProductStock,
  getProductTags,
  getProductVariants,
} from '../utils/productData';
import RatingStars from '../components/ui/RatingStars';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProductCard from '../components/ui/ProductCard';
import { useToastStore } from '../store/useToastStore';

// ─── Tab component ───────────────────────────
const TABS = ['Description', 'Specifications', 'Reviews'];

function Tabs({ product }) {
  const [active, setActive] = useState('Description');
  const tags = getProductTags(product);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-surface-200 no-scrollbar" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            id={`tab-${tab.toLowerCase()}`}
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={clsx(
              'relative shrink-0 pb-3 pr-6 text-btn font-medium transition-colors duration-200',
              active === tab
                ? 'text-ink-900'
                : 'text-ink-400 hover:text-ink-600'
            )}
          >
            {tab}
            {active === tab && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-6 h-[2px] bg-ink-900 rounded-pill"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="pt-6"
          role="tabpanel"
          aria-labelledby={`tab-${active.toLowerCase()}`}
        >
          {active === 'Description' && (
            <div className="space-y-4">
              <p className="text-body text-ink-600 leading-relaxed">{product.description}</p>
              {tags.length > 0 && (
                <ul className="space-y-2 pt-2">
                  {tags.map((tag) => (
                    <li key={tag} className="flex items-center gap-2 text-body text-ink-600">
                      <span className="w-1.5 h-1.5 rounded-pill bg-brand-500 shrink-0" />
                      <span className="capitalize">{tag}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {active === 'Specifications' && (
            <div className="space-y-3">
              {[
                ['Brand',      'VOIDSTORE'],
                ['Warranty',   '2-year manufacturer warranty'],
                ['Connectivity', 'USB-C / Bluetooth / Wi-Fi'],
                ['Weight',     'Varies by model'],
                ['Material',   'Premium aluminum & ABS'],
                ['In the Box', 'Product, USB-C cable, manual'],
              ].map(([key, val]) => (
                <div key={key} className="flex flex-col gap-1 py-2 border-b border-surface-100 last:border-0 sm:flex-row sm:items-start sm:gap-4">
                  <span className="text-caption text-ink-400 sm:w-32 sm:shrink-0">{key}</span>
                  <span className="text-body text-ink-900">{val}</span>
                </div>
              ))}
            </div>
          )}
          {active === 'Reviews' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-panel">
                <div className="text-center">
                  <p className="text-[40px] font-bold text-ink-900 leading-none">{product.rating}</p>
                  <RatingStars rating={product.rating} showCount={false} size="sm" />
                  <p className="text-caption text-ink-400 mt-1">{product.reviewCount} reviews</p>
                </div>
              </div>
              {[5, 4, 3].map((stars, i) => (
                <div key={stars} className="border-b border-surface-200 pb-5 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <RatingStars rating={stars} showCount={false} size="sm" />
                    <span className="text-caption text-ink-400">
                      {['Incredible quality', 'Great daily driver', 'Worth every penny'][i]}
                    </span>
                  </div>
                  <p className="text-body text-ink-600">
                    {[
                      'Build quality is top-notch - solid materials, premium finish, and everything just works. You can tell real engineering went into this.',
                      'A true daily driver. Setup was effortless and it integrates perfectly into my workflow. Performance is exactly as advertised.',
                      'After 3 months of heavy use, this still looks and performs like day one. Easily the best purchase I made this year.',
                    ][i]}
                  </p>
                  <p className="text-caption text-ink-400 mt-2">
                    {['- Emma R., Verified Purchase', '- Michael T., Verified Purchase', '- Lara K., Verified Purchase'][i]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page Component ─────────────────────
export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleOpen = useCartStore((s) => s.toggleOpen);
  const { isWishlisted, toggleWishlist } = useWishlistStore();
  const toast = useToastStore((s) => s.toast);

  const relatedRef = useRef(null);
  const relatedInView = useInView(relatedRef, { once: true, margin: '-80px' });

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);

      try {
        const data = await api.getProduct(slug);
        if (cancelled) return;

        setProduct(data.product);
        setRelated(data.related || []);
        const variants = getProductVariants(data.product);
        setSelectedImage(0);
        setSelectedColor(0);
        setSelectedSize(variants.length === 1 ? variants[0] : null);
        setQuantity(1);

        // Log page view / product click event for analytics
        api.logEvent('product_click', window.location.pathname, data.product.id);
      } catch (err) {
        if (cancelled) return;

        console.error('Error fetching product:', err);
        setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-surface-0">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-pill animate-spin"></div>
          <p className="text-body text-ink-600 font-medium">Loading workspace item...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-16 bg-surface-0">
        <p className="text-section font-display text-ink-900">Product not found</p>
        <Button onClick={() => navigate('/')} variant="primary" id="not-found-back">
          Back to Home
        </Button>
      </div>
    );
  }

  const images = getProductImages(product);
  const selectedImageSrc = images[selectedImage] || images[0] || '';
  const colors = getProductColors(product);
  const variants = getProductVariants(product);
  const price = getProductPrice(product);
  const originalPrice = getProductOriginalPrice(product);
  const stock = getProductStock(product);
  const stockLimit = stock ?? 99;
  const isOutOfStock = stock !== null && stock <= 0;
  const isLowStock = stock !== null && stock > 0 && stock <= 5;
  const savings = calcSavings(price, originalPrice);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast({
        title: 'Out of Stock',
        description: `${product.name} is not available right now.`,
        variant: 'warning',
      });
      return;
    }

    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      toast({
        title: 'Size Selection Required',
        description: 'Please choose a size before adding the item to your cart.',
        variant: 'warning',
      });
      return;
    }
    addItem(product, quantity, colors[selectedColor] || colors[0], selectedSize);
    setAddedToCart(true);
    
    // Log cart addition
    api.logEvent('add_to_cart', window.location.pathname, product.id, { quantity, size: selectedSize, color: colors[selectedColor] || colors[0] });

    toast({
      title: 'Added to Cart',
      description: `${quantity}x ${product.name} has been added to your cart.`,
      variant: 'success',
    });
    setTimeout(() => {
      setAddedToCart(false);
      toggleOpen();
    }, 1000);
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
    const isNowWishlisted = !wishlisted;
    toast({
      title: isNowWishlisted ? 'Saved to Wishlist' : 'Removed from Wishlist',
      description: isNowWishlisted
        ? `${product.name} is now saved.`
        : `${product.name} has been removed.`,
      variant: 'default',
    });
  };

  return (
    <div className="min-h-screen bg-surface-0 pt-[92px] sm:pt-[108px]">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 overflow-x-auto text-caption text-ink-400 no-scrollbar">
          <Link to="/" id="breadcrumb-home" className="shrink-0 hover:text-ink-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/" id="breadcrumb-category" className="shrink-0 hover:text-ink-600 transition-colors">
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="truncate text-ink-600 font-medium" aria-current="page">{product.name}</span>
        </nav>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] xl:gap-16">

          {/* ══ LEFT: Gallery ══ */}
          <div className="space-y-3 lg:sticky lg:self-start" style={{ top: '112px' }}>
            {/* Main image */}
            <div className="relative aspect-product rounded-panel overflow-hidden bg-surface-100">
              <AnimatePresence mode="wait">
                {selectedImageSrc ? (
                  <motion.img
                    key={selectedImageSrc}
                    src={selectedImageSrc}
                    alt={`${product.name} - view ${selectedImage + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full object-cover object-center cursor-zoom-in"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-body text-ink-400">
                    Product image coming soon
                  </div>
                )}
              </AnimatePresence>

              {/* Badge overlay */}
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge label={product.badge} />
                </div>
              )}

              {/* Wishlist button */}
              <button
                id="pdp-wishlist"
                onClick={handleWishlistToggle}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-pill bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <Heart
                  size={18}
                  className={wishlisted ? 'text-feedback-danger fill-feedback-danger' : 'text-ink-600'}
                  fill={wishlisted ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((src, i) => (
                <button
                  key={i}
                  id={`pdp-thumb-${i}`}
                  onClick={() => setSelectedImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={clsx(
                    'aspect-square rounded-card overflow-hidden border-2 transition-all duration-200',
                    selectedImage === i
                      ? 'border-ink-900 opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-surface-300'
                  )}
                >
                  <img
                    src={src}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
                ))}
              </div>
            )}
          </div>

          {/* ══ RIGHT: Info Panel ══ */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="py-4 lg:py-0 space-y-6"
          >
            {/* Stock alert */}
            {isLowStock && (
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-1.5 text-caption font-medium text-feedback-warning bg-feedback-warning/10 px-3 py-1.5 rounded-tag border border-feedback-warning/20">
                  <span className="w-1.5 h-1.5 rounded-pill bg-feedback-warning animate-pulse-dot" />
                  Only {stock} left in stock
                </span>
              </motion.div>
            )}
            {isOutOfStock && (
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-1.5 text-caption font-medium text-feedback-danger bg-feedback-danger/10 px-3 py-1.5 rounded-tag border border-feedback-danger/20">
                  Out of stock
                </span>
              </motion.div>
            )}

            {/* Name */}
            <motion.div variants={fadeUp}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-2">
                {product.category}
              </p>
              <h1 className="font-display font-semibold text-section-sm md:text-section text-ink-900 leading-tight">
                {product.name}
              </h1>
            </motion.div>

            {/* Rating */}
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
              <span className="text-caption text-ink-400">|</span>
              <button
                id="pdp-view-reviews"
                onClick={() => document.getElementById('tab-reviews')?.click()}
                className="text-caption text-brand-500 hover:text-brand-600 underline underline-offset-2 transition-colors"
              >
                Read reviews
              </button>
            </motion.div>

            {/* Price */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-baseline gap-3 pb-6 border-b border-surface-200">
              <span className="text-price font-bold text-ink-900">
                {formatPrice(price)}
              </span>
              {originalPrice && (
                <>
                  <span className="text-[18px] text-ink-400 line-through font-normal">
                    {formatPrice(originalPrice)}
                  </span>
                  {savings > 0 && (
                    <span className="tag bg-feedback-success/10 text-feedback-success border border-feedback-success/20 text-[11px]">
                      Save {savings}%
                    </span>
                  )}
                </>
              )}
            </motion.div>

            {/* Color selector */}
            <motion.div variants={fadeUp}>
              <p className="text-btn font-semibold text-ink-900 mb-3">
                Color
                <span className="ml-2 text-ink-400 font-normal capitalize">
                  {colors.map((_, i) => ['Black', 'Silver', 'Navy'][i])[selectedColor] || `Option ${selectedColor + 1}`}
                </span>
              </p>
              <div className="flex items-center gap-3">
                {colors.map((color, i) => (
                  <button
                    key={i}
                    id={`pdp-color-${i}`}
                    onClick={() => setSelectedColor(i)}
                    aria-label={`Select color ${['Black', 'Silver', 'Navy'][i] || `Option ${i + 1}`}`}
                    className={clsx(
                      'w-9 h-9 rounded-pill border-2 transition-all duration-200',
                      selectedColor === i
                        ? 'border-ink-900 scale-110 shadow-md'
                        : 'border-surface-200 hover:border-ink-400 hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Size selector */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <p className={clsx('text-btn font-semibold', sizeError ? 'text-feedback-danger' : 'text-ink-900')}>
                  {sizeError ? 'Please select a variant' : 'Variant'}
                </p>
                <button
                  id="pdp-size-guide"
                  className="text-caption text-brand-500 hover:text-brand-600 underline underline-offset-2 transition-colors"
                >
                  Spec Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {variants.map((size) => (
                  <button
                    key={size}
                    id={`pdp-size-${size}`}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    aria-label={`Size ${size}`}
                    aria-pressed={selectedSize === size}
                    className={clsx(
                      'min-w-[48px] h-11 px-4 rounded-btn border text-btn font-medium transition-all duration-200',
                      selectedSize === size
                        ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                        : sizeError
                        ? 'border-feedback-danger/40 text-ink-600 hover:border-brand-500 hover:text-brand-500'
                        : 'border-surface-200 text-ink-600 hover:border-brand-500 hover:text-brand-500'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Quantity */}
            <motion.div variants={fadeUp}>
              <p className="text-btn font-semibold text-ink-900 mb-3">Quantity</p>
              <div className="inline-flex items-center border border-surface-200 rounded-btn overflow-hidden">
                <button
                  id="pdp-qty-minus"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-11 h-11 flex items-center justify-center text-ink-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <Minus size={15} />
                </button>
                <span
                  className="w-12 text-center text-[16px] font-semibold text-ink-900"
                  aria-live="polite"
                  aria-label={`Quantity: ${quantity}`}
                >
                  {quantity}
                </span>
                <button
                  id="pdp-qty-plus"
                  onClick={() => setQuantity((q) => Math.min(stockLimit, q + 1))}
                  aria-label="Increase quantity"
                  disabled={quantity >= stockLimit || isOutOfStock}
                  className="w-11 h-11 flex items-center justify-center text-ink-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <Plus size={15} />
                </button>
              </div>
            </motion.div>

            {/* Add to Cart */}
            <motion.div variants={fadeUp} className="space-y-3 pt-2">
              <Button
                id="pdp-add-to-cart"
                variant="primary"
                size="xl"
                fullWidth
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                loading={addedToCart}
                leftIcon={!addedToCart ? <ShoppingBag size={18} /> : undefined}
                className="h-auto min-h-[52px] whitespace-normal px-4 py-3 text-center text-[14px] leading-tight sm:text-[15px]"
              >
                {isOutOfStock ? 'Out of Stock' : addedToCart ? 'Added!' : `Add to Cart - ${formatPrice(price * quantity)}`}
              </Button>

              <Button
                id="pdp-wishlist-btn"
                variant="secondary"
                size="xl"
                fullWidth
                onClick={handleWishlistToggle}
                leftIcon={<Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />}
                className="h-[52px] text-[15px]"
              >
                {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </Button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 gap-3 pt-2 border-t border-surface-200 sm:grid-cols-3"
            >
              {[
                { icon: Truck,     text: 'Free shipping over $200' },
                { icon: RotateCcw, text: 'Free 30-day returns' },
                { icon: Shield,    text: '2-year warranty' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-card bg-surface-50">
                  <Icon size={18} className="text-brand-500" />
                  <p className="text-[11px] text-ink-600 leading-tight">{text}</p>
                </div>
              ))}
            </motion.div>

            {/* Tabs */}
            <motion.div variants={fadeUp} className="pt-2">
              <Tabs product={product} />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div ref={relatedRef} className="mt-16 pt-12 border-t border-surface-200 sm:mt-20 sm:pt-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={relatedInView ? 'visible' : 'hidden'}
          >
            <motion.div variants={fadeUp} className="mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 mb-2">
                You may also like
              </p>
              <h2 className="font-display font-semibold text-section-sm text-ink-900">
                Related Products
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </motion.div>
          </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
