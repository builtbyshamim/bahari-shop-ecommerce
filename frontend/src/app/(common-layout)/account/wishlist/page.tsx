import type { Metadata } from 'next';
import WishlistPage from '@/features/account/WishlistPage';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: 'View your saved wishlist items.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <WishlistPage />;
}
