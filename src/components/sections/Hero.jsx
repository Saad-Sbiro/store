import { useEffect, useRef } from 'react';
import { Banknote, Truck } from 'lucide-react';

import { HERO_IMAGE_URL } from '../../constants/media';
import { useAdminStore } from '../../store/useAdminStore';
import wordmarkLogo from '../../assets/zadinoback.png';

export default function Hero() {
  const sectionRef = useRef(null);
  const siteSettings = useAdminStore((s) => s.siteSettings);
  const titleLines = (siteSettings.heroTitle?.trim() || 'زادي\nاختياراتك اليومية')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const hasZadi = titleLines[0] === 'زادي';
  const remainingLines = hasZadi ? titleLines.slice(1) : titleLines;
  const finalTitleLines = remainingLines.length > 0 ? remainingLines : ['اختياراتك اليومية'];
  const eyebrow = siteSettings.tagline?.trim() || 'اختيارات ذكية لحياة يومية أسهل';
  const subtitle = siteSettings.heroSubtitle?.trim()
    || 'منتجات عملية ومختارة بعناية، مع توصيل سريع إلى جميع أنحاء المغرب.';

  // Use JS-measured innerHeight — the only 100% reliable way to get
  // the true visible viewport height across all browsers/devices.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const setHeight = () => {
      el.style.height = `${window.innerHeight}px`;
      el.style.minHeight = `${window.innerHeight}px`;
    };

    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="زادي"
      className="relative isolate flex overflow-hidden bg-[#050505] font-zain text-white"
      style={{ height: '100vh', minHeight: '100vh' }}
      dir="rtl"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <img
          src={HERO_IMAGE_URL}
          alt=""
          className="hero-media h-full w-full object-cover object-[64%_42%] sm:object-center"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(0deg,rgba(5,5,5,0.85)_0%,rgba(5,5,5,0.4)_50%,rgba(5,5,5,0)_100%)]" />
      </div>

      {/* Extra top gradient for title readability */}
      <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(5,5,5,0.55)_0%,rgba(5,5,5,0)_100%)]" aria-hidden="true" />

      <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-5 pb-9 pt-24 sm:px-8 sm:pb-12 lg:px-12 lg:pb-14">

        {/* ── TOP: eyebrow + headline ── */}
        <div className="hero-copy mx-auto w-full max-w-[820px] text-center flex flex-col items-center">
          <p className="mb-4 inline-flex items-center border-x border-[#d9dfff]/30 px-4 text-[15px] font-black leading-6 text-white/78 sm:text-[17px]">
            {eyebrow}
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            <img
              src={wordmarkLogo}
              alt="زادي"
              className="h-28 sm:h-36 md:h-40 lg:h-48 w-auto object-contain brightness-0 invert"
              fetchPriority="high"
            />
            <h1
              className="hero-display -mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20 text-[48px] font-bold leading-[0.94] text-white sm:text-[68px] lg:text-[86px] xl:text-[96px]"
              style={{ fontFamily: '"Aref Ruqaa", serif' }}
              aria-label={finalTitleLines.join(' ')}
            >
              {finalTitleLines.map((line) => (
                <span key={line} className="block mt-1">
                  {line}
                </span>
              ))}
            </h1>
          </div>
        </div>

        {/* ── BOTTOM: subtitle + CTA + trust badges ── */}
        <div className="hero-copy ml-auto w-full max-w-[820px] text-right" style={{ animationDelay: '120ms' }}>
          <p className="max-w-[650px] text-[18px] font-extrabold leading-8 text-white/78 sm:text-[21px] sm:leading-9">
            {subtitle}
          </p>

          <div className="mt-6 flex flex-col gap-5 sm:mt-7 sm:flex-row sm:items-center">
            <a
              href="#featured-products"
              id="hero-cta-shop"
              className="hero-marquee-button inline-flex h-14 w-full items-center overflow-hidden rounded-full border border-solid border-white/55 bg-[#d9dfff] font-zain text-[18px] font-black text-[#24204f] shadow-[0_14px_36px_rgba(119,132,255,0.2)] transition-transform duration-300 ease-expo hover:scale-105 sm:w-[360px]"
            >
              <span className="hero-marquee-track" aria-hidden="true">
                {[0, 1, 2].map((group) => (
                  <span key={group} className="hero-marquee-group">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <span key={`${group}-${index}`} className="hero-marquee-item" dir="rtl">
                        اكتشف منتجات زادي
                        <span className="hero-marquee-dot">{'\u2022'}</span>
                      </span>
                    ))}
                  </span>
                ))}
              </span>
              <span className="sr-only">اكتشف منتجات زادي</span>
            </a>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-bold text-white/72 sm:text-[14px]">
              <span className="inline-flex items-center gap-2">
                <Truck size={17} strokeWidth={2} aria-hidden="true" />
                توصيل لكل المغرب
              </span>
              <span className="inline-flex items-center gap-2">
                <Banknote size={17} strokeWidth={2} aria-hidden="true" />
                الدفع عند الاستلام
              </span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
