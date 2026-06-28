import type { Metadata } from 'next';
import ShippingCartPage from '@/features/enjoy/ShippingCart';

export const metadata: Metadata = {
  title: 'Shopping Cart — কার্ট',
  description: 'আপনার শপিং কার্ট দেখুন এবং চেকআউট করুন।',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ShippingCartPage />;
}
