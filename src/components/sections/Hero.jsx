import { Banknote, Truck } from 'lucide-react';

import { HERO_IMAGE_URL } from '../../constants/media';
import { useAdminStore } from '../../store/useAdminStore';

export default function Hero() {
  const siteSettings = useAdminStore((s) => s.siteSettings);
  const titleLines = (siteSettings.heroTitle?.trim() || 'زادي\nاختياراتك اليومية')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const eyebrow = siteSettings.tagline?.trim() || 'اختيارات ذكية لحياة يومية أسهل';
  const subtitle = siteSettings.heroSubtitle?.trim()
    || 'منتجات عملية ومختارة بعناية، مع توصيل سريع إلى جميع أنحاء المغرب.';

  return (
    <section
      id="hero"
      aria-label="زادي"
      className="relative isolate flex h-[100svh] min-h-[100svh] overflow-hidden bg-[#050505] font-zain text-white"
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
        <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.82)_38%,rgba(5,5,5,0.36)_72%,rgba(5,5,5,0.58)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(0deg,#050505_0%,rgba(5,5,5,0.72)_38%,rgba(5,5,5,0)_100%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-end px-5 pb-9 pt-24 sm:px-8 sm:pb-12 lg:px-12 lg:pb-14">
        <div className="hero-copy ml-auto w-full max-w-[820px] text-right">
          <p className="mb-4 inline-flex items-center border-r-2 border-[#d9dfff] pr-3 text-[15px] font-black leading-6 text-white/78 sm:text-[17px]">
            {eyebrow}
          </p>

          <h1
            className="hero-display max-w-[820px] font-lalezar text-[58px] font-black leading-[0.94] text-white sm:text-[78px] lg:text-[96px] xl:text-[108px]"
            aria-label={titleLines.join(' ')}
          >
            {titleLines.map((line, index) => (
              <span key={line} className={index === 0 ? 'block' : 'mt-1 block text-white/88'}>
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-5 max-w-[650px] text-[18px] font-extrabold leading-8 text-white/78 sm:mt-6 sm:text-[21px] sm:leading-9">
            {subtitle}
          </p>

          <div className="mt-6 flex flex-col gap-5 sm:mt-7 sm:flex-row sm:items-center">
            <a
              href="#featured-products"
              id="hero-cta-shop"
              className="hero-marquee-button inline-flex h-14 w-full items-center overflow-hidden rounded-full border border-solid border-white/55 bg-[#d9dfff] font-zain text-[18px] font-black text-[#24204f] shadow-[0_14px_36px_rgba(119,132,255,0.2)] transition-[transform,background-color] duration-300 ease-expo hover:-translate-y-0.5 hover:bg-white sm:w-[360px]"
            >
              <span className="hero-marquee-track" aria-hidden="true">
                {[0, 1].map((group) => (
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

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-bold text-white/72 sm:text-[14px]">
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
