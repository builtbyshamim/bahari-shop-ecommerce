import type { Metadata } from 'next';
import OrderTrackingClient from './OrderTrackingClient';

export const metadata: Metadata = {
  title: 'Order Tracking — অর্ডার ট্র্যাক করুন',
  description: 'আপনার ইনভয়েস নম্বর দিয়ে অর্ডারের বর্তমান অবস্থান ট্র্যাক করুন।',
  openGraph: {
    title: 'Order Tracking | Bahari Shop',
    description: 'ইনভয়েস নম্বর দিয়ে অর্ডার ট্র্যাক করুন।',
    url: '/pages/order-tracking',
  },
};

export default function Page() {
  return <OrderTrackingClient />;
}
