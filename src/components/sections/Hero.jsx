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
      className="relative isolate flex h-[100svh] min-h-[620px] overflow-hidden bg-[#050505] text-white"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <img
          src={HERO_IMAGE_URL}
          alt=""
          className="hero-media h-full w-full object-cover object-[64%_42%] sm:object-center"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.92)_0%,rgba(5,5,5,0.68)_42%,rgba(5,5,5,0.32)_72%,rgba(5,5,5,0.48)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,#050505_0%,rgba(5,5,5,0.78)_36%,rgba(5,5,5,0)_100%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-end px-5 pb-10 pt-28 sm:px-8 sm:pb-12 lg:px-12 lg:pb-16">
        <div className="hero-copy w-full max-w-[1120px]">
          <p className="mb-4 inline-flex border-l border-white/35 pl-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/58">
            {eyebrow}
          </p>

          <h1 className="font-hero text-[clamp(3.15rem,11.5vw,9.5rem)] font-bold uppercase leading-[0.86] tracking-[-0.065em] text-white">
            {titleLines.map((line, index) => (
              <span key={line} className={index === 0 ? 'block' : 'block text-white/72'}>
                {line}
              </span>
            ))}
          </h1>

          <div className="mt-7 grid w-full max-w-[1080px] gap-5 sm:mt-8 md:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] md:items-end lg:max-w-[1120px]">
            <div className="flex min-w-0 flex-col justify-between">
              <p className="max-w-[520px] text-[15px] leading-7 text-white/64 sm:text-[17px]">
                {subtitle}
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/46 sm:mt-7">
                {['Desk', 'Audio', 'Lighting', 'Connectivity'].map((item) => (
                  <span key={item} className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-2.5">
                    {item}
                  </span>
                ))}
              </div>
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
