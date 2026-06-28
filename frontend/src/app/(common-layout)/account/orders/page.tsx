import type { Metadata } from 'next';
import OrdersPage from '@/features/account/Orders';

export const metadata: Metadata = {
  title: 'My Orders — আমার অর্ডার',
  description: 'আপনার সব অর্ডারের তালিকা ও স্ট্যাটাস দেখুন।',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OrdersPage />;
}
