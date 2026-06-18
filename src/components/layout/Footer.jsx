// ─────────────────────────────────────────────
// FILE: src/components/layout/Footer.jsx
// ─────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import logoImg from '../../assets/logo.png';

const SHOP_LINKS = [
  { label: 'All Products', href: '/shop' },
  { label: 'Desk Accessories', href: '/shop?category=Desk+Accessories' },
  { label: 'Peripherals', href: '/shop?category=Peripherals' },
  { label: 'Audio', href: '/shop?category=Audio' },
  { label: 'Lighting', href: '/shop?category=Lighting' },
  { label: 'Connectivity', href: '/shop?category=Connectivity' },
];
const HELP_LINKS = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Shipping & Returns', href: '/contact' },
  { label: 'My Reviews', href: '/reviews' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQ', href: '/contact' },
];

// Inline SVG social icons, no lucide-react version dependency
const SocialIcons = {
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Pinterest: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.76 1.24-5.26 1.24-5.26s-.32-.63-.32-1.56c0-1.47.85-2.56 1.91-2.56.9 0 1.34.68 1.34 1.49 0 .91-.58 2.27-.88 3.53-.25 1.05.52 1.91 1.55 1.91 1.86 0 3.29-1.96 3.29-4.79 0-2.5-1.8-4.25-4.37-4.25-2.98 0-4.72 2.23-4.72 4.54 0 .9.35 1.86.78 2.38.09.1.1.19.07.3-.08.33-.25 1.05-.29 1.2-.05.19-.16.23-.38.14C5.9 15.24 5 13.6 5 12.1c0-3.36 2.44-6.45 7.04-6.45 3.7 0 6.57 2.64 6.57 6.16 0 3.67-2.31 6.62-5.52 6.62-1.08 0-2.09-.56-2.44-1.22l-.66 2.48c-.24.92-.88 2.07-1.31 2.77.99.31 2.04.47 3.12.47 5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
    </svg>
  ),
};

export default function Footer() {
  const siteSettings = useAdminStore((s) => s.siteSettings);
  const storeName = siteSettings.storeName?.trim() || 'CUTPORTAL';
  const tagline = siteSettings.tagline?.trim()
    || 'Workspace essentials, smart devices, and refined tech gear for cleaner daily setups.';
  const social = [
    { Icon: SocialIcons.Instagram, label: 'Instagram', href: siteSettings.footerInstagram || '#' },
    { Icon: SocialIcons.Twitter,   label: 'Twitter',   href: siteSettings.footerTwitter || '#' },
    { Icon: SocialIcons.Pinterest, label: 'Pinterest',  href: siteSettings.footerPinterest || '#' },
  ];

  return (
    <footer className="bg-ink-900 text-surface-200" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" id="footer-logo" className="flex items-center gap-0.5 mb-4">
              <img src={logoImg} alt="Cutportal Logo" className="h-7 w-auto object-contain brightness-0 invert -translate-y-[1.5px]" draggable="false" />
              <span className="font-clash font-black text-2xl text-white hover:text-brand-400 transition-colors duration-200 uppercase">
                ut portal
              </span>
            </Link>
            <p className="text-caption text-ink-400 leading-relaxed max-w-[240px]">
              {tagline}
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {social.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  id={`footer-social-${label.toLowerCase()}`}
                  aria-label={label}
                  className="w-9 h-9 rounded-btn flex items-center justify-center border border-white/10 text-ink-400 hover:text-white hover:border-white/30 transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-nav font-semibold text-white uppercase tracking-widest mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    id={`footer-shop-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-caption text-ink-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={11}
                      className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="text-nav font-semibold text-white uppercase tracking-widest mb-4">
              Help
            </h3>
            <ul className="space-y-3">
              {HELP_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    id={`footer-help-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-caption text-ink-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={11}
                      className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-nav font-semibold text-white uppercase tracking-widest mb-4">
              Stay in the Loop
            </h3>
            <p className="text-caption text-ink-400 mb-4 leading-relaxed">
              New arrivals, setup notes, and early access - delivered weekly.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-2"
              aria-label="Newsletter signup"
            >
              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-btn bg-white/5 border border-white/10 text-caption text-white placeholder-ink-400 focus:outline-none focus:border-brand-400 focus:bg-white/10 transition-all duration-200"
                required
              />
              <button
                id="footer-newsletter-submit"
                type="submit"
                className="w-full h-10 rounded-btn bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-btn font-medium transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-caption text-ink-400">
            Copyright {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-end">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((label) => (
              <Link
                key={label}
                to="/"
                id={`footer-legal-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-caption text-ink-400 hover:text-white transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}