import type { Metadata } from 'next';
import CheckoutPage from '@/features/enjoy/CheckoutPage';

export const metadata: Metadata = {
  title: 'Checkout — অর্ডার দিন',
  description: 'আপনার ডেলিভারি ঠিকানা ও পেমেন্ট তথ্য দিয়ে অর্ডার সম্পন্ন করুন।',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CheckoutPage />;
}
