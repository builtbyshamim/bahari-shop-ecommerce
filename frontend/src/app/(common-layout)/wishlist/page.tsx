import type { Metadata } from 'next';
import WishlistPublicPage from '@/features/wishlist/Wishlist';

export const metadata: Metadata = {
  title: 'Wishlist — পছন্দের তালিকা',
  description: 'আপনার পছন্দের পণ্যগুলো এক জায়গায় দেখুন এবং কার্টে যোগ করুন।',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <WishlistPublicPage />;
}
