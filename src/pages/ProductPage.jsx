import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import clsx from 'clsx';

import { api } from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useToastStore } from '../store/useToastStore';
import { calcSavings, formatPrice } from '../utils/formatPrice';
import {
  getProductColors,
  getProductImages,
  getProductOriginalPrice,
  getProductPrice,
  getProductStock,
  getProductVariants,
} from '../utils/productData';
import { getProductReviewSummary } from '../utils/reviews';
import { customerReviews } from '../data/reviews';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordion';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import RatingStars from '../components/ui/RatingStars';
import RecommendedProducts from '../components/ui/RecommendedProducts';

// ── Skeleton loading UI ───────────────────────────────────────────────────────
// Shown while the product data is fetching. Mirrors the exact layout of the
// real page so the user immediately sees structure (good LCP + no layout shift).
function ProductPageSkeleton() {
  return (
    <div
      className="min-h-screen bg-white pb-32 pt-[92px] font-arabic text-ink-900 sm:pt-[108px] lg:pb-16"
      dir="rtl"
      aria-busy="true"
      aria-label="جاري تحميل المنتج"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex h-12 items-center">
          <div className="h-4 w-28 animate-pulse rounded bg-surface-200" />
        </div>

        <div className="grid items-start gap-6 pb-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-12">
          {/* Left — image */}
          <div>
            <div className="aspect-square w-full animate-pulse rounded-lg bg-surface-200 sm:aspect-[4/3] lg:aspect-square" />
            <div className="mt-3 flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-16 animate-pulse rounded-lg bg-surface-200 sm:h-20 sm:w-20" />
              ))}
            </div>
          </div>

          {/* Right — info */}
          <div className="space-y-4 lg:pt-1">
            <div className="h-3 w-24 animate-pulse rounded bg-surface-200" />
            <div className="space-y-2">
              <div className="h-8 w-3/4 animate-pulse rounded bg-surface-200" />
              <div className="h-8 w-1/2 animate-pulse rounded bg-surface-200" />
            </div>
            <div className="h-4 w-28 animate-pulse rounded bg-surface-200" />
            <div className="h-8 w-32 animate-pulse rounded bg-surface-200 pb-5" />

            <div className="space-y-3 border-t border-surface-100 pt-4">
              <div className="h-3 w-16 animate-pulse rounded bg-surface-200" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-20 animate-pulse rounded-lg bg-surface-200" />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <div className="hidden h-[52px] flex-1 animate-pulse rounded-lg bg-surface-200 lg:block" />
              <div className="hidden h-[52px] w-[52px] animate-pulse rounded-lg bg-surface-200 lg:block" />
            </div>

            <div className="grid grid-cols-3 gap-2 border-y border-surface-100 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-5 w-5 animate-pulse rounded-full bg-surface-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-surface-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar skeleton */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-300 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.14)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="h-12 w-[34%] animate-pulse rounded-lg bg-surface-200" />
          <div className="h-12 flex-1 animate-pulse rounded-lg bg-surface-200" />
          <div className="h-12 w-12 animate-pulse rounded-lg bg-surface-200" />
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const badgeLabels = {
  'Best Seller': 'الأكثر مبيعاً',
  New: 'جديد',
  Sale: 'تخفيض',
  'Low Stock': 'كمية محدودة',
};

