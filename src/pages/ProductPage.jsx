// ─────────────────────────────────────────────
// FILE: src/pages/ProductPage.jsx
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Check, Heart, ShoppingBag, ChevronRight, Minus, Plus,
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
import RingLoader from '../components/ui/RingLoader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordion';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { useToastStore } from '../store/useToastStore';
import { getProductReviewSummary } from '../utils/reviews';
import { customerReviews } from '../data/reviews';
import { products } from '../data/products';
import RecommendedProducts from '../components/ui/RecommendedProducts';

// ─── Tab component ───────────────────────────
function ProductInfoAccordion({ product, reviewSummary }) {
  const tags = getProductTags(product);
  const savedReviews = reviewSummary.localReviews;
  const publicReviews = customerReviews.map((review) => ({
    ...review,
    body: review.quote,
    verified: true,
  }));
  const reviews = [...savedReviews, ...publicReviews];

  return (
    <Accordion type="multiple" defaultValue={['description']} className="rounded-card border border-surface-200 bg-white px-4">
      <AccordionItem value="description">
        <AccordionTrigger>Description</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pb-2">
            <p className="text-body leading-relaxed text-ink-600">{product.description}</p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1 text-[12px] font-semibold capitalize text-ink-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-card bg-surface-50 p-4">
                <p className="text-btn font-semibold text-ink-900">Livraison</p>
                <p className="mt-1 text-caption leading-relaxed text-ink-500">
                  Livraison estimee entre 24 et 48 heures dans les grandes villes du Maroc.
                </p>
              </div>
              <div className="rounded-card bg-surface-50 p-4">
                <p className="text-btn font-semibold text-ink-900">Retours</p>
                <p className="mt-1 text-caption leading-relaxed text-ink-500">
                  Retour possible sous 14 jours si le produit est non utilise et garde son emballage d'origine.
                </p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="specifications">
        <AccordionTrigger>Details techniques</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 pb-2">
            {[
              ['Marque', 'CUTPORTAL'],
              ['Garantie', 'Garantie fabricant de 2 ans'],
              ['Connectivite', 'USB-C / Bluetooth / Wi-Fi'],
              ['Poids', 'Selon le modele'],
              ['Materiaux', 'Aluminium premium et ABS'],
              ['Dans la boite', 'Produit, cable USB-C, manuel'],
            ].map(([key, val]) => (
              <div key={key} className="flex flex-col gap-1 border-b border-surface-100 py-2 last:border-0 sm:flex-row sm:items-start sm:gap-4">
                <span className="text-caption text-ink-400 sm:w-32 sm:shrink-0">{key}</span>
                <span className="text-body text-ink-900">{val}</span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="reviews" id="product-reviews">
        <AccordionTrigger>Avis</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 pb-2 sm:space-y-5">
            <div className="flex items-center gap-4 rounded-card bg-surface-50 p-3 sm:rounded-panel sm:p-4">
              <div className="text-center">
                <p className="text-[32px] font-bold leading-none text-ink-900 sm:text-[40px]">{reviewSummary.average}</p>
                <RatingStars rating={reviewSummary.average} showCount={false} size="sm" />
                <p className="mt-1 text-caption text-ink-400">{reviewSummary.count} avis</p>
              </div>
            </div>
            {reviews.map((review) => (
              <div key={review.id || `${review.author}-${review.body}`} className="rounded-card border border-surface-200 bg-surface-50 p-3 last:border-surface-200 sm:p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <RatingStars rating={review.rating} showCount={false} size="sm" />
                  {review.title && <span className="text-caption text-ink-400">{review.title}</span>}
                  {review.verified && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                      Verifie
                    </span>
                  )}
                </div>
                <p className="text-[13px] leading-relaxed text-ink-600 sm:text-body">{review.body}</p>
                <p className="mt-2 text-caption text-ink-400">- {review.author}, Achat verifie</p>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
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
  const { isWishlisted, toggleWishlist } = useWishlistStore();
  const toast = useToastStore((s) => s.toast);



  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);

      try {
        const data = await api.getProduct(slug);
        if (cancelled) return;

        setProduct(data.product);
        setRelated(products.filter((p) => String(p.id) !== String(data.product.id)));
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
          <RingLoader className="h-24 w-24" />
          <p className="text-body text-ink-600 font-medium">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-16 bg-surface-0">
        <p className="text-section font-display text-ink-900">Produit introuvable</p>
        <Button onClick={() => navigate('/')} variant="primary" id="not-found-back">
          Retour a l'accueil
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
  const reviewSummary = getProductReviewSummary(product);

  const validatePurchaseOptions = () => {
    if (isOutOfStock) {
      toast({
        title: 'Rupture de stock',
        description: `${product.name} est indisponible pour le moment.`,
        variant: 'warning',
      });
      return false;
    }

    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      toast({
        title: 'Variante requise',
        description: "Choisis une variante avant d'ajouter ce produit au panier.",
        variant: 'warning',
      });
      return false;
    }

    return true;
  };

  const addCurrentSelectionToCart = () => {
    addItem(product, quantity, colors[selectedColor] || colors[0], selectedSize);
    api.logEvent('add_to_cart', window.location.pathname, product.id, { quantity, size: selectedSize, color: colors[selectedColor] || colors[0] });
  };

  const handleAddToCart = () => {
    if (!validatePurchaseOptions()) return;

    addCurrentSelectionToCart();
    setAddedToCart(true);

    toast({
      title: 'Ajoute au panier',
      description: `${quantity}x ${product.name} a ete ajoute au panier.`,
      variant: 'success',
    });
    setTimeout(() => {
      setAddedToCart(false);
    }, 1000);
  };

  const handleBuyNow = () => {
    if (!validatePurchaseOptions()) return;

    addCurrentSelectionToCart();
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
    const isNowWishlisted = !wishlisted;
    toast({
      title: isNowWishlisted ? 'Ajoute aux favoris' : 'Retire des favoris',
      description: isNowWishlisted
        ? `${product.name} est maintenant dans tes favoris.`
        : `${product.name} a ete retire des favoris.`,
      variant: 'default',
    });
  };

  return (
    <div className="min-h-screen bg-surface-0 pt-[92px] sm:pt-[108px]">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 overflow-x-auto text-caption text-ink-400 no-scrollbar">
          <Link to="/" id="breadcrumb-home" className="shrink-0 hover:text-ink-600 transition-colors">Accueil</Link>
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
                    Image du produit bientot disponible
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
                aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
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
                  aria-label={`Voir l'image ${i + 1}`}
                  className={clsx(
                    'aspect-square rounded-card overflow-hidden border-2 transition-all duration-200',
                    selectedImage === i
                      ? 'border-ink-900 opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-surface-300'
                  )}
                >
                  <img
                    src={src}
                    alt={`${product.name} vignette ${i + 1}`}
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
                  Plus que {stock} en stock
                </span>
              </motion.div>
            )}
            {isOutOfStock && (
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-1.5 text-caption font-medium text-feedback-danger bg-feedback-danger/10 px-3 py-1.5 rounded-tag border border-feedback-danger/20">
                  Rupture de stock
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
              <RatingStars rating={reviewSummary.average} reviewCount={reviewSummary.count} size="md" />
              <span className="text-caption text-ink-400">|</span>
              <button
                id="pdp-view-reviews"
                onClick={() => document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="text-caption text-brand-500 hover:text-brand-600 underline underline-offset-2 transition-colors"
              >
                Lire les avis
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
                      Economisez {savings} %
                    </span>
                  )}
                </>
              )}
            </motion.div>

            {/* Color selector */}
            <motion.div variants={fadeUp}>
              <p className="text-btn font-semibold text-ink-900 mb-3">
                Couleur
                <span className="ml-2 text-ink-400 font-normal capitalize">
                  {colors.map((_, i) => ['Noir', 'Argent', 'Bleu marine'][i])[selectedColor] || `Option ${selectedColor + 1}`}
                </span>
              </p>
              <div className="flex items-center gap-3">
                {colors.map((color, i) => (
                  <button
                    key={i}
                    id={`pdp-color-${i}`}
                    onClick={() => setSelectedColor(i)}
                    aria-label={`${selectedColor === i ? 'Couleur selectionnee' : 'Choisir la couleur'} ${['Noir', 'Argent', 'Bleu marine'][i] || `Option ${i + 1}`}`}
                    aria-pressed={selectedColor === i}
                    className={clsx(
                      'relative grid h-10 w-10 place-items-center rounded-pill border-[3px] transition-all duration-200',
                      selectedColor === i
                        ? 'scale-110 border-white shadow-[0_0_0_2px_#111111,0_12px_24px_rgba(17,17,17,0.18)]'
                        : 'border-white shadow-[0_0_0_1px_rgba(17,17,17,0.14)] hover:scale-105 hover:shadow-[0_0_0_2px_rgba(17,17,17,0.36)]'
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === i && (
                      <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-ink-900 text-white shadow-sm">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Size selector */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <p className={clsx('text-btn font-semibold', sizeError ? 'text-feedback-danger' : 'text-ink-900')}>
                  {sizeError ? 'Choisis une variante' : 'Variante'}
                </p>
                <button
                  id="pdp-size-guide"
                  className="text-caption text-brand-500 hover:text-brand-600 underline underline-offset-2 transition-colors"
                >
                  Guide specs
                </button>
              </div>
              <RadioGroup
                value={selectedSize || ''}
                onValueChange={(value) => { setSelectedSize(value); setSizeError(false); }}
                className="flex flex-wrap gap-2"
                aria-label="Choisir une variante produit"
              >
                {variants.map((size) => (
                  <RadioGroupItem
                    key={size}
                    id={`pdp-size-${size}`}
                    value={size}
                    aria-label={`Variante ${size}`}
                    className={clsx(
                      'product-variant-option min-w-[56px]',
                      sizeError && selectedSize !== size && 'product-variant-option--error'
                    )}
                  >
                    {size}
                  </RadioGroupItem>
                ))}
              </RadioGroup>
            </motion.div>

            {/* Quantity */}
            <motion.div variants={fadeUp}>
              <p className="text-btn font-semibold text-ink-900 mb-3">Quantite</p>
              <div className="inline-flex items-center border border-surface-200 rounded-btn overflow-hidden">
                <button
                  id="pdp-qty-minus"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Diminuer la quantite"
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-11 h-11 flex items-center justify-center text-ink-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <Minus size={15} />
                </button>
                <span
                  className="w-12 text-center text-[16px] font-semibold text-ink-900"
                  aria-live="polite"
                  aria-label={`Quantite: ${quantity}`}
                >
                  {quantity}
                </span>
                <button
                  id="pdp-qty-plus"
                  onClick={() => setQuantity((q) => Math.min(stockLimit, q + 1))}
                  aria-label="Augmenter la quantite"
                  disabled={quantity >= stockLimit || isOutOfStock}
                  className="w-11 h-11 flex items-center justify-center text-ink-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <Plus size={15} />
                </button>
              </div>
            </motion.div>

            {/* Purchase actions */}
            <motion.div variants={fadeUp} className="space-y-3 pt-2">
              <Button
                id="pdp-buy-now"
                variant="primary"
                size="xl"
                fullWidth
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="h-auto min-h-[52px] whitespace-normal px-4 py-3 text-center text-[14px] leading-tight sm:text-[15px]"
              >
                {isOutOfStock ? 'Rupture de stock' : `Acheter - ${formatPrice(price * quantity)}`}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  id="pdp-add-to-cart"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  loading={addedToCart}
                  leftIcon={!addedToCart ? <ShoppingBag size={16} /> : undefined}
                  className="h-11 px-3 text-[13px]"
                >
                  {addedToCart ? 'Ajoute' : 'Ajouter'}
                </Button>

                <Button
                  id="pdp-wishlist-btn"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleWishlistToggle}
                  leftIcon={<Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />}
                  className="h-11 px-3 text-[13px]"
                >
                  {wishlisted ? 'Favori' : 'Favoris'}
                </Button>
              </div>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 gap-3 pt-2 border-t border-surface-200 sm:grid-cols-3"
            >
              {[
                { icon: Truck,     text: 'Livraison 24 a 48 h' },
                { icon: RotateCcw, text: 'Retours sous 14 jours' },
                { icon: Shield,    text: 'Garantie 2 ans' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-card bg-surface-50">
                  <Icon size={18} className="text-brand-500" />
                  <p className="text-[11px] text-ink-600 leading-tight">{text}</p>
                </div>
              ))}
            </motion.div>

            {/* Product info */}
            <motion.div variants={fadeUp} className="pt-2">
              <ProductInfoAccordion product={product} reviewSummary={reviewSummary} />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-surface-200 sm:mt-20 sm:pt-16">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
            >
              <RecommendedProducts products={related} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}