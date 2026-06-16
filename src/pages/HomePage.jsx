// ─────────────────────────────────────────────
// FILE: src/pages/HomePage.jsx
// ─────────────────────────────────────────────

import Hero from '../components/sections/Hero';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import Categories from '../components/sections/Categories';
import Testimonials from '../components/sections/Testimonials';
import Newsletter from '../components/sections/Newsletter';
import { useAdminStore } from '../store/useAdminStore';

export default function HomePage() {
  const siteSettings = useAdminStore((s) => s.siteSettings);

  return (
    <main id="main-content">
      {siteSettings.showHero && <Hero />}
      {siteSettings.showFeatured && <FeaturedProducts />}
      {(siteSettings.showCategories || siteSettings.showTestimonials) && (
        <div className="relative isolate bg-white">
          {siteSettings.showCategories && <Categories />}
          {siteSettings.showTestimonials && <Testimonials />}
        </div>
      )}
      {siteSettings.showNewsletter && <Newsletter />}
    </main>
  );
}
