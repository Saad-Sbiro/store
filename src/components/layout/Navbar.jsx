// ─────────────────────────────────────────────
// FILE: src/components/layout/Navbar.jsx
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, X, ChevronRight, ArrowUpRight, Star } from 'lucide-react';

import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAdminStore } from '../../store/useAdminStore';
import logoImg from '../../assets/logo.png';
import { useScrollY } from '../../hooks/useScrollY';
import { getPendingReviewOrders } from '../../utils/reviews';
import CartDrawer from '../ui/CartDrawer';
import ExpandableSearchBar from '../ui/ExpandableSearchBar';
import { Sheet, SheetContent, SheetTitle } from '../ui/Sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
import clsx from 'clsx';

// ─── Mega-menu data ───────────────────────────
const SHOP_MENU = {
  categories: [
    { label: 'All Products',     sub: 'Browse everything',   href: '/shop' },
    { label: 'Desk Accessories', sub: 'Ergonomic setup',      href: '/shop?category=Desk+Accessories' },
    { label: 'Home Appliances',  sub: 'Comfort devices',      href: '/shop?category=Home+Appliances' },
    { label: 'Peripherals',      sub: 'Input tools',          href: '/shop?category=Peripherals' },
    { label: 'Audio',            sub: 'Sound gear',           href: '/shop?category=Audio' },
    { label: 'Lighting',         sub: 'Focus lights',         href: '/shop?category=Lighting' },
    { label: 'Connectivity',     sub: 'Hubs & docks',         href: '/shop?category=Connectivity' },
  ],
  cards: [
    {
      label: 'Top Picks',
      bgColor: '#171717',
      textColor: '#ffffff',
      links: [
        { label: 'New Arrivals', ariaLabel: 'Shop new arrivals', href: '/shop' },
        { label: 'Best Sellers', ariaLabel: 'Shop best sellers', href: '/shop' },
      ],
    },
    {
      label: 'Workspace',
      bgColor: '#eef2f4',
      textColor: '#111111',
      links: [
        { label: 'Desk Accessories', ariaLabel: 'Shop desk accessories', href: '/shop?category=Desk+Accessories' },
        { label: 'Peripherals', ariaLabel: 'Shop peripherals', href: '/shop?category=Peripherals' },
        { label: 'Connectivity', ariaLabel: 'Shop connectivity', href: '/shop?category=Connectivity' },
      ],
    },
    {
      label: 'Atmosphere',
      bgColor: '#d6c9bd',
      textColor: '#111111',
      links: [
        { label: 'Audio', ariaLabel: 'Shop audio', href: '/shop?category=Audio' },
        { label: 'Lighting', ariaLabel: 'Shop lighting', href: '/shop?category=Lighting' },
        { label: 'Home Appliances', ariaLabel: 'Shop home appliances', href: '/shop?category=Home+Appliances' },
      ],
    },
  ],
  cta: 'Shop all',
  featured: {
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=82',
    label: 'Ergonomic Monitor Stand',
    sub:   'Aluminum USB-C hub',
    href:  '/product/ergonomic-monitor-stand',
  },
};

const COLLECTIONS_MENU = {
  categories: [
    { label: 'Workspace Setup', sub: 'Desk-ready tools',      href: '/shop?category=Desk+Accessories' },
    { label: 'Creator Audio',   sub: 'Listening & focus',     href: '/shop?category=Audio' },
    { label: 'Home Comfort',    sub: 'Cooling & lighting',    href: '/shop?category=Home+Appliances' },
    { label: 'All Products',    sub: 'Browse everything',     href: '/shop' },
  ],
  cards: [
    {
      label: 'Workstation',
      bgColor: '#f4f4f5',
      textColor: '#111111',
      links: [
        { label: 'Desk Setup', ariaLabel: 'Shop desk setup', href: '/shop?category=Desk+Accessories' },
        { label: 'Peripherals', ariaLabel: 'Shop peripherals', href: '/shop?category=Peripherals' },
      ],
    },
    {
      label: 'Creator',
      bgColor: '#171717',
      textColor: '#ffffff',
      links: [
        { label: 'Audio Gear', ariaLabel: 'Shop audio gear', href: '/shop?category=Audio' },
        { label: 'Keyboards', ariaLabel: 'Shop mechanical keyboards', href: '/shop?category=Peripherals' },
      ],
    },
    {
      label: 'Comfort',
      bgColor: '#c9d3d7',
      textColor: '#111111',
      links: [
        { label: 'Cooling', ariaLabel: 'Shop cooling products', href: '/shop?category=Home+Appliances' },
        { label: 'Lighting', ariaLabel: 'Shop lighting', href: '/shop?category=Lighting' },
      ],
    },
  ],
  cta: 'View collections',
  featured: {
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=82',
    label: 'Desk Setup Edit',
    sub:   'Keyboards, docks, lighting',
    href:  '/shop',
  },
};

