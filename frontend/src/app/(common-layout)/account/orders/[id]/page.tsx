import type { Metadata } from 'next';
import OrderDetailsPage from '@/features/account/OrderDetailsPage';

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View the full details of your order.',
  robots: { index: false, follow: false },
};

export default async function Page({ params }: any) {
  const { id } = await params;
  return <OrderDetailsPage id={id} />;
}
