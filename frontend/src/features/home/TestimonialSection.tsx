'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { FaStar } from 'react-icons/fa';
import { useGetPublicTestimonialsQuery } from '@/redux/api/testimonialsApi';

// ─── Color gradients (index → CSS) ───────────────────────────
const GRADIENTS = [
  'from-orange-500 to-red-500',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-indigo-500 to-blue-600',
  'from-teal-500 to-cyan-500',
  'from-red-500 to-orange-600',
  'from-sky-500 to-blue-500',
  'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-500',
];

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  avatarInitials: string | null;
  avatarUrl: string | null;
  rating: number;
  review: string;
  productLabel: string | null;
  colorIndex: number;
}

// ─── Star rating ──────────────────────────────────────────────
const StarRating = ({ count }: { count: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} size={12} className={i < count ? 'text-amber-400' : 'text-gray-200'} />
    ))}
  </div>
);

// ─── Skeleton card ────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col gap-4 animate-pulse min-h-[220px]">
    <div className="flex items-center justify-between">
      <div className="w-8 h-8 rounded-full bg-gray-200" />
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-gray-200" />
        ))}
      </div>
    </div>
    <div className="space-y-2 flex-1">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-4/6" />
    </div>
    <div className="h-px bg-gray-100" />
    <div className="flex items-center gap-3 mt-auto">
      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
      <div className="space-y-1.5">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-2.5 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

// ─── Single testimonial card ──────────────────────────────────
const TestimonialCard = ({ t }: { t: Testimonial }) => {
  const gradient = GRADIENTS[t.colorIndex % GRADIENTS.length];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col gap-3 min-h-[220px] hover:shadow-md transition-shadow duration-300">
      {/* Quote icon + stars */}
      <div className="flex items-center justify-between">
        {/* Large orange quote mark */}
        <span className="text-4xl font-serif leading-none text-orange-500 select-none">
          &ldquo;
        </span>
        <StarRating count={t.rating} />
      </div>

      {/* Review text */}
      <p className="text-[13px] text-gray-600 leading-relaxed flex-1 -mt-1">{t.review}</p>

      {/* Product label */}
      {t.productLabel && (
        <p className="text-[12px] font-medium text-orange-500">{t.productLabel}</p>
      )}

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Customer info */}
      <div className="flex items-center gap-3 mt-auto">
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden`}
        >
          {t.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
          ) : (
            (t.avatarInitials ?? t.name.slice(0, 2).toUpperCase())
          )}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-800 leading-tight">{t.name}</p>
          {t.location && <p className="text-[11px] text-gray-400 mt-0.5">{t.location}</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Main section ─────────────────────────────────────────────
const TestimonialSection = () => {
  const { data, isLoading } = useGetPublicTestimonialsQuery();
  const testimonials: Testimonial[] = data?.data || [];

  if (!isLoading && testimonials.length === 0) return null;

  return (
    <section className="w-full bg-[#f9f7f4] py-10 md:py-14 overflow-hidden">
      <div className="container">
        {/* Header */}

        <div className="flex justify-between items-center border-b border-[#D5D5D5] pb-2 mb-8">
          <h2 className="text-xl md:text-2xl text-black-900 font-semibold uppercase tracking-tight">
            What Our Customers Say
          </h2>
        </div>
        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={700}
            loop={testimonials.length > 3}
            pagination={{ el: '.testimonial-pagination', clickable: true }}
            slidesPerView={1}
            spaceBetween={16}
            breakpoints={{
              560: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
            }}
            className="w-full pb-10"
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t.id} className="h-auto self-stretch">
                <TestimonialCard t={t} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Pagination dots */}
        {!isLoading && <div className="testimonial-pagination flex justify-center gap-2 mt-2" />}
      </div>
    </section>
  );
};

export default TestimonialSection;