const NAV_ITEMS = [
  { label: 'Shop',        menu: SHOP_MENU        },
  { label: 'Collections', menu: COLLECTIONS_MENU },
  { label: 'About',       href: '/about',   menu: null },
  { label: 'Contact',     href: '/contact',  menu: null },
];

// ─── Sub-components ───────────────────────────

/** Thin announcement bar above the main nav */
function AnnouncementBar({ visible, text, onDismiss }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="announcement"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 36, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-ink-900 overflow-hidden shrink-0"
        >
          <div className="h-9 flex items-center justify-center px-8 relative">
            <p className="max-w-full truncate px-8 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-white/70 sm:text-[11px] sm:tracking-[0.18em]">
              {text}
            </p>
            <button
              onClick={onDismiss}
              aria-label="Dismiss announcement"
              className="absolute right-4 text-white/30 hover:text-white/70 transition-colors duration-200"
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Compact CardNav-style hover menu */
function CardMegaMenu({ data }) {
  const siteSettings = useAdminStore((s) => s.siteSettings);
  return (
    <div className="absolute top-full left-1/2 z-50 w-[min(820px,calc(100vw-2rem))] -translate-x-1/2 pt-3">
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.985 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[8px] border border-surface-200 bg-white shadow-xl"
      >
        <div className="h-[60px] px-4 flex items-center justify-between border-b border-surface-200">
          <div className="flex items-center gap-0.5">
            <img src={logoImg} alt="Cutportal Logo" className="h-5 w-auto object-contain" draggable="false" />
            <span className="font-clash font-black text-[20px] tracking-wide text-ink-900 uppercase">utportal</span>
          </div>
          <Link
            to={data.featured.href}
            className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-ink-900 px-4 text-[12px] font-semibold uppercase tracking-[0.13em] text-white hover:bg-ink-600 transition-colors"
          >
            {data.cta}
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 p-3">
          {data.cards.map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 + idx * 0.06, duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[172px] rounded-[6px] p-4 flex flex-col"
              style={{ backgroundColor: card.bgColor, color: card.textColor }}
            >
              <p className="font-display text-[25px] leading-none">{card.label}</p>
              <div className="mt-auto flex flex-col gap-1.5">
                {card.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    aria-label={link.ariaLabel}
                    className="group/link inline-flex items-center gap-1.5 text-[14px] font-medium opacity-90 hover:opacity-70 transition-opacity"
                  >
                    <ArrowUpRight
                      size={14}
                      className="shrink-0 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                    />
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/** Animated hamburger → X icon */
function HamburgerIcon({ open }) {
  return (
    <div className="w-5 h-4 flex flex-col justify-between" aria-hidden="true">
      <motion.span
        animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="block h-[1.5px] w-full bg-current origin-center"
      />
      <motion.span
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
        className="block h-[1.5px] w-full bg-current"
      />
      <motion.span
        animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="block h-[1.5px] w-full bg-current origin-center"
      />
    </div>
  );
}

/** Search overlay */
function SearchOverlay({ open, onClose }) {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const handleSearchSubmit = (query) => {
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetContent side="top" className="h-[min(82vh,560px)] max-h-none bg-white/96 backdrop-blur-2xl">
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center px-6 pt-14 sm:px-10">
          <SheetTitle className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">
            Search
          </SheetTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit(inputRef.current?.value || '');
            }}
            className="relative w-full"
          >
            <input
              ref={inputRef}
              id="search-input"
              type="text"
              placeholder="What are you looking for?"
              className="w-full bg-transparent border-b-2 border-ink-200 focus:border-ink-900 pb-4 pr-10 text-[28px] font-display font-normal text-ink-900 placeholder-ink-300 outline-none transition-colors duration-300 sm:text-[36px]"
            />
            <button
              type="submit"
              className="absolute bottom-5 right-0 text-ink-400 transition-colors hover:text-ink-900"
              aria-label="Submit search"
            >
              <Search size={22} />
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Component ───────────────────────────
export default function Navbar() {
  const scrollY = useScrollY();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu]       = useState(null); // which mega menu is open
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [dismissedAnnouncementKey, setDismissedAnnouncementKey] = useState('');
  const [mobileExpanded, setMobileExpanded]    = useState(null);
  const closeTimer = useRef(null);

  const siteSettings = useAdminStore((s) => s.siteSettings);
  const toggleCart   = useCartStore((s) => s.toggleOpen);
  const totalItems   = useCartStore((s) => s.totalItems());
  const totalWish    = useWishlistStore((s) => s.totalWishlisted());
  const hasOrders    = getPendingReviewOrders().length > 0;

  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrolled = !isHome || scrollY > 80;
  const navScrollProgress = Math.min(Math.max(scrollY / 180, 0), 1);
  const navEase = 1 - Math.pow(1 - navScrollProgress, 3);
  const navBgAlpha = !isHome ? 0.48 : (navEase * 0.46);
  const navBlur = !isHome ? 20 : (navEase * 18);
  const navShadowAlpha = !isHome ? 0.14 : (navEase * 0.14);
  const announcementText = siteSettings.announcementBar?.trim();
  const announcementKey = `${siteSettings.showAnnouncementBar ? 'on' : 'off'}:${announcementText || ''}`;
  const announcementVisible = Boolean(
    siteSettings.showAnnouncementBar && announcementText && dismissedAnnouncementKey !== announcementKey
  );

  // Close mega menu on scroll
  useEffect(() => {
    if (!scrolled) return undefined;
    const frame = requestAnimationFrame(() => setActiveMenu(null));
    return () => cancelAnimationFrame(frame);
  }, [scrolled]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = (mobileOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  // Close mobile on resize
  useEffect(() => {
    const h = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Hover intent for mega menus
  const handleMouseEnter = (label) => {
    clearTimeout(closeTimer.current);
    setActiveMenu(label);
  };
  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  };

  const handleInlineSearch = (query) => {
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setActiveMenu(null);
  };

  return (
    <>
      {/* ══ WRAPPER — stacks announcement bar + nav ══ */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">

        {/* ── Announcement bar ── */}
        <AnnouncementBar
          visible={announcementVisible}
          text={announcementText}
          onDismiss={() => setDismissedAnnouncementKey(announcementKey)}
        />

        {/* ── Main navbar ── */}
        <header
          className={clsx(
            'relative text-white transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500',
            !scrolled && 'mix-blend-difference',
            scrolled
              ? 'border-b border-white/10'
              : 'bg-transparent border-b border-white/10'
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
            backgroundColor: `rgba(10, 10, 10, ${navBgAlpha})`,
            backdropFilter: `blur(${navBlur}px)`,
            WebkitBackdropFilter: `blur(${navBlur}px)`,
            boxShadow: `0 14px 34px rgba(0, 0, 0, ${navShadowAlpha})`,
          }}
        >
          <div className="max-w-7xl mx-auto h-16 px-5 sm:px-8 lg:px-12 flex items-center">

            {/* ── Logo (left) ── */}
            <div className="flex-1 flex items-center">
              <Link
                to="/"
                id="nav-logo"
                aria-label="Cutportal - Home"
                className="flex items-center gap-0.5 text-white"
              >
                <img src={logoImg} alt="Cutportal Logo" className="h-6 w-auto object-contain brightness-0 invert" draggable="false" />
                <span className="font-clash font-black text-[21px] tracking-wide uppercase">
                  utportal
                </span>
              </Link>
            </div>

            {/* ── Desktop navigation (center) ── */}
            <nav
              className="hidden lg:flex items-center gap-0"
              aria-label="Main navigation"
              onMouseLeave={handleMouseLeave}
            >
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.menu ? handleMouseEnter(item.label) : null}
                >
                  <Link
                    to={item.href ?? '/'}
                    id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    className="relative flex items-center gap-1 px-5 h-16 text-[12px] font-medium uppercase tracking-[0.14em] text-white hover:text-white/70 transition-colors duration-200"
                  >
                    {item.label}
                    {/* Active underline */}
                    {activeMenu === item.label && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-5 right-5 h-[2px] bg-white"
                      />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* ── Actions (right) ── */}
            <div className="flex-1 flex items-center justify-end gap-1">

              {/* Search */}
              <ExpandableSearchBar onSearch={handleInlineSearch} />

              {/* Reviews — only shown after the user has placed an order */}
              {hasOrders && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/reviews"
                      id="nav-reviews"
                      aria-label="My reviews"
                      className="relative w-10 h-10 flex items-center justify-center transition-all duration-200 text-white hover:bg-white/10 rounded"
                    >
                      <Star size={17} strokeWidth={1.75} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>My reviews</TooltipContent>
                </Tooltip>
              )}

              {/* Wishlist */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/wishlist"
                    id="nav-wishlist"
                    aria-label={`Wishlist (${totalWish} items)`}
                    className="relative w-10 h-10 flex items-center justify-center transition-all duration-200 text-white hover:bg-white/10 rounded"
                  >
                    <Heart size={17} strokeWidth={1.75} />
                    <AnimatePresence>
                      {totalWish > 0 && (
                        <motion.span
                          key="wish-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-pill bg-feedback-danger text-white text-[9px] font-bold flex items-center justify-center leading-none"
                        >
                          {totalWish}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Wishlist</TooltipContent>
              </Tooltip>

              {/* Cart */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    id="nav-cart"
                    onClick={toggleCart}
                    aria-label={`Cart (${totalItems} items)`}
                    className="relative w-10 h-10 flex items-center justify-center transition-all duration-200 text-white hover:bg-white/10 rounded"
                  >
                    <ShoppingBag size={17} strokeWidth={1.75} />
                    <AnimatePresence>
                      {totalItems > 0 && (
                        <motion.span
                          key="cart-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-pill bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center leading-none"
                        >
                          {totalItems}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Cart</TooltipContent>
              </Tooltip>

              {/* Mobile hamburger */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    id="nav-hamburger"
                    onClick={() => setMobileOpen((o) => !o)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                    className="lg:hidden w-10 h-10 flex items-center justify-center transition-all duration-200 text-white hover:bg-white/10 rounded"
                  >
                    <HamburgerIcon open={mobileOpen} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{mobileOpen ? 'Close menu' : 'Open menu'}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* ── Mega menu (rendered outside header to avoid mix-blend-difference) ── */}
        <AnimatePresence>
          {activeMenu && (() => {
            const item = NAV_ITEMS.find((i) => i.label === activeMenu);
            return item?.menu ? (
              <div
                key={activeMenu}
                onMouseEnter={() => clearTimeout(closeTimer.current)}
                onMouseLeave={handleMouseLeave}
              >
                <CardMegaMenu data={item.menu} />
              </div>
            ) : null;
          })()}
        </AnimatePresence>
      </div>

      {/* ══ MOBILE FULL-SCREEN MENU ══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-ink-900/50 backdrop-blur-sm lg:hidden"
            />

            {/* Panel */}
            <motion.div
              key="mobile-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[360px] bg-white flex flex-col lg:hidden"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-surface-100 shrink-0">
                <span className="font-comico text-[19px] tracking-wide text-ink-900">
                  {siteSettings.storeName}
                </span>
                <button
                  id="mobile-close"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="w-9 h-9 flex items-center justify-center text-ink-400 hover:text-ink-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto" aria-label="Mobile navigation">
                {NAV_ITEMS.map((item, i) => (
                  <div key={item.label} className="border-b border-surface-100">
                    {item.menu ? (
                      <>
                        <button
                          id={`mobile-nav-${item.label.toLowerCase()}`}
                          onClick={() =>
                            setMobileExpanded((p) => (p === item.label ? null : item.label))
                          }
                          className="w-full flex items-center justify-between px-6 py-5 text-left"
                        >
                          <motion.span
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="text-[16px] font-medium text-ink-900"
                          >
                            {item.label}
                          </motion.span>
                          <motion.span
                            animate={{ rotate: mobileExpanded === item.label ? 90 : 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <ChevronRight size={16} className="text-ink-400" />
                          </motion.span>
                        </button>

                        <AnimatePresence>
                          {mobileExpanded === item.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden bg-surface-50"
                            >
                              {item.menu.categories.map((cat) => (
                                <Link
                                  key={cat.label}
                                  to={cat.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center justify-between px-8 py-3.5 hover:bg-surface-100 transition-colors group"
                                >
                                  <div>
                                    <p className="text-[14px] font-medium text-ink-900 group-hover:text-brand-500 transition-colors">
                                      {cat.label}
                                    </p>
                                    <p className="text-[11px] text-ink-400">{cat.sub}</p>
                                  </div>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.href ?? '/'}
                        onClick={() => setMobileOpen(false)}
                        id={`mobile-nav-${item.label.toLowerCase()}`}
                        className="flex items-center px-6 py-5"
                      >
                        <motion.span
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="text-[16px] font-medium text-ink-900 hover:text-brand-500 transition-colors"
                        >
                          {item.label}
                        </motion.span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Mobile footer */}
              <div className="px-6 py-6 border-t border-surface-100 space-y-4 shrink-0">
                <button
                  onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                  className="w-full flex items-center gap-3 text-[13px] text-ink-600 hover:text-ink-900 transition-colors"
                >
                  <Search size={16} strokeWidth={1.75} />
                  Search products
                </button>
                {hasOrders && (
                  <Link
                    to="/reviews"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-[13px] text-ink-600 hover:text-ink-900 transition-colors"
                  >
                    <Star size={16} strokeWidth={1.75} />
                    My reviews
                  </Link>
                )}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={() => { setMobileOpen(false); toggleCart(); }}
                    className="flex items-center gap-2 text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors"
                  >
                    <ShoppingBag size={16} strokeWidth={1.75} />
                    Cart {totalItems > 0 && `(${totalItems})`}
                  </button>
                </div>
                {siteSettings.showAnnouncementBar && announcementText && (
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ink-300 pt-2">
                    {announcementText}
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ SEARCH OVERLAY ══ */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ══ CART DRAWER ══ */}
      <CartDrawer />
    </>
  );
}