function ProductInfoAccordion({ description, reviewSummary }) {
  const savedReviews = reviewSummary.localReviews;
  const publicReviews = customerReviews.map((review) => ({
    ...review,
    body: review.quote,
    verified: true,
  }));
  const reviews = [...savedReviews, ...publicReviews].slice(0, 4);

  return (
    <Accordion type="single" collapsible className="border-y border-surface-200">
      <AccordionItem value="description">
        <AccordionTrigger className="py-4 text-right font-arabic">
          تفاصيل المنتج
        </AccordionTrigger>
        <AccordionContent>
          <p className="pb-1 text-[14px] leading-7 text-ink-600" dir="auto">
            {description || 'سيتم إضافة تفاصيل هذا المنتج قريباً.'}
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="reviews" id="product-reviews">
        <AccordionTrigger className="py-4 text-right font-arabic">
          آراء العملاء
        </AccordionTrigger>
        <AccordionContent>
          <div className="pb-1">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-3xl font-bold leading-none text-ink-900">
                  {reviewSummary.average}
                </p>
                <p className="mt-1 text-[12px] text-ink-400">
                  من 5
                </p>
              </div>
              <RatingStars rating={reviewSummary.average} showCount={false} size="md" />
            </div>

            <div className="divide-y divide-surface-200">
              {reviews.map((review) => (
                <article
                  key={review.id || `${review.author}-${review.body}`}
                  className="py-4 first:pt-0"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <RatingStars rating={review.rating} showCount={false} size="sm" />
                    {review.verified && (
                      <span className="text-[10px] font-bold text-emerald-600">
                        شراء موثق
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] leading-6 text-ink-600" dir="auto">
                    {review.body}
                  </p>
                  <p className="mt-2 text-[11px] text-ink-400">
                    {review.author}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [modalActionType, setModalActionType] = useState('cart');
  const galleryRef = useRef(null);

  const addItem = useCartStore((state) => state.addItem);
  const { isWishlisted, toggleWishlist } = useWishlistStore();
  const toast = useToastStore((state) => state.toast);

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);

      try {
        const data = await api.getProduct(slug);
        if (cancelled) return;

        const variants = getProductVariants(data.product);
        setProduct(data.product);
        setRelated(data.related || []);
        setSelectedImage(0);
        setSelectedColor(null);
        setSelectedSize(variants.length === 1 ? variants[0] : null);
        setQuantity(1);
        api.logEvent('product_click', window.location.pathname, data.product.id);
      } catch (error) {
        if (cancelled) return;
        console.error('Error fetching product:', error);
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

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  // Show skeleton while loading — structured layout beats a blank spinner
  if (loading) return <ProductPageSkeleton />;


  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-5 pt-16 font-arabic" dir="rtl">
        <p className="text-2xl font-bold text-ink-900">المنتج غير موجود</p>
        <Button onClick={() => navigate('/shop')} variant="primary">
          العودة إلى المتجر
        </Button>
      </div>
    );
  }

  const images = getProductImages(product);
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
  const reviewSummary = getProductReviewSummary(product);
  const displayName = product.name_ar?.trim() || product.name;
  const displayDescription = product.description_ar?.trim() || product.description;
  const displayCategory = typeof product.category === 'object'
    ? product.category?.name
    : product.category;

  const goToImage = (index) => {
    setSelectedImage(index);
    const gallery = galleryRef.current;
    if (!gallery) return;

    gallery.scrollTo({
      left: gallery.clientWidth * index,
      behavior: 'smooth',
    });
  };

  const handleGalleryScroll = (event) => {
    const gallery = event.currentTarget;
    if (!gallery.clientWidth) return;

    const index = Math.round(gallery.scrollLeft / gallery.clientWidth);
    if (index >= 0 && index < images.length && index !== selectedImage) {
      setSelectedImage(index);
    }
  };

  const validatePurchaseOptions = (actionType = 'cart') => {
    if (isOutOfStock) {
      toast({
        title: 'المنتج غير متوفر',
        description: 'هذا المنتج غير متوفر حالياً.',
        variant: 'warning',
      });
      return false;
    }

    const needsColor = colors.length > 0 && selectedColor === null;
    const needsSize = !selectedSize;

    if (needsColor || needsSize) {
      if (needsColor) setColorError(true);
      if (needsSize) setSizeError(true);
      setModalActionType(actionType);
      setShowSelectionModal(true);
      return false;
    }

    return true;
  };

  const addCurrentSelectionToCart = () => {
    const localizedProduct = { ...product, name: displayName };
    const chosenColor = selectedColor !== null ? colors[selectedColor] : null;
    addItem(localizedProduct, quantity, chosenColor, selectedSize);
    api.logEvent('add_to_cart', window.location.pathname, product.id, {
      quantity,
      size: selectedSize,
      color: chosenColor,
    });
  };

  const handleAddToCart = () => {
    if (!validatePurchaseOptions('cart')) return;

    addCurrentSelectionToCart();
    setAddedToCart(true);
    toast({
      title: 'تمت الإضافة إلى السلة',
      description: `تمت إضافة ${quantity} من ${displayName}.`,
      variant: 'success',
    });
    window.setTimeout(() => setAddedToCart(false), 1000);
  };

  const handleBuyNow = () => {
    if (!validatePurchaseOptions('buy_now')) return;
    addCurrentSelectionToCart();
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
    toast({
      title: wishlisted ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة',
      description: displayName,
      variant: 'default',
    });
  };

  return (
    <div
      className="min-h-screen bg-white pb-32 pt-[92px] font-arabic text-ink-900 sm:pt-[108px] lg:pb-16"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="مسار التنقل" className="flex h-12 items-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-500 transition-colors hover:text-ink-900"
          >
            <ArrowRight size={16} aria-hidden="true" />
            العودة إلى المتجر
          </Link>
        </nav>

        <main className="grid items-start gap-6 pb-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-12">
          <section className="min-w-0 lg:sticky lg:top-28">

            {/* ── Desktop gallery: vertical thumbnail strip + main image ── */}
            <div className="hidden lg:flex lg:gap-3">

              {/* Thumbnail strip — all images always visible */}
              {images.length > 1 && (
                <div
                  className="flex flex-col gap-2 overflow-y-auto no-scrollbar"
                  style={{ maxHeight: 'min(520px, 70vh)' }}
                  aria-label="صور المنتج"
                >
                  {images.map((src, index) => (
                    <button
                      type="button"
                      key={src}
                      onClick={() => goToImage(index)}
                      aria-label={`عرض الصورة ${index + 1}`}
                      aria-pressed={selectedImage === index}
                      className={clsx(
                        'h-[78px] w-[78px] shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200',
                        selectedImage === index
                          ? 'border-ink-900 opacity-100 shadow-sm'
                          : 'border-transparent opacity-50 hover:opacity-90 hover:border-surface-300'
                      )}
                    >
                      <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="relative flex-1 overflow-hidden rounded-lg bg-surface-100" style={{ aspectRatio: '1 / 1' }}>
                {images.length > 0 ? (
                  <img
                    key={images[selectedImage]}
                    src={images[selectedImage]}
                    alt={`${displayName} - صورة ${selectedImage + 1}`}
                    fetchPriority="high"
                    className="h-full w-full object-cover object-center transition-opacity duration-200"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-[14px] text-ink-400">
                    صورة المنتج ستتوفر قريباً
                  </div>
                )}

                {product.badge && (
                  <div className="absolute right-3 top-3 z-10">
                    <Badge label={badgeLabels[product.badge] || product.badge} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  aria-label={wishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                  className="absolute left-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/90 text-ink-700 shadow-sm backdrop-blur-sm transition-transform active:scale-95"
                >
                  <Heart
                    size={19}
                    className={wishlisted ? 'fill-feedback-danger text-feedback-danger' : 'text-current'}
                    fill={wishlisted ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </div>

            {/* ── Mobile gallery: swipe carousel + horizontal thumbnails ── */}
            <div className="lg:hidden">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-100 sm:aspect-[4/3]">
                {images.length > 0 ? (
                  <div
                    ref={galleryRef}
                    onScroll={handleGalleryScroll}
                    className="flex h-full w-full touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-x-contain no-scrollbar"
                    dir="ltr"
                    aria-label="صور المنتج القابلة للسحب"
                  >
                    {images.map((src, index) => (
                      <img
                        key={src}
                        src={src}
                        alt={`${displayName} - صورة ${index + 1}`}
                        draggable="false"
                        fetchPriority={index === 0 ? 'high' : undefined}
                        loading={index === 0 ? undefined : 'lazy'}
                        className="h-full w-full shrink-0 snap-center object-cover object-center"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-[14px] text-ink-400">
                    صورة المنتج ستتوفر قريباً
                  </div>
                )}

                {product.badge && (
                  <div className="absolute right-3 top-3 z-10">
                    <Badge label={badgeLabels[product.badge] || product.badge} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  aria-label={wishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                  className="absolute left-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/90 text-ink-700 shadow-sm backdrop-blur-sm transition-transform active:scale-95"
                >
                  <Heart
                    size={19}
                    className={wishlisted ? 'fill-feedback-danger text-feedback-danger' : 'text-current'}
                    fill={wishlisted ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {/* Mobile horizontal thumbnails */}
              {images.length > 1 && (
                <div
                  className="mt-3 flex w-full justify-start gap-2 overflow-x-auto pb-1 no-scrollbar"
                  dir="rtl"
                  aria-label="صور المنتج"
                >
                  {images.map((src, index) => (
                    <button
                      type="button"
                      key={src}
                      onClick={() => goToImage(index)}
                      aria-label={`عرض الصورة ${index + 1}`}
                      aria-pressed={selectedImage === index}
                      className={clsx(
                        'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity sm:h-20 sm:w-20',
                        selectedImage === index
                          ? 'border-ink-900 opacity-100'
                          : 'border-transparent opacity-55 hover:opacity-100'
                      )}
                    >
                      <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

          </section>


          <section className="min-w-0 lg:pt-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-semibold text-ink-400">
                {displayCategory || 'منتجات مختارة'}
              </p>
              {isLowStock && (
                <p className="text-[12px] font-semibold text-feedback-warning">
                  بقي {stock} فقط
                </p>
              )}
              {isOutOfStock && (
                <p className="text-[12px] font-semibold text-feedback-danger">
                  غير متوفر
                </p>
              )}
            </div>

            <h1 className="mt-2 text-[28px] font-bold leading-[1.35] sm:text-[34px]">
              {displayName}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <RatingStars rating={reviewSummary.average} showCount={false} size="md" />
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-3 border-b border-surface-200 pb-5">
              <span className="text-[28px] font-extrabold leading-none">
                {formatPrice(price)}
              </span>
              {originalPrice && (
                <span className="text-[15px] text-ink-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              {savings > 0 && (
                <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                  وفر {savings}%
                </span>
              )}
            </div>

            <div className="space-y-5 py-5 text-right" dir="rtl">
               {colors.length > 0 && (
                <div>
                  <p className={clsx('mb-3 text-[13px] font-bold', colorError && 'text-feedback-danger')}>
                    {colorError ? 'اختر اللون للمتابعة' : 'اللون'}
                  </p>
                  <div className="flex items-center justify-start gap-3">
                    {colors.map((color, index) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => {
                          setSelectedColor(index);
                          setColorError(false);
                        }}
                        aria-label={`اختيار اللون ${index + 1}`}
                        aria-pressed={selectedColor === index}
                        className={clsx(
                          'relative grid h-9 w-9 place-items-center rounded-full border-2 border-white transition-transform',
                          selectedColor === index
                            ? 'scale-110 shadow-[0_0_0_2px_#09090b]'
                            : 'shadow-[0_0_0_1px_#d1d1d6]',
                          colorError && selectedColor !== index && 'border-feedback-danger ring-2 ring-feedback-danger/30'
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === index && (
                          <Check
                            size={14}
                            strokeWidth={3}
                            className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className={clsx('mb-3 text-[13px] font-bold', sizeError && 'text-feedback-danger')}>
                  {sizeError ? 'اختر النوع للمتابعة' : 'النوع'}
                </p>
                <RadioGroup
                  dir="rtl"
                  value={selectedSize || ''}
                  onValueChange={(value) => {
                    setSelectedSize(value);
                    setSizeError(false);
                  }}
                  className="flex flex-wrap justify-start gap-2 text-right"
                  aria-label="اختيار نوع المنتج"
                >
                  {variants.map((variant) => (
                    <RadioGroupItem
                      key={variant}
                      value={variant}
                      aria-label={`النوع ${variant}`}
                      className={clsx(
                        'min-h-12 min-w-[76px] px-4 font-arabic text-[14px]',
                        sizeError && selectedSize !== variant && 'border-feedback-danger'
                      )}
                    >
                      {variant}
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>

              <div className="text-right">
                <p className="mb-3 text-[13px] font-bold">الكمية</p>
                <div className="flex justify-start">
                  <div className="inline-flex h-11 items-center overflow-hidden rounded-lg border border-surface-200">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    aria-label="تقليل الكمية"
                    disabled={quantity <= 1 || isOutOfStock}
                    className="grid h-11 w-11 place-items-center text-ink-600 transition-colors hover:bg-surface-100 disabled:opacity-35"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center text-[15px] font-bold" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.min(stockLimit, current + 1))}
                    aria-label="زيادة الكمية"
                    disabled={quantity >= stockLimit || isOutOfStock}
                    className="grid h-11 w-11 place-items-center text-ink-600 transition-colors hover:bg-surface-100 disabled:opacity-35"
                  >
                    <Plus size={15} />
                  </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden grid-cols-[1fr_auto] gap-3 lg:grid">
              <Button
                variant="primary"
                size="xl"
                fullWidth
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="min-h-[52px] font-arabic text-[14px]"
              >
                {isOutOfStock ? 'غير متوفر' : `اشتر الآن - ${formatPrice(price * quantity)}`}
              </Button>
              <Button
                variant="secondary"
                size="xl"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                loading={addedToCart}
                aria-label="إضافة إلى السلة"
                className="h-[52px] w-[52px] px-0"
              >
                <ShoppingBag size={18} />
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-3 border-y border-surface-200 py-4">
              {[
                { icon: Truck, text: 'توصيل 24-48 ساعة' },
                { icon: Banknote, text: 'الدفع عند الاستلام' },
                { icon: RotateCcw, text: 'استبدال خلال 14 يوماً' },
              ].map(({ icon: Icon, text }, index) => (
                <div
                  key={text}
                  className={clsx(
                    'flex min-w-0 flex-col items-center gap-2 px-2 text-center',
                    index > 0 && 'border-r border-surface-200'
                  )}
                >
                  <Icon size={18} className="text-ink-700" aria-hidden="true" />
                  <p className="text-[10px] font-semibold leading-4 text-ink-500 sm:text-[11px]">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <ProductInfoAccordion
                description={displayDescription}
                reviewSummary={reviewSummary}
              />
            </div>
          </section>
        </main>

        {related.length > 0 && (
          <RecommendedProducts products={related} />
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 isolate border-t border-surface-300 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 text-ink-900 shadow-[0_-10px_30px_rgba(0,0,0,0.14)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 max-w-[34%] shrink-0">
            <p className="text-[10px] text-ink-400">المجموع</p>
            <p className="truncate text-[15px] font-extrabold leading-6 sm:text-[16px]">
              {formatPrice(price * quantity)}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="h-12 min-w-0 font-arabic text-[14px]"
          >
            {isOutOfStock ? 'غير متوفر' : 'اشتر الآن'}
          </Button>
          <a
            href="https://wa.me/212637408252"
            target="_blank"
            rel="noreferrer"
            aria-label="التواصل عبر واتساب"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#25d366] text-white shadow-sm transition-colors hover:bg-[#20bd5a]"
          >
            <FaWhatsapp size={22} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* ── Option Selection Modal ── */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          {/* Backdrop click closes modal */}
          <div className="absolute inset-0" onClick={() => setShowSelectionModal(false)} />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md animate-slide-up rounded-panel border border-surface-200 bg-white p-6 shadow-xl text-right" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-100 pb-3 mb-4">
              <h3 className="font-zain text-[24px] font-black text-ink-900">
                اختر مواصفات المنتج
              </h3>
              <button
                type="button"
                onClick={() => setShowSelectionModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-900 hover:bg-surface-100 transition-colors"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5">
              {/* Color Selector */}
              {colors.length > 0 && (
                <div>
                  <p className={clsx('mb-2 text-[13px] font-bold', colorError ? 'text-feedback-danger' : 'text-ink-600')}>
                    {colorError ? 'اختر اللون للمتابعة' : 'اللون'}
                  </p>
                  <div className="flex flex-wrap gap-2.5 justify-start">
                    {colors.map((color, index) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(index);
                          setColorError(false);
                        }}
                        className={clsx(
                          'relative grid h-9 w-9 place-items-center rounded-full border-2 border-white transition-transform',
                          selectedColor === index
                            ? 'scale-110 shadow-[0_0_0_2px_#09090b]'
                            : 'shadow-[0_0_0_1px_#d1d1d6]',
                          colorError && selectedColor !== index && 'border-feedback-danger ring-2 ring-feedback-danger/30'
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === index && (
                          <Check
                            size={14}
                            strokeWidth={3}
                            className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Type/Size Selector */}
              <div>
                <p className={clsx('mb-2 text-[13px] font-bold', sizeError ? 'text-feedback-danger' : 'text-ink-600')}>
                  {sizeError ? 'اختر النوع للمتابعة' : 'النوع'}
                </p>
                <RadioGroup
                  dir="rtl"
                  value={selectedSize || ''}
                  onValueChange={(value) => {
                    setSelectedSize(value);
                    setSizeError(false);
                  }}
                  className="flex flex-wrap justify-start gap-2"
                  aria-label="اختيار نوع المنتج في النافذة المنبثقة"
                >
                  {variants.map((variant) => (
                    <RadioGroupItem
                      key={variant}
                      value={variant}
                      aria-label={`النوع ${variant}`}
                      className={clsx(
                        'min-h-11 min-w-[76px] px-3 font-arabic text-[13px]',
                        sizeError && selectedSize !== variant && 'border-feedback-danger'
                      )}
                    >
                      {variant}
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>

              {/* Quantity Selector */}
              <div>
                <p className="mb-2 text-[13px] font-bold text-ink-600">الكمية</p>
                <div className="flex justify-start">
                  <div className="inline-flex h-10 items-center overflow-hidden rounded-lg border border-surface-200">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="grid h-10 w-10 place-items-center text-ink-600 hover:bg-surface-100 disabled:opacity-35"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-[14px] font-bold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.min(stockLimit, current + 1))}
                      disabled={isOutOfStock}
                      className="grid h-10 w-10 place-items-center text-ink-600 hover:bg-surface-100 disabled:opacity-35"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Button */}
            <div className="mt-6 pt-4 border-t border-surface-100">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  const needsColor = colors.length > 0 && selectedColor === null;
                  const needsSize = !selectedSize;

                  if (needsColor || needsSize) {
                    if (needsColor) setColorError(true);
                    if (needsSize) setSizeError(true);
                    return;
                  }
                  
                  setShowSelectionModal(false);
                  
                  const localizedProduct = { ...product, name: displayName };
                  const chosenColor = selectedColor !== null ? colors[selectedColor] : null;
                  addItem(localizedProduct, quantity, chosenColor, selectedSize);
                  api.logEvent('add_to_cart', window.location.pathname, product.id, {
                    quantity,
                    size: selectedSize,
                    color: chosenColor,
                  });

                  if (modalActionType === 'buy_now') {
                    navigate('/checkout');
                  } else {
                    setAddedToCart(true);
                    toast({
                      title: 'تمت الإضافة إلى السلة',
                      description: `تمت إضافة ${quantity} من ${displayName}.`,
                      variant: 'success',
                    });
                    window.setTimeout(() => setAddedToCart(false), 1000);
                  }
                }}
                className="h-12 font-zain text-[18px] font-black"
              >
                {modalActionType === 'buy_now' ? 'تأكيد وشراء الآن' : 'تأكيد وإضافة للسلة'}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
