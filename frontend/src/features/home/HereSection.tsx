'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetPublicBannersQuery } from '@/redux/api/bannerApi';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const FALLBACK_SLIDERS = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=1200',
    link: '/shop',
    title: 'Premium Date Collection',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1200',
    link: '/shop',
    title: 'Fresh Arrivals',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=1200',
    link: '/shop',
    title: 'Natural Honey',
  },
];

const FALLBACK_SIDE = {
  id: 'side',
  imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600',
  link: '/shop',
  title: 'Pure Wildflower Honey — 100% Natural',
};

// ─── Slider Slide ─────────────────────────────────────────────────────────────
const SliderBanner = ({ banner }: { banner: any }) => {
  const inner = (
    <div className="relative w-full h-[220px] sm:h-[300px] md:h-[360px] lg:h-[420px] overflow-hidden group">
      <Image
        src={banner.imageUrl}
        alt={banner.title || 'banner'}
        fill
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover group-hover:scale-105 transition-transform duration-700"
        priority
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {banner.title && (
        <div className="absolute bottom-5 left-5 right-5">
          <span className="inline-block backdrop-blur-sm bg-primary-500 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm  font-normal sm:font-semibold shadow">
            {banner.title}
          </span>
        </div>
      )}
    </div>
  );

  return banner.link ? (
    <Link href={banner.link} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
};

// ─── Fixed Side Banner ────────────────────────────────────────────────────────
const SideBanner = ({ banner }: { banner: any }) => {
  const inner = (
    <div className="relative w-full h-[220px] sm:h-[300px] md:h-[360px] lg:h-[420px] rounded-2xl overflow-hidden group cursor-pointer">
      <Image
        src={banner.imageUrl}
        alt={banner.title || 'side banner'}
        fill
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="object-cover group-hover:scale-105 transition-transform duration-700"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      {banner.title && (
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-white text-lg sm:text-2xl font-bold drop-shadow-lg leading-tight mb-2">
            {banner.title}
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-white/90 font-medium border border-white/50 rounded-full px-3 py-1 hover:bg-white/20 transition-colors">
            Shop Now <ChevronRight size={12} />
          </span>
        </div>
      )}
    </div>
  );

  return banner.link ? (
    <Link href={banner.link} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
};

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HeroSection = () => {
  const { data } = useGetPublicBannersQuery();

  const sliders = data?.data?.sliders?.length ? data.data.sliders : FALLBACK_SLIDERS;
  const sideBanner = data?.data?.side ?? FALLBACK_SIDE;

  return (
    <section className="w-full bg-[#f8f7f4] overflow-hidden">
      <div className="container py-4 md:py-5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* ── LEFT: Swiper (full width on mobile, 3/5 cols on lg) ── */}
          <div className="lg:col-span-3 relative">
            <button className="hero-prev absolute left-0.5 sm:left-5 top-1/2 -translate-y-1/2 z-20 group">
              <div className="relative flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-full border border-white/10 bg-black/25 backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-primary-500 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

                <ChevronLeft
                  size={20}
                  className="relative z-8 sm:z-10 text-white transition-all duration-300"
                />
              </div>
            </button>

            <button className="hero-next absolute  right-0.5 sm:right-5 top-1/2 -translate-y-1/2 z-20 group">
              <div className="relative flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-full border border-white/10 bg-black/25 backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-primary-500 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

                <ChevronRight
                  size={20}
                  className="relative z-8 sm:z-10 text-white transition-all duration-300"
                />
              </div>
            </button>

            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              speed={700}
              loop={sliders.length > 1}
              navigation={{ prevEl: '.hero-prev', nextEl: '.hero-next' }}
              pagination={{ el: '.hero-pagination', clickable: true }}
              className="rounded-2xl overflow-hidden w-full"
            >
              {sliders.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <SliderBanner banner={slide} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Pagination dots */}
            <div className="hero-pagination flex justify-center gap-2 mt-3" />
          </div>

          {/* ── RIGHT: Fixed side banner (2/5 cols) — hidden on mobile ── */}
          <div className="hidden lg:block lg:col-span-2">
            <SideBanner banner={sideBanner} />
          </div>
        </div>
      </div>

      {/* Swiper dot styles */}
      <style jsx global>{`
        .hero-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #ea5d0b;
          opacity: 1;
          transition:
            background 0.2s,
            transform 0.2s;
        }
        .hero-pagination .swiper-pagination-bullet-active {
          background: #ea5d0b;
          transform: scale(1.35);
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
