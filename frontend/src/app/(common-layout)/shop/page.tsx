import type { Metadata } from 'next';
import ShopPage from '@/features/shops/Shops';

export const metadata: Metadata = {
  title: 'Shop — All Products',
  description:
    'Find electronics, fashion, home goods and thousands more items at Bahari Shop. Filter by category, price and brand.',
  openGraph: {
    title: 'Shop | Bahari Shop',
    description: 'All categories in one place — Bahari Shop.',
    url: '/shop',
  },
};

export default function Page() {
  return <ShopPage />;
}
