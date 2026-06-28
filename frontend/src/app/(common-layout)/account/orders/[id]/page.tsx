import type { Metadata } from 'next';
import OrderDetailsPage from '@/features/account/OrderDetailsPage';

export const metadata: Metadata = {
  title: 'Order Details — অর্ডার বিস্তারিত',
  description: 'আপনার অর্ডারের সম্পূর্ণ বিস্তারিত দেখুন।',
  robots: { index: false, follow: false },
};

export default async function Page({ params }: any) {
  const { id } = await params;
  return <OrderDetailsPage id={id} />;
}
