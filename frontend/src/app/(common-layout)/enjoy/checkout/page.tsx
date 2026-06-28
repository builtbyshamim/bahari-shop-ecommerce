import type { Metadata } from 'next';
import CheckoutPage from '@/features/enjoy/CheckoutPage';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Enter your delivery address and payment details to complete your order.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CheckoutPage />;
}
