import type { Metadata } from 'next';
import { Suspense } from 'react';
import OrderCompleteRoute from './OrderCompleteRoute';

export const metadata: Metadata = {
  title: 'Order Confirmed — ধন্যবাদ!',
  description: 'আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে। অর্ডারের বিস্তারিত দেখুন।',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense>
      <OrderCompleteRoute />
    </Suspense>
  );
}
