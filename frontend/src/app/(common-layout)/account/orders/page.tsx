import type { Metadata } from 'next';
import OrdersPage from '@/features/account/Orders';

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'View all your orders and their status.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OrdersPage />;
}
