import type { Metadata } from 'next';
import CategorySection from '@/features/home/CategorySection';
import HeroSection from '@/features/home/HereSection';
import ProductsGrid from '@/features/home/Productsgrid';
import TestimonialSection from '@/features/home/TestimonialSection';
import GallerySection from '@/features/home/GallerySection';
import TopDeals from '@/features/home/TopDeals';
import FeatureTypeSection from '@/features/home/FeatureTypeSection';
import BlogSection from '@/features/home/BlogSection';

export const metadata: Metadata = {
  title: 'Bahari Shop — Best Products at Best Prices',
  description:
    'Visit Bahari Shop homepage. Top deals, new arrivals, and best-selling products at the best prices.',
  openGraph: {
    title: 'Bahari Shop — Best Products at Best Prices',
    description: 'Top deals, new arrivals and best sellers all in one place — Bahari Shop.',
    url: '/',
  },
};

export default function Home() {
  return (
    <div className="bg-[#FBF8F3]">
      <HeroSection />
      <CategorySection />
      <TopDeals />
      <FeatureTypeSection />
      <ProductsGrid />
      <TestimonialSection />
      <GallerySection />
      <BlogSection />
    </div>
  );
}
