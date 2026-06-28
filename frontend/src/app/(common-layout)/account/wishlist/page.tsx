import type { Metadata } from 'next';
import WishlistPage from '@/features/account/WishlistPage';

export const metadata: Metadata = {
  title: 'My Wishlist — পছন্দের তালিকা',
  description: 'আপনার সেভ করা পছন্দের পণ্যগুলো দেখুন।',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <WishlistPage />;
}
