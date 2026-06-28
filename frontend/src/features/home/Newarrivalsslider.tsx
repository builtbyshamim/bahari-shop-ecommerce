"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import TopRankingProductCard from "@/components/ui/card/TopRankingProductCard";

import "swiper/css";
import "swiper/css/navigation";

interface NewArrivalsSliderProps {
  products: any[];
}

const NewArrivalsSlider = ({ products }: NewArrivalsSliderProps) => {
  const navigationPrevRef = useRef<HTMLButtonElement>(null);
  const navigationNextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="py-3 relative group/swiper overflow-hidden">
      {/* Custom Navigation Buttons */}
      <button
        ref={navigationPrevRef}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 text-black-800 hover:text-primary-600 transition-all duration-300 opacity-0 group-hover/swiper:opacity-100 cursor-pointer -translate-x-1/2 hover:scale-110"
        aria-label="Previous slide"
      >
        <FaChevronLeft className="text-sm md:text-base" />
      </button>

      <button
        ref={navigationNextRef}
        className="absolute right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 text-black-800 hover:text-primary-600 transition-all duration-300 opacity-0 group-hover/swiper:opacity-100 cursor-pointer translate-x-1/2 hover:scale-110"
        aria-label="Next slide"
      >
        <FaChevronRight className="text-sm md:text-base" />
      </button>

      {/* Swiper Slider */}
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={2}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        onInit={(swiper) => {
          if (
            swiper.params.navigation &&
            typeof swiper.params.navigation === "object"
          ) {
            swiper.params.navigation.prevEl = navigationPrevRef.current;
            swiper.params.navigation.nextEl = navigationNextRef.current;
          }
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 10 },
          768: { slidesPerView: 3, spaceBetween: 10 },
          1024: { slidesPerView: 3, spaceBetween: 10 },
          1280: { slidesPerView: 3, spaceBetween: 10 },
        }}
        className="new-arrivals-swiper"
      >
        {products?.slice(0, 8)?.map((product) => (
          <SwiperSlide key={product.id}>
            <TopRankingProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .new-arrivals-swiper {
          position: relative;
          overflow: visible !important;
        }

        .new-arrivals-swiper .swiper-slide {
          transition: transform 0.3s ease;
        }

        .new-arrivals-swiper .swiper-slide:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default NewArrivalsSlider;