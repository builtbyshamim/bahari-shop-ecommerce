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
  title: 'Bahari Shop — সেরা দামে সেরা পণ্য',
  description:
    'Bahari Shop হোমপেজে আসুন। টপ ডিল, নতুন পণ্য, বেস্ট সেলিং পণ্য একসাথে পাচ্ছেন সেরা দামে।',
  openGraph: {
    title: 'Bahari Shop — সেরা দামে সেরা পণ্য',
    description: 'টপ ডিল, নতুন পণy, বেস্ট সেলিং পণy एकसाथे पाच्छेन सेरा दामे।',
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
