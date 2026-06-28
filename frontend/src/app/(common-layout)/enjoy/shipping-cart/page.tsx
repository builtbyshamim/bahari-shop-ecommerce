import type { Metadata } from 'next';
import ShippingCartPage from '@/features/enjoy/ShippingCart';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'View your shopping cart and proceed to checkout.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ShippingCartPage />;
}
