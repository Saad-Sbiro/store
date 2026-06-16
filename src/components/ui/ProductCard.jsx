// ─────────────────────────────────────────────
// FILE: src/components/ui/ProductCard.jsx
// ─────────────────────────────────────────────

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

import Badge from './Badge';
import RatingStars from './RatingStars';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useToastStore } from '../../store/useToastStore';
import { formatPrice } from '../../utils/formatPrice';
import { scaleIn } from '../../utils/motionVariants';
import {
  getPrimaryProductImage,
  getProductColors,
  getProductOriginalPrice,
  getProductPrice,
  getProductStock,
  getProductVariants,
} from '../../utils/productData';

export default function ProductCard({ product }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { isWishlisted, toggleWishlist } = useWishlistStore();
  const toast = useToastStore((s) => s.toast);
  const wishlisted = isWishlisted(product.id);
  const primaryImage = getPrimaryProductImage(product);
  const colors = getProductColors(product);
  const variants = getProductVariants(product);
  const price = getProductPrice(product);
  const originalPrice = getProductOriginalPrice(product);
  const stock = getProductStock(product);
  const outOfStock = stock !== null && stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) {
      toast({
        title: 'Out of Stock',
        description: `${product.name} is not available right now.`,
        variant: 'warning',
      });
      return;
    }

    addItem(product, 1, colors[0], variants[0]);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
      variant: 'success',
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  const savings = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <motion.div
      variants={scaleIn}
      className="group relative"
    >
      <Link
        to={`/product/${product.slug}`}
        id={`product-card-${product.id}`}
        className="block"
        aria-label={`View ${product.name} details`}
      >
        {/* ── Image Container ── */}
        <div className="relative overflow-hidden rounded-card bg-surface-100 aspect-product">

          {/* Skeleton shimmer until image loads */}
          {primaryImage && !imgLoaded && (
            <div className="absolute inset-0 bg-surface-100 animate-pulse" />
          )}

          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              className={clsx(
                'w-full h-full object-cover object-center img-scale',
                !imgLoaded && 'opacity-0'
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-100 px-4 text-center text-caption text-ink-400">
              Image coming soon
            </div>
          )}

          {/* Badge top-left */}
          {product.badge && (
            <div className="absolute top-3 left-3 z-10">
              <Badge label={product.badge} />
            </div>
          )}

          {/* Wishlist top-right — visible on hover */}
          <motion.button
            id={`wishlist-${product.id}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'absolute top-3 right-3 z-10',
              'w-9 h-9 rounded-pill',
              'flex items-center justify-center',
              'bg-white/90 backdrop-blur-sm shadow-sm',
              'transition-all duration-200',
              'group-hover:opacity-100 group-hover:scale-100',
              wishlisted ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
            )}
          >
            <Heart
              size={16}
              className={wishlisted ? 'text-feedback-danger fill-feedback-danger' : 'text-ink-600'}
              fill={wishlisted ? 'currentColor' : 'none'}
            />
          </motion.button>

          {/* Add to cart slide-up bar */}
          <AnimatePresence>
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '101%', opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-10 group-hover:translate-y-0 group-hover:opacity-100"
              style={{ transition: 'none' }}
            />
          </AnimatePresence>

          {/* Add to cart bar (CSS-driven for performance) */}
          <div
            className={clsx(
              'absolute bottom-0 left-0 right-0 z-10',
              'translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0',
              'transition-transform duration-300 ease-expo'
            )}
          >
            <button
              id={`add-to-cart-${product.id}`}
              onClick={handleAddToCart}
              aria-label={outOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
              disabled={outOfStock}
              className={clsx(
                'w-full h-11',
                'flex items-center justify-center gap-2',
                'bg-ink-900/95 backdrop-blur-sm text-white',
                'text-btn font-medium',
                'hover:bg-ink-900 active:scale-[0.98]',
                'transition-all duration-150',
                outOfStock && 'cursor-not-allowed opacity-70'
              )}
            >
              <ShoppingBag size={15} aria-hidden="true" />
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* ── Card Info ── */}
        <div className="pt-3 space-y-1">
          {/* Category */}
          <p className="text-[11px] font-medium uppercase tracking-widest text-ink-400">
            {product.category}
          </p>

          {/* Product Name */}
          <h3 className="text-card-title font-semibold text-ink-900 leading-snug line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />

          {/* Price row */}
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-[18px] font-bold text-ink-900 leading-none">
              {formatPrice(price)}
            </span>
            {originalPrice && (
              <span className="text-[13px] text-ink-400 line-through leading-none">
                {formatPrice(originalPrice)}
              </span>
            )}
            {savings > 0 && (
              <span className="text-[11px] font-semibold text-feedback-success leading-none">
                -{savings}%
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
