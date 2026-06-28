import type { Metadata } from 'next';
import WishlistPublicPage from '@/features/wishlist/Wishlist';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'View your saved items in one place and add them to your cart.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <WishlistPublicPage />;
}
