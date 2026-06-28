import type { Metadata } from 'next';
import OrderTrackingClient from './OrderTrackingClient';

export const metadata: Metadata = {
  title: 'Order Tracking',
  description: 'Track the current status of your order using your invoice number.',
  openGraph: {
    title: 'Order Tracking | Bahari Shop',
    description: 'Track your order using your invoice number.',
    url: '/pages/order-tracking',
  },
};

export default function Page() {
  return <OrderTrackingClient />;
}
