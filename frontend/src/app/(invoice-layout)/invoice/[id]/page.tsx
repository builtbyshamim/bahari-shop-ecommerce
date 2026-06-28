import type { Metadata } from 'next';
import OrderInvoice from '@/features/invoice/OrderInvoice';

export const metadata: Metadata = {
  title: 'Invoice',
  robots: { index: false, follow: false },
};

export default async function Page({ params }: any) {
  const { id } = await params;
  return <OrderInvoice id={id} />;
}
