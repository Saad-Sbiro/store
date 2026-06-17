// ─────────────────────────────────────────────
// FILE: src/App.jsx
// ─────────────────────────────────────────────

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ShopPage from './pages/ShopPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import WishlistPage from './pages/WishlistPage';
import Toaster from './components/ui/Toast';
import SplashScreen from './components/ui/SplashScreen';
import AdminApp from './admin/AdminApp';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import { useAdminStore } from './store/useAdminStore';
import TopLoader from './components/ui/TopLoader';
import { TooltipProvider } from './components/ui/Tooltip';

const normalizeHex = (value) => {
  if (typeof value !== 'string') return '#6366f1';
  const hex = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return '#6366f1';
};

const mixHex = (from, to, amount) => {
  const a = normalizeHex(from).slice(1).match(/.{2}/g).map((part) => parseInt(part, 16));
  const b = normalizeHex(to).slice(1).match(/.{2}/g).map((part) => parseInt(part, 16));
  const mixed = a.map((channel, index) => Math.round(channel + (b[index] - channel) * amount));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
};

// Scroll to top on route change
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;

      const navOffset = 92;
      const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'instant' });
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

// Visitor tracker — always called, safe to use hook unconditionally
function VisitorTracker() {
  useVisitorTracking();
  return null;
}

function RouteTopLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 520);
    return () => clearTimeout(timeout);
  }, [location.pathname, location.search]);

  return <TopLoader isLoading={loading} color="var(--site-accent-500)" />;
}

function SiteSettingsBridge() {
  const accentColor = useAdminStore((s) => s.siteSettings.accentColor);

  useEffect(() => {
    const accent = normalizeHex(accentColor);
    const root = document.documentElement;

    root.style.setProperty('--site-accent-50', mixHex(accent, '#ffffff', 0.92));
    root.style.setProperty('--site-accent-100', mixHex(accent, '#ffffff', 0.82));
    root.style.setProperty('--site-accent-400', mixHex(accent, '#ffffff', 0.24));
    root.style.setProperty('--site-accent-500', accent);
    root.style.setProperty('--site-accent-600', mixHex(accent, '#000000', 0.14));
    root.style.setProperty('--site-accent-700', mixHex(accent, '#000000', 0.24));
  }, [accentColor]);

  return null;
}

// Storefront layout (with Navbar + Footer)
function StoreFront() {
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <SplashScreen />
        <VisitorTracker />
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Routes>
        </AnimatePresence>
        <Footer />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteSettingsBridge />
      <RouteTopLoader />
      <ScrollToTop />
      <Routes>
        {/* Admin dashboard — completely separate layout */}
        <Route path="/admin/*" element={<AdminApp />} />
        {/* Main storefront */}
        <Route path="/*" element={<StoreFront />} />
      </Routes>
    </BrowserRouter>
  );
}
