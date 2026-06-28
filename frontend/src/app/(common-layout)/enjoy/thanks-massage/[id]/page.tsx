import type { Metadata } from 'next';
import { Suspense } from 'react';
import OrderCompleteRoute from './OrderCompleteRoute';

export const metadata: Metadata = {
  title: 'Order Confirmed — Thank You!',
  description: 'Your order has been placed successfully. View your order details.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense>
      <OrderCompleteRoute />
    </Suspense>
  );
}
