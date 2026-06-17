import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

import Badge from './Badge';
import RatingStars from './RatingStars';
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip';
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
  const lowStock = stock !== null && stock > 0 && stock <= 5;
  const categoryName = typeof product.category === 'object'
    ? product.category?.name
    : product.category;
  const productHref = `/product/${product.slug}`;
  const visibleColors = colors.slice(0, 4);
  const variantLabel = variants[0] || 'Standard';

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
    <motion.article
      variants={scaleIn}
      className="product-card group/product relative h-full"
    >
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="product-card-hover-shell relative flex h-full min-h-[392px] flex-col overflow-hidden rounded-card border border-surface-200/90 bg-white shadow-[0_14px_36px_rgba(16,24,40,0.08)] transition-shadow duration-300 group-hover/product:shadow-[0_22px_54px_rgba(16,24,40,0.14)] sm:min-h-[432px]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-100">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_22%_8%,rgba(147,164,255,0.32),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(239,245,255,0.82))]" />

          <Link
            to={productHref}
            id={`product-card-${product.id}`}
            className="absolute inset-0 z-0 block"
            aria-label={`View ${product.name} details`}
          >
            {primaryImage && !imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-surface-100" />
            )}

            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                onLoad={() => setImgLoaded(true)}
                className={clsx(
                  'h-full w-full object-cover object-center transition duration-700 ease-expo group-hover/product:scale-110',
                  !imgLoaded && 'opacity-0'
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-center text-caption text-ink-400">
                Image coming soon
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/42 via-ink-900/0 to-white/10 opacity-70 transition-opacity duration-300 group-hover/product:opacity-90" />
          </Link>

          <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-4.25rem)] flex-wrap gap-1.5">
            {product.badge && <Badge label={product.badge} />}
            {savings > 0 && (
              <span className="inline-flex items-center rounded-tag bg-white/88 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-900 shadow-sm backdrop-blur-xl">
                -{savings}%
              </span>
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                id={`wishlist-${product.id}`}
                type="button"
                onClick={handleWishlist}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={clsx(
                  'product-card-wishlist-button absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/50 bg-white/84 text-ink-700 shadow-sm backdrop-blur-xl',
                  wishlisted && 'product-card-wishlist-button--saved text-feedback-danger'
                )}
              >
                <Heart
                  size={16}
                  className={wishlisted ? 'fill-feedback-danger text-feedback-danger' : 'text-current'}
                  fill={wishlisted ? 'currentColor' : 'none'}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            </TooltipContent>
          </Tooltip>

          <div className="product-card-quick-reveal absolute inset-x-3 bottom-3 z-20 flex min-h-11 items-center justify-between gap-2 overflow-hidden rounded-full border border-white/45 p-1.5 pl-3 text-ink-900 shadow-[0_14px_34px_rgba(0,0,0,0.16)]">
            <span className="product-card-quick-glass" aria-hidden="true" />
            <span className="relative z-10 min-w-0 truncate text-[12px] font-bold uppercase tracking-[0.12em]">
              {outOfStock ? 'Sold out' : 'Quick add'}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  id={`add-to-cart-${product.id}`}
                  type="button"
                  onClick={handleAddToCart}
                  aria-label={outOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
                  disabled={outOfStock}
                  className={clsx(
                    'product-card-quick-action relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-900 text-white shadow-sm',
                    outOfStock && 'cursor-not-allowed opacity-55'
                  )}
                >
                  <ShoppingBag size={15} aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {outOfStock ? 'Out of stock' : 'Add to cart'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Link
          to={productHref}
          className="flex flex-1 flex-col gap-2 p-3 sm:p-4"
          aria-label={`View ${product.name} details`}
        >
          <div className="flex min-w-0 items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
              {categoryName || 'Workspace'}
            </p>
            <div className="shrink-0">
              <RatingStars rating={Number(product.rating || 0)} reviewCount={product.reviewCount} size="sm" showCount={false} />
            </div>
          </div>

          <h3 className="min-h-[2.55rem] text-[15px] font-bold leading-snug text-ink-900 line-clamp-2 sm:text-card-title">
            {product.name}
          </h3>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-1">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-[18px] font-black leading-none text-ink-900">
                {formatPrice(price)}
              </span>
              {originalPrice && (
                <span className="text-[12px] leading-none text-ink-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center -space-x-1">
              {visibleColors.map((color) => (
                <span
                  key={color}
                  className="h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.12)]"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-2 text-[11px] font-semibold text-ink-400">
            <span className={clsx('truncate', lowStock && 'text-feedback-warning', outOfStock && 'text-feedback-danger')}>
              {outOfStock ? 'Out of stock' : lowStock ? `${stock} left` : 'In stock'}
            </span>
            <span className="truncate text-right">
              {variantLabel}
            </span>
          </div>
        </Link>
      </motion.div>
    </motion.article>
  );
}
