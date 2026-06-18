import { HERO_IMAGE_URL } from '../../constants/media';
import { useAdminStore } from '../../store/useAdminStore';

export default function Hero() {
  const siteSettings = useAdminStore((s) => s.siteSettings);
  const titleLines = (siteSettings.heroTitle?.trim() || 'Sharper\nSetups')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const eyebrow = siteSettings.tagline?.trim() || 'Curated desk technology';
  const subtitle = siteSettings.heroSubtitle?.trim()
    || 'Quiet tools for focused rooms: stands, docks, lighting, and audio chosen for everyday work.';

  return (
    <section
      id="hero"
      aria-label="Workspace essentials"
      className="relative isolate flex h-[100svh] min-h-[100svh] overflow-hidden bg-[#050505] text-white"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <img
          src={HERO_IMAGE_URL}
          alt=""
          className="hero-media h-full w-full object-cover object-[64%_42%] sm:object-center"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.94)_0%,rgba(5,5,5,0.72)_40%,rgba(5,5,5,0.34)_72%,rgba(5,5,5,0.5)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,#050505_0%,rgba(5,5,5,0.78)_36%,rgba(5,5,5,0)_100%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-end px-5 pb-12 pt-28 sm:px-8 sm:pb-14 lg:px-12 lg:pb-18">
        <div className="hero-copy w-full max-w-[1180px]">
          <p className="mb-5 inline-flex border-l border-white/35 pl-3 text-[11px] font-bold uppercase tracking-[0.24em] text-white/62">
            {eyebrow}
          </p>

          <h1
            className="hero-title-font max-w-[1120px] text-[64px] font-extrabold uppercase leading-[0.88] tracking-normal text-white sm:text-[86px] lg:text-[124px] xl:text-[146px]"
            aria-label={titleLines.join(' ')}
          >
            {titleLines.map((line, index) => (
              <span key={line} className={index === 0 ? 'block' : 'block text-white/82'}>
                {line}
              </span>
            ))}
          </h1>

          <div className="mt-8 grid w-full max-w-[1120px] gap-6 sm:mt-9 md:grid-cols-[minmax(0,620px)_minmax(280px,420px)] md:items-end">
            <div className="min-w-0">
              <p className="max-w-[620px] text-[16px] font-semibold leading-8 text-white/72 sm:text-[18px]">
                {subtitle}
              </p>
            </div>

            <a
              href="#featured-products"
              id="hero-cta-shop"
              className="hero-marquee-button group inline-flex h-[62px] min-h-0 w-full items-center overflow-hidden rounded-[999px] border border-white/55 bg-[#d9dfff] font-hero text-[17px] font-black uppercase tracking-[0.06em] text-[#302a72] shadow-[0_16px_42px_rgba(119,132,255,0.18)] transition-transform duration-300 ease-expo hover:scale-[1.025] md:h-[71px] md:max-w-[420px] md:self-end md:justify-self-end"
            >
              <span className="hero-marquee-track" aria-hidden="true">
                <span className="hero-marquee-group">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <span key={`a-${index}`} className="hero-marquee-item">
                      START YOUR JOURNEY!
                      <span className="hero-marquee-dot">{'\u2022'}</span>
                    </span>
                  ))}
                </span>
                <span className="hero-marquee-group">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <span key={`b-${index}`} className="hero-marquee-item">
                      START YOUR JOURNEY!
                      <span className="hero-marquee-dot">{'\u2022'}</span>
                    </span>
                  ))}
                </span>
              </span>
              <span className="sr-only">Shop essentials</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
