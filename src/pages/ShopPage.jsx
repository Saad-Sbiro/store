// ─────────────────────────────────────────────
// FILE: src/pages/ShopPage.jsx
// Full product catalog with filters, search, sort
// ─────────────────────────────────────────────

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, Grid3X3, LayoutList, X } from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordion';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/Popover';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { Sheet, SheetContent, SheetTitle } from '../components/ui/Sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/Tooltip';

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: (i = 0) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price-low', label: 'السعر: من الأقل إلى الأعلى' },
  { value: 'price-high', label: 'السعر: من الأعلى إلى الأقل' },
  { value: 'rating', label: 'الأعلى تقييماً' },
  { value: 'name', label: 'أبجدياً' },
];

const CATEGORY_TRANSLATIONS = {
  'All': 'الكل',
  'Desk Accessories': 'ملحقات المكتب',
  'Home Appliances': 'أجهزة المنزل',
  'Peripherals': 'ملحقات الحاسوب',
  'Audio': 'الأجهزة الصوتية',
  'Lighting': 'الإضاءة',
  'Connectivity': 'أجهزة الاتصال',
};

const formatProductCount = (count) => {
  if (count === 0) return 'لا توجد منتجات';
  if (count === 1) return 'منتج واحد';
  if (count === 2) return 'منتجان';
  if (count >= 3 && count <= 10) return `${count} منتجات`;
  return `${count} منتج`;
};

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  useEffect(() => {
    // The URL is an external source that may change while this page stays mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.getProducts({ per_page: 100 }),
          api.getCategories(),
        ]);
        setProducts(productsRes?.data || productsRes || []);
        setCategories(categoriesRes || []);
      } catch (err) {
        console.error('Failed to load shop data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update URL params when category changes
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  // Filtered & sorted products
  const displayProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => {
        const catName = typeof p.category === 'object' ? p.category?.name : p.category;
        return catName === selectedCategory;
      });
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (typeof p.category === 'string' && p.category.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating':
        result.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default: // newest
        result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [products, selectedCategory, search, sortBy]);

  const categoryNames = ['All', ...categories.map((c) => c.name)];
  const activeSort = SORT_OPTIONS.find((option) => option.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="min-h-screen bg-surface-50" style={{ paddingTop: '108px' }} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ── */}
        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 text-right">
          <h1 className="font-zain font-black text-[38px] md:text-[46px] leading-tight text-ink-900">
            المتجر
          </h1>
          <p className="text-body text-ink-400 mt-1">
            {loading ? 'جاري تحميل المنتجات...' : formatProductCount(displayProducts.length)}
          </p>
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث عن المنتجات..."
              className="input-field pr-10 pl-4 text-right"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="input-field inline-flex min-w-[180px] items-center justify-between gap-3 pr-3 text-caption"
              >
                {activeSort.label}
                <ChevronDown size={14} className="text-ink-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[220px]">
              <div className="grid gap-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSortBy(opt.value)}
                    className={`rounded-[10px] px-3 py-2 text-right text-[13px] font-semibold transition-colors ${
                      sortBy === opt.value
                        ? 'bg-white text-ink-900'
                        : 'text-white/76 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* View toggle (desktop only) */}
          <div className="hidden sm:flex shrink-0 w-fit overflow-hidden rounded-btn border border-surface-200 bg-white">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="عرض الشبكة"
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-ink-900 text-white' : 'text-ink-400 hover:bg-surface-50'}`}
                >
                  <Grid3X3 size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>عرض الشبكة</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="عرض القائمة"
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-ink-900 text-white' : 'text-ink-400 hover:bg-surface-50'}`}
                >
                  <LayoutList size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>عرض القائمة</TooltipContent>
            </Tooltip>
          </div>

          {/* Mobile Filter & View Toggle Row */}
          <div className="flex sm:hidden items-center justify-between gap-3 w-full">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn border border-surface-200 text-caption font-medium text-ink-600 bg-white"
            >
              <SlidersHorizontal size={14} /> تصفية
            </button>

            <div className="flex shrink-0 w-fit overflow-hidden rounded-btn border border-surface-200 bg-white">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="عرض الشبكة"
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-ink-900 text-white' : 'text-ink-400 hover:bg-surface-50'}`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>عرض الشبكة</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="عرض القائمة"
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-ink-900 text-white' : 'text-ink-400 hover:bg-surface-50'}`}
                  >
                    <LayoutList size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>عرض القائمة</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </motion.div>

        {/* ── Category Filters ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mb-8 hidden flex-wrap gap-2 sm:flex"
        >
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-pill text-caption font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-ink-900 text-white shadow-sm'
                  : 'bg-white text-ink-600 border border-surface-200 hover:border-ink-400 hover:text-ink-900'
              }`}
            >
              {CATEGORY_TRANSLATIONS[cat] || cat}
            </button>
          ))}
        </motion.div>

        {/* ── Product Grid ── */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="bottom" className="sm:hidden" dir="rtl">
            <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4">
              <div className="text-right">
                <SheetTitle className="font-hero text-xl font-bold text-ink-900">
                  تصفية
                </SheetTitle>
                <p className="mt-1 text-caption text-ink-400">{formatProductCount(displayProducts.length)}</p>
              </div>
            </div>

            <div className="max-h-[calc(86vh-76px)] overflow-y-auto px-5 py-4 text-right">
              <Accordion type="single" collapsible defaultValue="categories">
                <AccordionItem value="categories">
                  <AccordionTrigger className="text-right">الفئات</AccordionTrigger>
                  <AccordionContent>
                    <RadioGroup
                      value={selectedCategory}
                      onValueChange={(value) => handleCategoryChange(value)}
                      className="grid grid-cols-2 gap-2 pb-2"
                    >
                      {categoryNames.map((cat) => (
                        <RadioGroupItem
                          key={cat}
                          value={cat}
                          aria-label={`تصفية حسب ${CATEGORY_TRANSLATIONS[cat] || cat}`}
                          className="min-h-[44px] justify-center rounded-pill px-3 text-[12px]"
                        >
                          {CATEGORY_TRANSLATIONS[cat] || cat}
                        </RadioGroupItem>
                      ))}
                    </RadioGroup>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sort">
                  <AccordionTrigger className="text-right">الترتيب</AccordionTrigger>
                  <AccordionContent>
                    <RadioGroup
                      value={sortBy}
                      onValueChange={setSortBy}
                      className="grid gap-2 pb-2"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <RadioGroupItem
                          key={option.value}
                          value={option.value}
                          aria-label={`الترتيب حسب ${option.label}`}
                          className="min-h-[44px] justify-start rounded-btn px-4 text-[12px]"
                        >
                          {option.label}
                        </RadioGroupItem>
                      ))}
                    </RadioGroup>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="mt-5 h-12 w-full rounded-btn bg-ink-900 text-caption font-semibold uppercase tracking-[0.14em] text-white"
              >
                تطبيق
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-ink-400" />
            </div>
            <h3 className="font-hero text-lg font-bold text-ink-900 mb-1">لم يتم العثور على منتجات</h3>
            <p className="text-caption text-ink-400">يرجى محاولة تعديل كلمات البحث أو الفئات المحددة.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="mt-4 text-caption font-semibold text-brand-500 hover:text-brand-600"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
            {displayProducts.map((product, i) => (
              <motion.div key={product.id} variants={fadeUp} initial="hidden" animate="visible" custom={i % 8}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
