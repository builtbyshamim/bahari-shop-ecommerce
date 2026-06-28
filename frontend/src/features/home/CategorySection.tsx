'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetCategoryTreeQuery } from '@/redux/api/productApi';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  imageUrl?: string;
  image?: string;
  children?: Category[];
}

// ─── Category Card ────────────────────────────────────────────
const CategoryCard = ({ category }: { category: Category }) => {
  const imageUrl = category.imageUrl || category.image;

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="
    block
    group
    w-full
    h-full
    transition-transform
    duration-200
    hover:-translate-y-1
  "
    >
      <div className="flex flex-col items-center gap-2 min-h-[125px]">
        <div
          className="
        relative
        w-20 h-20
        sm:w-24 sm:h-24
        md:w-28 md:h-28
        rounded-xl
        bg-white
        border
        border-gray-200
        flex
        items-center
        justify-center
        overflow-hidden
        transition-all
        duration-200
        group-hover:border-primary-500
        group-hover:shadow-[0_8px_20px_rgba(109,91,186,0.15)]
      "
        >
          <Image
            width={120}
            height={120}
            src={imageUrl || '/placeholder.png'}
            alt={category.name}
            className="object-contain w-[70%] h-[70%]"
          />
        </div>

        <p
          className="
        text-[11px]
        sm:text-xs
        font-medium
        text-gray-700
        text-center
        leading-snug
        line-clamp-2
        w-full
        max-w-[90px]
        sm:max-w-[100px]
        transition-colors
        duration-200
        capitalize
        group-hover:text-primary-600
      "
        >
          {category.name}
        </p>
      </div>
    </Link>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-200 animate-pulse" />
    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
  </div>
);

// ─── Slides per view by breakpoint ───────────────────────────
const getSlidesPerView = (): number => {
  if (typeof window === 'undefined') return 6;

  const w = window.innerWidth;

  if (w >= 1280) return 8;
  if (w >= 1024) return 7;
  if (w >= 768) return 6;
  if (w >= 640) return 5;
  if (w >= 480) return 4;

  return 3;
};

// ─── Main Section ─────────────────────────────────────────────
const CategorySection = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const { data, isLoading } = useGetCategoryTreeQuery({});

  const categories: Category[] = (data?.data || []).filter((cat: Category) => cat.isActive);

  const [needsSlider, setNeedsSlider] = useState(false);

  useEffect(() => {
    const check = () => {
      const perView = getSlidesPerView();
      setNeedsSlider(categories.length > perView);
    };

    check();

    window.addEventListener('resize', check);

    return () => window.removeEventListener('resize', check);
  }, [categories.length]);

  const handleSlideChange = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="w-full py-5 sm:py-6 md:py-8 border-b border-gray-100">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between md:mb-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            SHOP BY CATEGORY
          </h2>

          {needsSlider && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                disabled={isBeginning}
                className={`
                  w-8 h-8
                  flex items-center justify-center
                  rounded-full border transition-all
                  ${
                    isBeginning
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-600 hover:bg-primary-500 hover:text-white hover:border-primary-500'
                  }
                `}
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => swiperRef.current?.slideNext()}
                disabled={isEnd}
                className={`
                  w-8 h-8
                  flex items-center justify-center
                  rounded-full border transition-all
                  ${
                    isEnd
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-600 hover:bg-primary-500 hover:text-white hover:border-primary-500'
                  }
                `}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : needsSlider ? (
          <div className="">
            <Swiper
              modules={[Navigation, Autoplay]}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              onSlideChange={handleSlideChange}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              speed={500}
              loop={false}
              slidesPerView={4}
              spaceBetween={4}
              breakpoints={{
                480: {
                  slidesPerView: 4,
                  spaceBetween: 4,
                },
                640: {
                  slidesPerView: 6,
                  spaceBetween: 6,
                },
                768: {
                  slidesPerView: 7,
                  spaceBetween: 8,
                },
                1024: {
                  slidesPerView: 8,
                  spaceBetween: 10,
                },
                1280: {
                  slidesPerView: 10,
                  spaceBetween: 12,
                },
              }}
              className="w-full"
            >
              {categories.map((cat) => (
                <SwiperSlide key={cat.id} className="!flex justify-center mt-3">
                  <CategoryCard category={cat} />
                </SwiperSlide>
              ))}
            </Swiper>{' '}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 pt-3">
            {categories.map((cat) => (
              <div key={cat.id} className="snap-start flex-shrink-0">
                <CategoryCard category={cat} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
