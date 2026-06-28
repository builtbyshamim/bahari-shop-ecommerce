'use client';

import { useRef, useEffect } from 'react';
import { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import ProductCard from '@/components/ui/card/Productcard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Props {
  products: any[];
}

const PAGINATION_CLASS = 'feature-type-slider-pagination';

const FeatureTypeSlider = ({ products }: Props) => {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperClass | null>(null);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || !paginationRef.current) return;

    if (swiper.params.pagination && typeof swiper.params.pagination === 'object') {
      swiper.params.pagination.el = paginationRef.current;
    }
    swiper.pagination.init();
    swiper.pagination.render();
    swiper.pagination.update();
  }, []);

  return (
    <div className="relative group/swiper py-3">
      <button
        ref={prevRef}
        aria-label="Previous"
        className="absolute left-5 top-1/2 -translate-y-1/2 z-10 bg-primary-500 shadow-lg rounded-full p-2 text-white  transition-all duration-300 opacity-0 group-hover/swiper:opacity-100 cursor-pointer -translate-x-1/2 hover:scale-110"
      >
        <FaChevronLeft className="text-sm md:text-base" />
      </button>

      <button
        ref={nextRef}
        aria-label="Next"
        className="absolute right-5 top-1/2 -translate-y-1/2 z-10 bg-primary-500 shadow-lg rounded-full p-2 text-white  transition-all duration-300 opacity-0 group-hover/swiper:opacity-100 cursor-pointer translate-x-1/2 hover:scale-110"
      >
        <FaChevronRight className="text-sm md:text-base" />
      </button>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={4}
        slidesPerView={2}
        pagination={{ clickable: true }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;

          if (swiper.params.navigation && typeof swiper.params.navigation === 'object') {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 4 },
          768: { slidesPerView: 3, spaceBetween: 8 },
          1024: { slidesPerView: 4, spaceBetween: 12 },
          1280: { slidesPerView: 5, spaceBetween: 16 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div ref={paginationRef} className={`${PAGINATION_CLASS} flex justify-center mt-4`} />

      <style jsx global>{`
        .${PAGINATION_CLASS} .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #d1d5db;
          opacity: 1;
          border-radius: 9999px;
          transition:
            width 0.25s ease,
            background 0.25s ease;
          display: inline-block;
          margin: 0 3px !important;
        }
        .${PAGINATION_CLASS} .swiper-pagination-bullet-active {
          width: 24px;
          background: #ea5d0b;
          border-radius: 9999px;
        }
        .swiper-pagination {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default FeatureTypeSlider;
